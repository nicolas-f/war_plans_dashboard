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
  getIntAttribute(attribute : string) : number {
    const index = this.data.indexOf(attribute)
    if(index === -1) {
      return NaN
    } 
    return parseInt(extractLine(this.data, index)[0].substring(attribute.length).trim(), 10)
  }

  /**
   * Retrieves the numerical value associated with a specific attribute from the data.
   *
   * @param {string} attribute - The attribute name whose numerical value is to be retrieved.
   * @return {number} The numerical value of the specified attribute. Returns 0 if the attribute is not found.
   */
  getFloatAttribute(attribute : string) : number {
    const index = this.data.indexOf(attribute)
    if(index === -1) {
      return NaN
    }
    return parseFloat(extractLine(this.data, index)[0].substring(attribute.length).trim())
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
    return this.getIntAttribute("$NAME")
  }

  getType() : string {
    return this.getStringAttribute("$TYPE_")
  }

  getMaximumWorkers() : number {
    // String 585: "Travailleurs"
    return this.getIntAttribute("$WORKERS_NEEDED")
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

  getProduction(year : number = 1960) {
    let production = this.getResourceData("$PRODUCTION ")
    const productionDecreaseIndex = this.data.indexOf("$PRODUCTION_DECREASE_ACCORDING_YEAR")
    //This token recalculate factory production every year according..
    //FinalProductionFactor = 1.0 - (GameYear - Param1) / Param2
    //FinalProductionFactor = clamp(FinalConsumption, Param3, 1.0)
    if(productionDecreaseIndex !== -1) {
      const productionDecrease = extractLine(this.data, productionDecreaseIndex)
      const parts = productionDecrease[0].trim().split(/\s+/);
      if(parts.length >= 4) {
        const yearParam = parseInt(parts[1], 10)
        const factorParam = parseFloat(parts[2])
        const clampValue = parseFloat(parts[3])
        const factor = Math.min(Math.max(clampValue, 1.0 - (year - yearParam) / factorParam), 1)
        production = production.map(value => ({
          resource: value.resource,
          quantity: value.quantity * factor
        }))
      }
    }
    return production
  }

  getConsumption(year : number = 1960) {
    let consumption = this.getResourceData("$CONSUMPTION ")

    const consumptionIncreaseIndex = this.data.indexOf("$CONSUMPTION_INCREASE_ACCORDING_YEAR")
    //This token recalculate factory consumption every year according..
    //FinalConsumption = (GameYear - Param1) / Param2
    //FinalConsumption = clamp(FinalConsumption, 0.0f, Param3)
    if(consumptionIncreaseIndex !== -1) {
      const consumptionIncrease = extractLine(this.data, consumptionIncreaseIndex)
      const parts = consumptionIncrease[0].trim().split(/\s+/);
      if(parts.length >= 4) {
        const yearParam = parseInt(parts[1], 10)
        const factorParam = parseFloat(parts[2])
        const clampValue = parseFloat(parts[3])
        const factor = Math.min(Math.max(0, (year - yearParam) / factorParam), clampValue)
        consumption = consumption.map(value => ({
          resource: value.resource,
          quantity: value.quantity + value.quantity * factor
        }))
      }
    }
    return consumption
  }

  getMaximumProduction(year : number = 1960) {
    const maxWorkers = this.getMaximumWorkers()
    return this.getProduction(year).map(value => ({
      resource: value.resource,
      quantity: value.quantity * maxWorkers
    }))
  }

  getMaximumConsumption(year : number = 1960) {
    const maxWorkers = this.getMaximumWorkers()
    // quality is percentage and does not scale with workers
    return this.getConsumption(year).map(value => ({
      resource: value.resource,
      quantity: value.resource.indexOf("QUALITY") > -1 ? value.quantity : value.quantity * maxWorkers
    }))
  }

  // $QUALITY_OF_LIVING 0.85
  getQualityOfLiving() {
    return this.getFloatAttribute("$QUALITY_OF_LIVING")
  }

  // $STORAGE RESOURCE_TRANSPORT_PASSANGER 55

  getLivingPopulation() {
    return this.getIntAttribute("$STORAGE RESOURCE_TRANSPORT_PASSANGER")
  }

}