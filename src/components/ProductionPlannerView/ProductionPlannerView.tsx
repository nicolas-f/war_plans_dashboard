import { ComboboxItem } from '@mantine/core/lib/components/Combobox/Combobox.types';

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
import { Autocomplete, Slider, Stack, Table, NumberInput } from '@mantine/core';
import { Entity } from '@/database/entity';
import { GameDatabase } from '@/database/gameDatabase';
import { SaveGameDatabase } from '@/database/saveGameDatabase';
import { useState } from 'react';


export interface ProductionGameContentProps {
  gameDatabase: GameDatabase;
  saveGameDatabase: SaveGameDatabase;
  selectedLanguage: string;
}

const elements = [
  { position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
  { position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
  { position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
  { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
  { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
];

export function ProductionGameContent({
                                        gameDatabase,
                                        saveGameDatabase,
                                        selectedLanguage,
                                      }: ProductionGameContentProps) {
  // Generate building search data
  const buildingSelectionData: { group: string; items: ComboboxItem[] }[] = [];
  const [selectedBuilding, setSelectedBuilding] = useState('');
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


  const rows = elements.map((element) => (
  <Table.Tr key={element.name}>
    <Table.Td>
      {element.name}
    </Table.Td>
    <Table.Td>
      <Slider
        w="120px"
        min={0}
        max={100}
        defaultValue={100}
        marks={[
          { value: 0, label: '0%' },
          { value: 50, label: '50%' },
          { value: 100, label: '100%' },
        ]}
      /></Table.Td>
    <Table.Td>
      <NumberInput value={1} min={1} w="80px" />
    </Table.Td>
    <Table.Td>{element.position}</Table.Td>
  </Table.Tr>
));

  return (
    <Stack>
      <Autocomplete
        label={gameDatabase.getLang(selectedLanguage, 40003)}
        placeholder={gameDatabase.getLang(selectedLanguage, 13900)}
        // limit={5}
        data={buildingSelectionData}
        value={selectedBuilding}
        onChange={(value) => setSelectedBuilding(value)}
      />
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{gameDatabase.getLang(selectedLanguage, 13900)}</Table.Th>
            <Table.Th>{gameDatabase.getLang(selectedLanguage, 8090)}</Table.Th>
            <Table.Th>Quantity</Table.Th>
            <Table.Th>Atomic mass</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Stack>
  );
}