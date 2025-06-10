import { createZipFileSystem } from '@/features/zipFileSystem';

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
import { ZipEntry, ZipFileEntry } from '@zip.js/zip.js';
import { Entity } from '@/database/entity';
import { GameDatabase } from '@/database/gameDatabase';

function parseIniFile(name : string, data : string, db : GameDatabase) {
  const entity = new Entity(name)
  entity.data = data
  db.entities.set(name, entity)
}

/**
 * Parses a translation file and populates the translations into the provided game database.
 *
 * Thanks to https://github.com/Nargon/BTFTool for the retro-engineering work
 *
 * @param {string} name - The name of the translation file.
 * @param {Uint8Array} data - The binary data of the translation file.
 * @param {GameDatabase} db - The game database object that stores the parsed translations.
 */
function parseTranslationFile(name : string, data : Uint8Array, db : GameDatabase) {
  const textDecoder = new TextDecoder('UTF-16BE', { fatal: true });
  const headerSize = 12
  const entrySize = 10
  const dataView = new DataView(data.buffer, 0)
  const nbRecords = dataView.getUint32(0, false)
  if (!db.translations.has(name)) {
    db.translations.set(name, new Map<number, string>());
  }
  for (let index = 0; index < nbRecords; index++) {
    const entryIndex = headerSize + index * entrySize
    const id = dataView.getUint32(entryIndex, false)
    const location = dataView.getUint32(entryIndex + 4, false)
    const length = dataView.getUint16(entryIndex + 8, false);
    const stringLocation = headerSize + entrySize * nbRecords + location * 2
    const stringData = data.slice(stringLocation, stringLocation + 2 * length);
    const text = textDecoder.decode(stringData);
    db.translations.get(name)!.set(id, text);
  }
}

export async function parseGameDataZipEntries(entries: [ZipEntry]): Promise<GameDatabase> {
  const gameDatabase = new GameDatabase()
  for (const entry of entries) {
    if(!entry.data?.directory) {
      const fileEntry = entry as ZipFileEntry<any, any>;
      const extension = entry.name.substring(entry.name.lastIndexOf(".") + 1)
      if(extension === "ini") {
        const text = await fileEntry.getText()
        parseIniFile(entry.getFullname(), text, gameDatabase)
      } else if(extension === "btf" && entry.name.startsWith("soviet")) {
        const uint8Array = await fileEntry.getUint8Array()
        const languageKey = entry.name.substring("soviet".length, entry.name.lastIndexOf("."))
        parseTranslationFile(languageKey, uint8Array, gameDatabase)
      }
    }
  }
  return gameDatabase
}

export async function parseZipFileFromUrl(url : string) {
  const apiFilesystem = createZipFileSystem();
  const { root } = apiFilesystem;
  const entries = await root.importHttpContent(url);
  return parseGameDataZipEntries(entries)
}
