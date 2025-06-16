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
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { IconRowRemove } from '@tabler/icons-react';
import { ActionIcon, Group, NumberInput, Select, Stack, Table, TableData, Text } from '@mantine/core';
import { ComboboxItem } from '@mantine/core/lib/components/Combobox/Combobox.types';
import { DatePickerInput } from '@mantine/dates';
import { Entity } from '@/database/entity';
import { GameDatabase } from '@/database/gameDatabase';
import { SaveGameDatabase } from '@/database/saveGameDatabase';
import { resourcesLangIndex } from '@/database/dataMap';

export interface ProductionGameContentProps {
  gameDatabase: GameDatabase;
  saveGameDatabase: SaveGameDatabase;
  selectedLanguage: string;
}


class ProductionTableRow {
  building: string;
  productivity: string | number;
  quantity: string | number;
  constructor(building : string) {
    this.building = building;
    this.productivity = 100;
    this.quantity = 1;
  }
}

function getResourcesProduction(gameDatabase: GameDatabase, saveGameDatabase: SaveGameDatabase,
                                selectedLanguage: string, buildings: ProductionTableRow[], datePrice: string | null): React.ReactNode[][] {
  const resources = new Map<string, number>();
  const productionDate = dayjs(datePrice)
  const saveGameIndex = saveGameDatabase.dateIndex.lowerBound(productionDate.valueOf());
  if(saveGameIndex.value) {
    // fetch all production and consumption numbers for all resources and all listed buildings
    buildings.forEach((element) => {
      const buildingEntity = gameDatabase.entities.get(element.building)
      if (typeof element.quantity === 'number' && typeof element.productivity === 'number') {
        const numberOfBuildings: number = element.quantity;
        const productivityBuildings: number = element.productivity;
        if (buildingEntity) {
          buildingEntity.getProduction(productionDate.year()).forEach(({resource, quantity}) => {
            const totalQuantity = quantity * numberOfBuildings * ( buildingEntity.getMaximumWorkers() * productivityBuildings / 100);
            resources.set(resource, (resources.get(resource) || 0) + totalQuantity)
          })
          buildingEntity.getConsumption(productionDate.year()).forEach(({resource, quantity}) => {
            const totalQuantity = quantity * numberOfBuildings * ( buildingEntity.getMaximumWorkers() *productivityBuildings / 100);
            resources.set(resource, (resources.get(resource) || 0) - totalQuantity)
          })
        }
      }
    })
    return resources.entries().map(([key, value]) => {
      const gainRubles = value >= 0 ? saveGameDatabase.getData(["$Economy_SellCostRUB", key], saveGameIndex.value)[0] * value :
        saveGameDatabase.getData(["$Economy_PurchaseCostRUB", key], saveGameIndex.value)[0] * value
      const gainDollars = value >= 0 ? saveGameDatabase.getData(["$Economy_SellCostUSD", key], saveGameIndex.value)[0] * value :
        saveGameDatabase.getData(["$Economy_PurchaseCostUSD", key], saveGameIndex.value)[0] * value

      return [
        <Text>{gameDatabase.getLang(selectedLanguage, resourcesLangIndex.get(key))}</Text>,
        <Text c={value >= 0 ? 'blue' : 'red'}>{value.toFixed(2)}</Text>,
        <Text c={value >= 0 ? 'blue' : 'red'}>{gainRubles.toFixed(2)}</Text>,
        <Text c={value >= 0 ? 'blue' : 'red'}>{gainDollars.toFixed(2)}</Text>
      ]
    })
  }
}

export function ProductionGameContent({
                                        gameDatabase,
                                        saveGameDatabase,
                                        selectedLanguage,
                                      }: ProductionGameContentProps) {
  const lastEntry = saveGameDatabase.dateIndex.last();
  const firstEntry = saveGameDatabase.dateIndex.first();
  let initialEndDate: string | null = null;
  let minStartDate: string | null = null;
  let maxEndDate: string | null = null;
  if (lastEntry) {
    initialEndDate = dayjs(lastEntry[0]).format('YYYY-MM-DD');
    maxEndDate = initialEndDate
    minStartDate = dayjs(firstEntry[0]).format('YYYY-MM-DD');
  }
  const [buildings, setBuildings] = useState<ProductionTableRow[]>([]);
  const [priceDate, setPriceDate] = useState<string | null>(initialEndDate);

  // Generate building search data
  const buildingSelectionData: { group: string; items: ComboboxItem[] }[] = [];
  gameDatabase.entities
    .entries()
    .filter(
      (value) =>
        value[1].getLocalizedNameIndex() > 0 &&
        (value[1].getMaximumWorkers() > 0 || value[1].getLivingPopulation() > 0)
    )
    .forEach((value: [string, Entity]) => {
      const group = value[1].getType();
      const maxWorker = value[1].getMaximumWorkers();
      const maxPopulation = value[1].getLivingPopulation();
      const label =
        maxWorker > 0
          ? `${gameDatabase.getLang(selectedLanguage, value[1].getLocalizedNameIndex())}
     - ${maxWorker} ${gameDatabase.getLang(selectedLanguage, 585)}`
          : `${gameDatabase.getLang(selectedLanguage, value[1].getLocalizedNameIndex())}
     - ${maxPopulation} ${gameDatabase.getLang(selectedLanguage, 2810)}`;
      const comboboxItem: ComboboxItem = { value: value[1].name, label };
      const index = buildingSelectionData.findIndex((e) => e.group === group);
      if (index === -1) {
        buildingSelectionData.push({ group, items: [comboboxItem] });
      } else {
        buildingSelectionData[index].items.push(comboboxItem);
      }
    });

  const buildingsTableData: TableData = {
    caption: gameDatabase.getLang(selectedLanguage, 59008),
    head: [
      '',
      gameDatabase.getLang(selectedLanguage, 13900),
      gameDatabase.getLang(selectedLanguage, 8090),
      gameDatabase.getLang(selectedLanguage,8068)
    ],
    body: buildings.map((element) => [
      <ActionIcon
        variant="filled"
        onClick={() => setBuildings(buildings.filter((a) => a !== element))}
      >
        <IconRowRemove />
      </ActionIcon>,
      <Text>{gameDatabase.entities.get(element.building)!.getLocalizedNameIndex() > 0
        ? gameDatabase.getLang(
            selectedLanguage,
            gameDatabase.entities.get(element.building)!.getLocalizedNameIndex()
          )
        : gameDatabase.entities.get(element.building)!.name}
      </Text>,
      <NumberInput
        min={10}
        max={100}
        suffix=" %"
        step={10}
        w="80px"
        value={element.productivity}
        onChange={(productivity) => {
          setBuildings(
            buildings.map((a) => (a.building === element.building ? { ...a, productivity} : a))
          );
        }}
      />,
      <NumberInput
        min={1}
        w="80px"
        value={element.quantity}
        onChange={(quantity) => {
          setBuildings(
            buildings.map((a) => (a.building === element.building ? { ...a, quantity } : a))
          );
        }}
      />,
    ]),
  };

  const resourcesTableData: TableData = {
    caption: gameDatabase.getLang(selectedLanguage,59000),
    head: [gameDatabase.getLang(selectedLanguage, 70071),
      gameDatabase.getLang(selectedLanguage, 8046),
      '₽',
      '$'
    ],
    body: getResourcesProduction(gameDatabase, saveGameDatabase, selectedLanguage, buildings, priceDate),
  };





  return (
    <Stack gap="xl">
      <Group grow>
        <DatePickerInput
          label={gameDatabase.getLang(selectedLanguage, 612)}
          value={priceDate}
          minDate={minStartDate ? minStartDate : undefined}
          maxDate={maxEndDate ? maxEndDate : undefined}
          onChange={setPriceDate}
        />
        <Select
          searchable
          clearable
          label={gameDatabase.getLang(selectedLanguage, 40003)}
          placeholder={gameDatabase.getLang(selectedLanguage, 13900)}
          // limit={5}
          data={buildingSelectionData}
          onChange={(_value, option) => {
            const entity = gameDatabase.entities.get(option.value);
            if (entity) {
              setBuildings([...buildings, new ProductionTableRow(option.value)]);
            }
          }}
        />
      </Group>
      <Table data={buildingsTableData} captionSide="top" />
      <Table data={resourcesTableData} captionSide="top" />
    </Stack>
  );
}