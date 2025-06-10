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

export function extractLine(content: string, index: number) : [string, number] {
  let endOfLine = content.indexOf("\r\n", index)
  if(endOfLine === -1) {
    endOfLine = content.length
  }
  return [content.substring(index, endOfLine), endOfLine]
}

export class Entity {
  name: string;
  data  = ""

  constructor(name: string) {
    this.name = name;
  }

}
