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

import { TreeMap, MapIterator } from 'jstreemap';
import { extractLine, getFloatAttributes } from '@/database/entity';

export const statisticsDbKey = 'statistics'

export class SaveGameDatabase {
  /**
   * Full content of the statistics.ini file (large)
   */
  statistics = ""
  /**
   * byte index for all dates in statistics string
   */
  dateIndex = new TreeMap<number, number>()

  currentStateIndex = 0

  getData(keyTree:string[], fromIndex : number): number[] {
    let location = fromIndex
    for(const key of keyTree) {
      location = this.statistics.indexOf(key, location)
    }
    const line = extractLine(this.statistics, location)
    return getFloatAttributes(line[0])
  }

  /**
   * Fetch data for a specific item
   * @param category Statistic category ex: Economy Resources Citizens etc..
   * @param item Category item ex: clothes Vehicles_ImportRUB Citizens_Born
   * @param from Start Epoch filter to extract data
   * @param to Stop epoch filter to extract data
   * @param limit Limit the number of items to retrieve
   */
  getDataSet(keyTree:string[], from : number, to : number, limit : number) {
    // find dates keys correspond to the requested range
    const it : MapIterator<number, number> = this.dateIndex.lowerBound(from)
    let indexes = new Array<{date:number, location:number}>()
    while (it.value != null && it.key <= to) {
      indexes.push({date:it.key, location:it.value})
      it.next()
    }
    if(indexes.length > limit) {
      const step = Math.ceil(indexes.length / limit)
      indexes = indexes.filter((_, i) => i % step === 0)
    }
    const dataset = new Array<{date:number, value: number}>()
    let date = 0
    let location = 0
    for({ date, location } of indexes) {
      for(const key of keyTree) {
        // for the last key do not look further than $end word
        if(keyTree[keyTree.length - 1] === key) {
          const endLocation = this.statistics.indexOf('$end', location)
          location = this.statistics.indexOf(key, location)
          if(location > endLocation) {
            location = -1
          }
        } else {
          location = this.statistics.indexOf(key, location)
        }
        if(location === -1) {
          break
        }
      }
      if(location === -1) {
        dataset.push({date, value:0})
      } else {
        const line = extractLine(this.statistics, location)
        const data = getFloatAttributes(line[0])
        if(data.length > 0) {
          dataset.push({date, value:data[0]})
        }
      }
    }
    return dataset
  }
}