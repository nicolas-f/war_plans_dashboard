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
const { FS } = fs;

// https://github.com/gildas-lormeau/zip-manager/blob/main/src/zip-manager/ZipManager.jsx

// https://github.com/gildas-lormeau/zip.js/blob/master/tests/all/test-fs-text.js
function createZipFileSystem() {
  return new FS();
}

export async function parseZipEntries(entries: [ZipEntry]): Promise<{ [key: string]: [] }> {
  const retData = {}
  for (const entry of entries) {
    console.log('Entry (',entry.data?.uncompressedSize,' B):', entry.getFullname());
    if(!entry.data?.directory) {
      const fileEntry = entry as ZipFileEntry<any, any>;
      const text = await fileEntry.getText()
      for(const line of text.split("\n")) {
        if(line.trim().length > 0) {
          console.log(line);
        }
      }
      break
    }
  }
  return retData
}

export async function parseZipFileFromUrl(url : string) {
  const apiFilesystem = createZipFileSystem();
  const { root } = apiFilesystem;

  try {
    const entries = await root.importHttpContent(url);
    return parseZipEntries(entries)
  } catch (error) {
    console.error('Error importing zip file:', error);
  }
}
