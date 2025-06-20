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

export const resourcesLangIndex: Map<string, number> = new Map<string, number>(
  Object.entries({
    gravel: 500,
    plants: 501,
    food: 502,
    wood: 503,
    boards: 504,
    oil: 505,
    fuel: 506,
    chemicals: 507,
    coal: 508,
    iron: 509,
    fabric: 510,
    prefabpanels: 511,
    alcohol: 512,
    bitumen: 513,
    meat: 514,
    clothes: 515,
    cement: 516,
    steel: 517,
    bricks: 519,
    livestock: 520,
    rawgravel: 522,
    rawcoal: 523,
    rawiron: 524,
    asphalt: 525,
    concrete: 526,
    ecomponents: 527,
    water: 543,
    usagewater: 544,
    mcomponents: 530,
    plastics: 531,
    eletronics: 528,
    eletric: 529,
    vehicles: 532,
    trains: 533,
    uranium: 534,
    yellowcake: 535,
    uf6: 536,
    nuclearfuel: 537,
    nuclearfuelburned: 538,
    rawbauxite: 539,
    bauxite: 540,
    alumina: 541,
    aluminium: 542,
    waste_other: 552,
    waste_bio: 553,
    waste_steel: 554,
    waste_aluminium: 555,
    waste_plastic: 556,
    waste_burnable: 557,
    waste_toxic: 558,
    waste_gravel: 559,
    fertiliser: 560,
    fertiliser_liquid: 561,
    waste_ash: 562,
    explosives: 563,
    heat: 58008,
  })
);

export const buildingTypeLangIndex: Map<string, number> = new Map<string, number>(
  Object.entries({
    LIVING: 13049,
    FACTORY: 6350,
  })
);

export const languageNumericFormat: Map<
  string,
  { decimalSeparator: string; thousandSeparator: string | boolean }
> = new Map<
  string,
  {
    decimalSeparator: string;
    thousandSeparator: string | boolean;
  }
>(Object.entries({ English: { decimalSeparator: '.', thousandSeparator: ',' },
"French": { decimalSeparator: ',', thousandSeparator: ' ' },
"German": { decimalSeparator: ',', thousandSeparator: '.' },
"Spanish": { decimalSeparator: ',', thousandSeparator: '.' },
"Italian": { decimalSeparator: ',', thousandSeparator: '.' },
"Russian": { decimalSeparator: ',', thousandSeparator: ' ' },
"Polish": { decimalSeparator: ',', thousandSeparator: ' ' },
"Portuguese": { decimalSeparator: ',', thousandSeparator: ' ' },
"Dutch": { decimalSeparator: ',', thousandSeparator: '.' },
"Czech": { decimalSeparator: ',', thousandSeparator: ' ' },
"Hungarian": { decimalSeparator: ',', thousandSeparator: ' ' },
"Swedish": { decimalSeparator: ',', thousandSeparator: ' ' },
"Finnish": { decimalSeparator: ',', thousandSeparator: ' ' },
"Norwegian": { decimalSeparator: ',', thousandSeparator: ' ' },
"Danish": { decimalSeparator: ',', thousandSeparator: ' ' },
"Lithuanian": { decimalSeparator: ',', thousandSeparator: ' ' },
"Latvian": { decimalSeparator: ',', thousandSeparator: ' ' },
"Slovak": { decimalSeparator: ',', thousandSeparator: ' ' },
"Croatian": { decimalSeparator: ',', thousandSeparator: ' ' },
"Estonian": { decimalSeparator: ',', thousandSeparator: ' ' },
"Greek": { decimalSeparator: ',', thousandSeparator: ' ' },
"Turkish": { decimalSeparator: ',', thousandSeparator: ' ' },
"Arabic": { decimalSeparator: ',', thousandSeparator: ' ' },
"Bengali": { decimalSeparator: ',', thousandSeparator: ' ' },
"Chinese": { decimalSeparator: ',', thousandSeparator: ' ' },
"Ukrainian": { decimalSeparator: ',', thousandSeparator: ' ' },
"PortugueseBrazil": { decimalSeparator: ',', thousandSeparator: ' ' },
"Romanian": { decimalSeparator: ',', thousandSeparator: ' ' },
}));
