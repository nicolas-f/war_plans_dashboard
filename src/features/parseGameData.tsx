;

/*
 * Copyright (C) 2025
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { fs, ZipEntry, ZipFileEntry } from '@zip.js/zip.js';
import { Entity } from '@/model/entity';
import { GameDatabase } from '@/model/gameDatabase';

const { FS } = fs;
const typePrepend = "$TYPE_";

function createZipFileSystem() {
  return new FS();
}

function parseEntity(entity : Entity, lines : string[]) {
  for(const line of lines) {
    const trimmedLine = line.trim()
    if(trimmedLine.length > 0) {
      entity.attributes.push(trimmedLine)
    }
  }
}

function parseIniFile(name : string, lines : string[], db : GameDatabase) {
  let index = 0
  for(const line of lines) {
    if(line.trim().startsWith(typePrepend)) {
      const entity = new Entity(name, line.substring(typePrepend.length))
      parseEntity(entity, lines.slice(index))
      db.entities[name] = entity
      //console.log(db[name]);
      break
    }
    index += 1
  }
}

function parseTranslationFile(name : string, data : Uint8Array, db : GameDatabase) {
  const textDecoder = new TextDecoder('UTF-16BE', { fatal: true });
  const headerSize = 12
  const entrySize = 10
  const dataView = new DataView(data.buffer, 0)
  const nbRecords = dataView.getUint32(0, false)
  if (!db.translations[name]) {
    db.translations[name] = {};
  }
  for (let index = 0; index < nbRecords; index++) {
    const entryIndex = headerSize + index * entrySize
    const id = dataView.getUint32(entryIndex, false)
    const location = dataView.getUint32(entryIndex + 4, false)
    const length = dataView.getUint16(entryIndex + 8, false);
    const stringLocation = headerSize + entrySize * nbRecords + location * 2
    const stringData = data.slice(stringLocation, stringLocation + 2 * length);
    const text = textDecoder.decode(stringData);
    db.translations[name][id] = text;
  }
}

export async function parseZipEntries(entries: [ZipEntry]): Promise<GameDatabase> {
  console.debug("Parsing zip entries..")
  const gameDatabase = new GameDatabase()
  for (const entry of entries) {
    if(!entry.data?.directory) {
      const fileEntry = entry as ZipFileEntry<any, any>;
      const extension = entry.name.substring(entry.name.lastIndexOf(".") + 1)
      if(extension === "ini") {
        const text = await fileEntry.getText()
        parseIniFile(entry.getFullname(), text.split("\r\n"), gameDatabase)
      } else if(extension === "btf" && entry.name.startsWith("soviet")) {
        const uint8Array = await fileEntry.getUint8Array()
        const languageKey = entry.name.substring("soviet".length, entry.name.lastIndexOf("."))
        parseTranslationFile(languageKey, uint8Array, gameDatabase)
      }
    }
  }
  console.debug("Zip entries parsed.")
  return gameDatabase
}

export async function parseZipFileFromUrl(url : string) {
  const apiFilesystem = createZipFileSystem();
  const { root } = apiFilesystem;
  const entries = await root.importHttpContent(url);
  return parseZipEntries(entries)
}
