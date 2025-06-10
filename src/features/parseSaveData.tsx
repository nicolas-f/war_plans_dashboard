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
import { createZipFileSystem } from '@/features/zipFileSystem';
import { SaveGameDatabase } from '@/model/saveGameDatabase';

/**
 * Parses the given text into lines and yields each line along with its starting position.
 * This generator function processes the input text string and identifies lines based on
 * line terminators such as '\n' (LF) or '\r' (CR). It also handles CRLF ('\r\n') line endings.
 *
 * @param {string} text The input text to be parsed into lines.
 * @param {number} [initialStart=0] The position in the text to start parsing from. Defaults to 0.
 * @return {Generator<[string, number]>} A generator that yields a tuple containing a line of text
 *                                       and its starting position in the input string.
 */
function* parseLines(
  text: string,
  initialStart: number = 0
): Generator<[string, number]> {
  let start = initialStart;
  const len = text.length;

  while (start < len) {
    const cr = text.indexOf('\r', start);
    const lf = text.indexOf('\n', start);

    // Determine the nearest line terminator
    const end = Math.min(
      cr === -1 ? Infinity : cr,
      lf === -1 ? Infinity : lf
    );

    if (end === Infinity) {
      yield [text.substring(start), start];
      break;
    } else {
      const line = text.substring(start, end);
      yield [line, start];

      // Handle CRLF line endings
      if (end === cr && text[end + 1] === '\n') {
        start = end + 2;
      } else {
        start = end + 1;
      }
    }
  }
}


function parseIniFile(content: string, saveGameDatabase: SaveGameDatabase) {
  saveGameDatabase.statistics = content
  // create an index of the content for each statistics date using parseLines
  let state = ""
  let day = -1
  let year = -1
  let recordIndex = 0
  for (const [line, index] of parseLines(content)) {
    if(state === "") {
      if(line.startsWith("$STAT_RECORD")) {
        state = "$STAT_RECORD"
        recordIndex = index
      }
    } else if(state === "$STAT_RECORD") {
      if(line.startsWith("$DATE_DAY")) {
        // ex $DATE_DAY 52
        day = parseInt(line.substring("$DATE_DAY".length).trim(), 10)
        state = "$DATE_DAY"
      }
    } else if(state === "$DATE_DAY") {
      if(line.startsWith("$DATE_YEAR")) {
        //ex $DATE_YEAR 1970
        year = parseInt(line.substring("$DATE_YEAR".length).trim(), 10)
        const key = `${year}-${day}`
        saveGameDatabase.dateIndex[key] = recordIndex
        state = ""
      }
    }
  }
}

export async function parseSaveGameDataZipEntries(entries: [ZipEntry]): Promise<SaveGameDatabase> {
  console.debug("Parsing game data zip entries..")
  const saveGameDatabase = new SaveGameDatabase()
  for (const entry of entries) {
    if(!entry.data?.directory) {
      const fileEntry = entry as ZipFileEntry<any, any>;
      if(entry.name === "stats.ini") {
        const text = await fileEntry.getText()
        parseIniFile(text, saveGameDatabase)
      }
    }
  }
  console.debug("Zip game data entries parsed.")
  return saveGameDatabase
}

export async function parseSaveGameZipFileFromUrl(url : string) {
  const apiFilesystem = createZipFileSystem();
  const { root } = apiFilesystem;
  const entries = await root.importHttpContent(url);
  return parseSaveGameDataZipEntries(entries)
}
