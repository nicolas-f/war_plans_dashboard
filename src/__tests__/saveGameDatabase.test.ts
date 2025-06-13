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

import ef from '/src/__tests__/stats.ini?raw';
import { expect, test } from 'vitest';
import { SaveGameDatabase } from '@/database/saveGameDatabase';
import { convertToUnixEpoch, parseSaveGameIniFile } from '@/features/parseSaveData';

test('testParseStats', () => {
  const saveGameDatabase = new SaveGameDatabase();
  parseSaveGameIniFile(ef, saveGameDatabase);

  expect(saveGameDatabase.dateIndex.size).toBe(3);
  // before 1970 such as epoch is negative (1960)
  expect(Array.from(saveGameDatabase.dateIndex.keys())).toStrictEqual([
    -311212800000, -311040000000, -310694400000,
  ]);
  expect(saveGameDatabase.currentStateIndex).toBe(46926);

  const dataSet = saveGameDatabase.getDataSet(
    ['$Economy_PurchaseCostRUB', 'clothes'],
    convertToUnixEpoch(1960, 52),
    convertToUnixEpoch(1960, 58),
    5
  );

  expect(dataSet).toStrictEqual([
    {
      date: -311212800000,
      value: 1383.479126,
    },
    {
      date: -311040000000,
      value: 1383.607422,
    },
    {
      date: -310694400000,
      value: 1384.155151,
    },
  ]);
});
