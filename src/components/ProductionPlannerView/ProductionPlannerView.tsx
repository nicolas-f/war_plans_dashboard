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
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { IconRowRemove } from '@tabler/icons-react';
import { ActionIcon, Checkbox, Group, NumberFormatter, NumberInput, Select, Stack, Table, TableData, Text, Tooltip } from '@mantine/core';
import { ComboboxItem } from '@mantine/core/lib/components/Combobox/Combobox.types';
import { DatePickerInput } from '@mantine/dates';
import { resourcesLangIndex } from '@/database/dataMap';
import { getStoreData, setStoreData, Stores } from '@/database/db';
import { Entity } from '@/database/entity';
import { GameDatabase } from '@/database/gameDatabase';
import { SaveGameDatabase } from '@/database/saveGameDatabase';


export interface ProductionGameContentProps {
  gameDatabase: GameDatabase;
  saveGameDatabase: SaveGameDatabase;
  selectedLanguage: string;
}

interface resourceTableRow {
  resource: string;
  quantity: number;
  quantityHint: string;
  gainRubles: number;
  gainDollars: number;
}

class ProductionTableRow {
  building: string;
  productivity: number;
  quantity: number;
  constructor(building: string) {
    this.building = building;
    this.productivity = 100;
    this.quantity = 1;
  }
}

function getBuildingsDataTable(
  gameDatabase: GameDatabase,
  selectedLanguage: string,
  buildings: ProductionTableRow[],
  setBuildings: (buildings: ProductionTableRow[]) => void
) {
  return buildings.map((element) => [
    <ActionIcon
      variant="filled"
      onClick={() => setBuildings(buildings.filter((a) => a !== element))}
    >
      <IconRowRemove />
    </ActionIcon>,
    <Text>
      {gameDatabase.entities.get(element.building)!.getLocalizedNameIndex() > 0
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
      onChange={(prod) => {
        const newProd : number = typeof prod === 'number' ? prod : parseInt(prod.toString(), 10)
        setBuildings(
          buildings.map((a) => (a.building === element.building ? { ...a, newProd} : a))
        );
      }}
    />,
    <NumberInput
      min={1}
      w="80px"
      value={element.quantity}
      onChange={(quantity) => {
        const newQuantity : number = typeof quantity === 'number' ? quantity : parseInt(quantity.toString(), 10)
        setBuildings(
          buildings.map((a) => (a.building === element.building ? { ...a, newQuantity } : a))
        );
      }}
    />,
  ]);
}

function getResourcesProduction(
  gameDatabase: GameDatabase,
  saveGameDatabase: SaveGameDatabase,
  selectedLanguage: string,
  buildings: ProductionTableRow[],
  datePrice: string | null
): resourceTableRow[] {
  const resources = new Map<string, number>();
  const resourceQuantityTooltip = new Map<string, string>();
  const productionDate = dayjs(datePrice);
  const saveGameIndex = saveGameDatabase.dateIndex.lowerBound(productionDate.valueOf());
  if (saveGameIndex.value) {
    // fetch all production and consumption numbers for all resources and all listed buildings
    buildings.forEach((element) => {
      const buildingEntity = gameDatabase.entities.get(element.building);
      const buildingLabel = buildingEntity
        ? gameDatabase.getLang(selectedLanguage, buildingEntity.getLocalizedNameIndex())
        : element.building;
      if (typeof element.quantity === 'number' && typeof element.productivity === 'number') {
        const numberOfBuildings: number = element.quantity;
        const productivityBuildings: number = element.productivity;
        if (buildingEntity) {
          buildingEntity.getProduction(productionDate.year()).forEach(({ resource, quantity }) => {
            const totalQuantity =
              quantity *
              numberOfBuildings *
              ((buildingEntity.getMaximumWorkers() * productivityBuildings) / 100);
            const tooltip = `[${buildingLabel}: ${totalQuantity.toFixed(2)}] `;
            resourceQuantityTooltip.set(
              resource,
              (resourceQuantityTooltip.get(resource) || '') + tooltip
            );
            resources.set(resource, (resources.get(resource) || 0) + totalQuantity);
          });
          buildingEntity.getConsumption(productionDate.year()).forEach(({ resource, quantity }) => {
            const totalQuantity =
              quantity *
              numberOfBuildings *
              ((buildingEntity.getMaximumWorkers() * productivityBuildings) / 100);
            const tooltip = `[${buildingLabel}: -${totalQuantity.toFixed(2)}] `;
            resourceQuantityTooltip.set(
              resource,
              (resourceQuantityTooltip.get(resource) || '') + tooltip
            );
            resources.set(resource, (resources.get(resource) || 0) - totalQuantity);
          });
        }
      }
    });
    return resources
      .entries()
      .map(([key, value]) => {
        const gainRubles =
          value >= 0
            ? saveGameDatabase.getData(['$Economy_SellCostRUB', key], saveGameIndex.value)[0] *
              value
            : saveGameDatabase.getData(['$Economy_PurchaseCostRUB', key], saveGameIndex.value)[0] *
              value;
        const gainDollars =
          value >= 0
            ? saveGameDatabase.getData(['$Economy_SellCostUSD', key], saveGameIndex.value)[0] *
              value
            : saveGameDatabase.getData(['$Economy_PurchaseCostUSD', key], saveGameIndex.value)[0] *
              value;

        return {
          resource : key,
          quantity: value,
          quantityHint: resourceQuantityTooltip.get(key) || '',
          gainRubles,
          gainDollars,
        }
      })
      .toArray();
  } 
    return [];
  
}

const productionTableDbKey = 'ProductionTableRows';
const ignoredResourcesDbKey = 'IgnoredResources';

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
    maxEndDate = initialEndDate;
    minStartDate = dayjs(firstEntry[0]).format('YYYY-MM-DD');
  }
  const [buildings, setBuildings] = useState<ProductionTableRow[]>([]);
  const [priceDate, setPriceDate] = useState<string | null>(initialEndDate);
  const [ignoredResources, setIgnoredResources] = useState<string[]>([]);
  const [dataBaseDataLoaded, setDataBaseDataLoaded] = useState(false);
  const producedResourceData : resourceTableRow[] =  getResourcesProduction(
    gameDatabase,
    saveGameDatabase,
    selectedLanguage,
    buildings,
    priceDate
  )

  React.useEffect(() => {
    const loadIndexedDbEntries= async () => {
      const dbBuildings = await getStoreData<ProductionTableRow[]>(Stores.pagesState, productionTableDbKey)
      if (dbBuildings) {
        setBuildings(dbBuildings)
      }
      const dbIgnoredResources = await getStoreData<string[]>(Stores.pagesState, ignoredResourcesDbKey)
      if (dbIgnoredResources) {
        setIgnoredResources(dbIgnoredResources)
      }
    };
    loadIndexedDbEntries();
    setDataBaseDataLoaded(true);
  }, [])


  React.useEffect(() => {
    if(dataBaseDataLoaded) {
      setStoreData(
        Stores.pagesState,
        productionTableDbKey,
        buildings
      );

    }
  }, [buildings])

  React.useEffect(() => {
    if(dataBaseDataLoaded) {
      setStoreData(
        Stores.pagesState,
        ignoredResourcesDbKey,
        ignoredResources
      );
    }
  }, [ignoredResources])

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
      gameDatabase.getLang(selectedLanguage,40095),
      gameDatabase.getLang(selectedLanguage, 13900),
      gameDatabase.getLang(selectedLanguage, 8090),
      gameDatabase.getLang(selectedLanguage, 8068),
    ],
    body: getBuildingsDataTable(gameDatabase, selectedLanguage, buildings, setBuildings),
  };

  const resourcesTableData: TableData = {
    caption: gameDatabase.getLang(selectedLanguage, 59000),
    head: [gameDatabase.getLang(selectedLanguage, 8074),
      gameDatabase.getLang(selectedLanguage, 70071),
      gameDatabase.getLang(selectedLanguage, 8046),
      '₽',
      '$',
    ],
    body: producedResourceData.map((row) => [

        <Checkbox
          aria-label="Select row"
          checked={ignoredResources.includes(row.resource)}
          onChange={(event) =>
            setIgnoredResources(
              event.currentTarget.checked
                ? [...ignoredResources, row.resource]
                : ignoredResources.filter((resource) => resource !== row.resource)
            )
          }
        />,
        <Text>{gameDatabase.getLang(selectedLanguage, resourcesLangIndex.get(row.resource))}</Text>,
        <Tooltip multiline label={row.quantityHint}>
          <Text c={row.quantity >= 0 ? 'blue' : 'red'}><NumberFormatter suffix={` ${gameDatabase.getLang(selectedLanguage, 70059)}`} decimalScale={1} value={row.quantity} thousandSeparator /></Text>
        </Tooltip>,
        <Text c={row.quantity >= 0 ? 'blue' : 'red'}><NumberFormatter suffix=" ₽" decimalScale={2} value={row.gainRubles} thousandSeparator /></Text>,
        <Text c={row.quantity >= 0 ? 'blue' : 'red'}><NumberFormatter suffix=" $" decimalScale={2} value={row.gainDollars} thousandSeparator /></Text>,

    ])
  };

  const totalWorkers = buildings.reduce((acc, building) => {
    return (
      acc +
      building.productivity / 100.0 *
        (gameDatabase.entities.get(building.building)?.getMaximumWorkers() || 0)
    );
  }, 0);

  const totalRubles = producedResourceData.reduce((acc, resourceProduction) => {
    return acc + (ignoredResources.includes(resourceProduction.resource) ? 0 : resourceProduction.gainRubles);
  }, 0)

  const totalDollars = producedResourceData.reduce((acc, resourceProduction) => {
    return acc + (ignoredResources.includes(resourceProduction.resource) ? 0 : resourceProduction.gainDollars);
  }, 0)

  const rublesPerWorker = totalRubles / totalWorkers;
  const dollarsPerWorker = totalDollars / totalWorkers;

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
      <Table variant="vertical" withTableBorder captionSide="top">
        <Table.Caption>{gameDatabase.getLang(selectedLanguage, 1659)}</Table.Caption>
        <Table.Tr>
          <Table.Th w={150}>{gameDatabase.getLang(selectedLanguage, 585)}</Table.Th>
          <Table.Td>{totalWorkers}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>{gameDatabase.getLang(selectedLanguage, 1501)}</Table.Th>
          <Table.Td>
            <Text c={totalRubles >= 0 ? 'blue' : 'red'}>
              <NumberFormatter suffix=" ₽" decimalScale={2} value={totalRubles} thousandSeparator />
            </Text>
          </Table.Td>
          <Table.Td>
            <Text c={totalDollars >= 0 ? 'blue' : 'red'}>
              <NumberFormatter suffix=" $" decimalScale={2} value={totalDollars} thousandSeparator />
            </Text>
          </Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>{gameDatabase.getLang(selectedLanguage, 4114)}</Table.Th>
          <Table.Td>
            <Text c={rublesPerWorker >= 0 ? 'blue' : 'red'}>
              <NumberFormatter suffix=" ₽" decimalScale={2} value={rublesPerWorker} thousandSeparator />
            </Text>
          </Table.Td>
          <Table.Td>
            <Text c={dollarsPerWorker >= 0 ? 'blue' : 'red'}>
              <NumberFormatter suffix=" $" decimalScale={2} value={dollarsPerWorker} thousandSeparator />
            </Text>
          </Table.Td>
        </Table.Tr>
      </Table>
    </Stack>
  );
}