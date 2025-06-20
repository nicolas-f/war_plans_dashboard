;
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

import { Entity } from '@/database/entity';


export class GameDatabase {
  entities: Map<string, Entity> = new Map<string, Entity>();
  translations: Map<string, Map<number, string>> = new Map<string, Map<number, string>>()

  getLang(language : string, key : number | undefined, defaultValue: string = "") : string {
    if(!key) {
      return defaultValue
    }
    const lang = this.translations.get(language)?.get(key)
    if(lang) {
      return lang
    }
    return defaultValue
  }
}
