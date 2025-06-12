import { Entity } from '@/database/entity';

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
import { expect, test } from 'vitest'
import ef from '/src/__tests__/eletronic_factory.ini?raw';


test('productionCoefficient1960', () => {
  const entity = new Entity("eletronic_factory.ini")
  entity.data = ef
  const production = entity.getMaximumProduction(1960)
  const expected = [ { resource: 'eletronics', quantity: 4.5 } ]
  expect(production.length).toBe(1)
  expect(production[0].resource).toStrictEqual(expected[0].resource)
  expect(production[0].quantity).closeTo(expected[0].quantity, 0.01)
});



test('productionCoefficient2041', () => {
  const entity = new Entity("eletronic_factory.ini")
  entity.data = ef
  const production = entity.getMaximumProduction(2041)
  const expected = [ { resource: 'eletronics', quantity: 1.4 } ]
  expect(production.length).toBe(1)
  expect(production[0].resource).toStrictEqual(expected[0].resource)
  expect(production[0].quantity).closeTo(expected[0].quantity, 0.1)
});

test('consumptionCoefficient1960', () => {
  const entity = new Entity("eletronic_factory.ini")
  entity.data = ef
  const consumption = entity.getMaximumConsumption(1960)
  const expected = [ {resource: "ecomponents", quantity: 1.5},
    {resource: "plastics", quantity: 2.25},{resource: "mcomponents", quantity: 1.5}]

  expect(consumption.length).toBe(expected.length)
  expected.forEach((e, i) => {
    expect(consumption[i].resource).toStrictEqual(e.resource)
    expect(consumption[i].quantity).closeTo(e.quantity, 0.1)
  })
});

test('consumptionCoefficient2041', () => {
  const entity = new Entity("eletronic_factory.ini")
  entity.data = ef
  const consumption = entity.getMaximumConsumption(2041)

  const expected = [ {resource: "ecomponents", quantity: 2.7},
    {resource: "plastics", quantity: 4.1},{resource: "mcomponents", quantity: 2.7}]

  expect(consumption.length).toBe(expected.length)
  expected.forEach((e, i) => {
    expect(consumption[i].resource).toStrictEqual(e.resource)
    expect(consumption[i].quantity).closeTo(e.quantity, 0.1)
  })
});