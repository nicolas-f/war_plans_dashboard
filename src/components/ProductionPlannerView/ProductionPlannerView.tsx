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
import { useState } from 'react';
import { IconCross, IconRowRemove } from '@tabler/icons-react';
import { ActionIcon, Box, NumberInput, Select, Slider, Stack, Table, TableData } from '@mantine/core';
import { ComboboxItem } from '@mantine/core/lib/components/Combobox/Combobox.types';
import { Entity } from '@/database/entity';
import { GameDatabase } from '@/database/gameDatabase';
import { SaveGameDatabase } from '@/database/saveGameDatabase';


;









export interface ProductionGameContentProps {
  gameDatabase: GameDatabase;
  saveGameDatabase: SaveGameDatabase;
  selectedLanguage: string;
}


class ProductionTableRow {
  building: string;
  productivity: number;
  quantity: string | number;
  constructor(building : string) {
    this.building = building;
    this.productivity = 100;
    this.quantity = 1;
  }
}

export function ProductionGameContent({
                                        gameDatabase,
                                        saveGameDatabase,
                                        selectedLanguage,
                                      }: ProductionGameContentProps) {
  // Generate building search data
  const buildingSelectionData: { group: string; items: ComboboxItem[] }[] = [];
  gameDatabase.entities.entries()
    .filter(value => value[1].getLocalizedNameIndex() > 0 && (value[1].getMaximumWorkers() > 0 || value[1].getLivingPopulation() > 0))
    .forEach((value: [string, Entity]) => {
    const group = value[1].getType();
    const maxWorker = value[1].getMaximumWorkers();
    const maxPopulation = value[1].getLivingPopulation();
    const label = maxWorker > 0 ? `${gameDatabase.getLang(selectedLanguage, value[1].getLocalizedNameIndex())}
     - ${maxWorker} ${gameDatabase.getLang(selectedLanguage, 585)}` : `${gameDatabase.getLang(selectedLanguage, value[1].getLocalizedNameIndex())}
     - ${maxPopulation} ${gameDatabase.getLang(selectedLanguage, 2810)}`
    const comboboxItem : ComboboxItem = {value: value[1].name,
      label}
    const index = buildingSelectionData.findIndex((e) => e.group === group)
    if( index === -1) {
      buildingSelectionData.push({group, items:[comboboxItem]})
    } else {
      buildingSelectionData[index].items.push(comboboxItem)
    }
  })
  const [buildings, setBuildings] = useState<ProductionTableRow[]>([]);

  const rows = buildings.map((element) => [
    <ActionIcon
      variant="filled"
      onClick={() => setBuildings(buildings.filter((a) => a !== element))}
    >
      <IconRowRemove />
    </ActionIcon>,
    gameDatabase.entities.get(element.building)!.getLocalizedNameIndex() > 0
      ? gameDatabase.getLang(selectedLanguage, gameDatabase.entities.get(element.building)!.getLocalizedNameIndex())
      : gameDatabase.entities.get(element.building)!.name,
    <Slider
      w="120px"
      min={0}
      max={100}
      defaultValue={100}
      step={10}
      onChange={(v) => {
        element.productivity = v;
      }}
      marks={[
        { value: 0, label: '0%' },
        { value: 50, label: '50%' },
        { value: 100, label: '100%' },
      ]}
    />,
    <NumberInput min={1} w="80px" defaultValue={1} />,
  ]);

  const tableData: TableData = {
    head: ["",
      gameDatabase.getLang(selectedLanguage, 13900),
      gameDatabase.getLang(selectedLanguage, 8090),
      'Quantity'],
    body: rows,
  };

  return (
    <Stack>
      <Select
        w={320}
        searchable
        clearable
        label={gameDatabase.getLang(selectedLanguage, 40003)}
        placeholder={gameDatabase.getLang(selectedLanguage, 13900)}
        // limit={5}
        data={buildingSelectionData}
        onChange={(value, option) => {
          const entity = gameDatabase.entities.get(option.value);
          if (entity) {
            setBuildings([...buildings ,new ProductionTableRow(option.value)]);
          }
        }}
      />
      <Table data={tableData} />
    </Stack>
  );
}