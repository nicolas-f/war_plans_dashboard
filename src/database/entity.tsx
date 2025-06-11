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

/**
 * Game data entity
 *
 */
export class Entity {
  name: string;
  /**
   * Raw game ini data
   * ex:
   *
   * $NAME 6356
   *
   * $TYPE_FACTORY
   *
   * $STYLE_FLAG modern_industry
   *
   * $WORKERS_NEEDED 150
   * $PRODUCTION eletronics 0.03
   * $CONSUMPTION ecomponents 0.01
   * $CONSUMPTION plastics	0.015
   * $CONSUMPTION mcomponents 0.01
   */
  data  = ""

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Retrieves the numerical value associated with a specific attribute from the data.
   *
   * @param {string} attribute - The attribute name whose numerical value is to be retrieved.
   * @return {number} The numerical value of the specified attribute. Returns 0 if the attribute is not found.
   */
  getNumberAttribute(attribute : string) : number {
    const index = this.data.indexOf(attribute)
    if(index === -1) {
      return 0
    } 
    return parseInt(extractLine(this.data, index)[0].substring(attribute.length).trim(), 10)
  }

  /**
   * Retrieves the string value associated with a specified attribute from the data.
   *
   * @param {string} attribute - The name of the attribute for which the value is to be retrieved.
   * @return {string} The value of the specified attribute. Returns an empty string if the attribute is not found.
   */
  getStringAttribute(attribute : string) : string {
    const index = this.data.indexOf(attribute)
    if(index === -1) {
      return ""
    }
    return extractLine(this.data, index)[0].substring(attribute.length).trim()
  }

  getLocalizedNameIndex() : number {
    return this.getNumberAttribute("$NAME")
  }

  getType() : string {
    return this.getStringAttribute("$TYPE_")
  }

  getMaximumWorkers() : number {
    return this.getNumberAttribute("$WORKERS_NEEDED")
  }

  private getResourceData(prefix: string) {
    let index = this.data.indexOf(prefix)
    const resources = []
    while(index !== -1) {
      const info = extractLine(this.data, index)
      const parts = info[0].trim().split(/\s+/);
      if(parts.length >= 3) {
        resources.push({resource: parts[1], quantity: parseFloat(parts[2])})
      } else if(parts.length === 2){
        resources.push({resource: parts[0].substring(prefix.length + 1), quantity: parseFloat(parts[1])})
      }
      index = this.data.indexOf(prefix, info[1])
    }
    return resources
  }

  getProduction() {
    return this.getResourceData("$PRODUCTION")
  }

  getConsumption() {
    return this.getResourceData("$CONSUMPTION")
  }

  getMaximumProduction() {
    const maxWorkers = this.getMaximumWorkers()
    return this.getProduction().map(value => ({
      resource: value.resource,
      quantity: value.quantity * maxWorkers
    }))
  }

  getMaximumConsumption() {
    const maxWorkers = this.getMaximumWorkers()
    // quality is percentage and does not scale with workers
    return this.getConsumption().map(value => ({
      resource: value.resource,
      quantity: value.resource.indexOf("QUALITY") > -1 ? value.quantity : value.quantity * maxWorkers
    }))
  }
  
}