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

export function getLocalizedDate(year: number, dayOfYear: number): string {
  // Create a Date object using year and day of year
  const date = new Date(year, 0); // Start with Jan 1st
  date.setDate(dayOfYear); // Set to nth day of year (automatically rolls over months)

  // Format using browser's locale
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function extractLine(content: string, index: number) : [string, number] {
  let endOfLine = content.indexOf("\r\n", index)
  if(endOfLine === -1) {
    endOfLine = content.length
  }
  return [content.substring(index, endOfLine), endOfLine]
}





function fetchRecordIndex(content: string, saveGameDatabase: SaveGameDatabase, keyword: string) {
  let recordIndex = content.indexOf(keyword)
  while(recordIndex !== -1) {
    const day = parseInt(extractLine("$DATE_DAY", recordIndex)[0].substring("$DATE_DAY".length).trim(), 10)
    const year = parseInt(extractLine("$DATE_YEAR", recordIndex)[0].substring("$DATE_YEAR".length).trim(), 10)
    const key = `${year}-${day}`
    saveGameDatabase.dateIndex[key] = recordIndex
    recordIndex = content.indexOf(keyword, recordIndex + 1)
  }
}

/**
 * stats records is in the form:
 *
 * $STAT_RECORD 1
 * ====================================================================
 * ====================================================================
 * $DATE_DAY 3
 * $DATE_YEAR 1960
 *
 * @param content
 * @param saveGameDatabase
 */
function parseIniFile(content: string, saveGameDatabase: SaveGameDatabase) {
  saveGameDatabase.statistics = content
  fetchRecordIndex(content, saveGameDatabase, "$STAT_RECORD")
  fetchRecordIndex(content, saveGameDatabase, "$STAT_CURRENT")
}

export async function parseSaveGameDataZipEntries(entries: [ZipEntry]): Promise<SaveGameDatabase> {
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
  return saveGameDatabase
}

export async function parseSaveGameZipFileFromUrl(url : string) {
  const apiFilesystem = createZipFileSystem();
  const { root } = apiFilesystem;
  const entries = await root.importHttpContent(url);
  return parseSaveGameDataZipEntries(entries)
}
