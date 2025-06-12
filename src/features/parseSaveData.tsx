/*
 * Copyright (C) 2025 -  Nicolas Fortin - https://github.com/nicolas-f
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
import { extractLine } from '@/database/entity';
import { SaveGameDatabase } from '@/database/saveGameDatabase';
import { createZipFileSystem } from '@/features/zipFileSystem';


function convertToUnixEpoch(year: number, dayOfYear: number): number {
  const janFirstUtc = Date.UTC(year, 0, 1); // January 1st of the year, UTC
  // Add days in milliseconds
  return janFirstUtc + (dayOfYear - 1) * 86400000; // Convert to seconds
}

/**
 * Create an index of all the dates specified in statistics, using treemap to quickly fetch ranges
 *
 * @param content
 * @param saveGameDatabase
 * @param keyword
 */
function fetchRecordIndex(content: string, saveGameDatabase: SaveGameDatabase, keyword: string) {
  let recordIndex = content.indexOf(keyword)
  while(recordIndex !== -1) {
    const day = parseInt(extractLine(content, content.indexOf("$DATE_DAY", recordIndex))[0]
      .substring("$DATE_DAY".length).trim(), 10)
    const year = parseInt(extractLine(content, content.indexOf("$DATE_YEAR", recordIndex))[0]
      .substring("$DATE_YEAR".length).trim(), 10)
    if(year > 0 ){
      // historical data
      const key = convertToUnixEpoch(year, day)
      saveGameDatabase.dateIndex.set(key, recordIndex)
    } else {
      // current data (not complete)
      saveGameDatabase.currentStateIndex = recordIndex
    }
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
export function parseSaveGameIniFile(content: string, saveGameDatabase: SaveGameDatabase) {
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
        parseSaveGameIniFile(text, saveGameDatabase)
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

export async function parseSaveGameZipFileFromBlob(blob : Blob) {
  const apiFilesystem = createZipFileSystem();
  const { root } = apiFilesystem;
  const entries = await root.importBlob(blob)
  return parseSaveGameDataZipEntries(entries)
}