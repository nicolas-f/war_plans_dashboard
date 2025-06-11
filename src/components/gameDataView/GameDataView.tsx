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
import { useState } from 'react';
import { Card, Group, Pagination, Space, Stack, Table, Text, Input, CloseButton, Tooltip } from '@mantine/core';
import { resourcesLangIndex } from '@/database/dataMap';
import { GameDatabase } from '@/database/gameDatabase';
import { SaveGameDatabase } from '@/database/saveGameDatabase';


export interface GameDataViewProps {
  gameDatabase: GameDatabase
  saveGameDatabase: SaveGameDatabase
  selectedLanguage: string
}

function chunk<T>(array: T[], size: number): T[][] {
  if (!array.length) {
    return [];
  }
  const head = array.slice(0, size);
  const tail = array.slice(size);
  return [head, ...chunk(tail, size)];
}


export function GameDataView({ gameDatabase, saveGameDatabase, selectedLanguage}: GameDataViewProps) {
  const [searchValue, setSearchValue] = useState('');
  const [activePage, setPage] = useState(1);


  const allData = gameDatabase.entities.entries()
    .filter((e) => searchValue.trim().length === 0 ||
      gameDatabase.getLang(selectedLanguage,
        e[1].getLocalizedNameIndex()).toLowerCase().indexOf(searchValue.toLowerCase()) > -1).toArray();

  const data = chunk(allData,
    4
  );

  if(activePage - 1 >= data.length) {
    setPage(data.length)
  }

  function GenerateCard([entityKey, entityInstance]: [string, Entity]) {
    return (
      <Card withBorder shadow="sm" radius="md" key={entityKey}>
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Tooltip label={entityKey}>
              <Text>
                  {gameDatabase.getLang(selectedLanguage, entityInstance.getLocalizedNameIndex())}
              </Text>
            </Tooltip>
          </Group>
        </Card.Section>
        <Space h="md" />
        <Table variant="vertical" striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Tbody>
            <Table.Tr>
              <Table.Th>{gameDatabase.getLang(selectedLanguage, 1522)}</Table.Th>
              <Table.Td>{entityInstance.getType()}</Table.Td>
              <Table.Td />
            </Table.Tr>
            <Table.Tr>
              <Table.Th>{gameDatabase.getLang(selectedLanguage, 2002)}</Table.Th>
              <Table.Td>{entityInstance.getMaximumWorkers()}</Table.Td>
              <Table.Td />
            </Table.Tr>
            {entityInstance.getMaximumProduction().map((e) => (
              <Table.Tr key={e.resource}>
                <Table.Th>{gameDatabase.getLang(selectedLanguage, 2006)}</Table.Th>
                <Table.Td>
                  {gameDatabase.getLang( selectedLanguage, resourcesLangIndex.get(e.resource) || 0, e.resource )}
                </Table.Td>
                <Table.Td>{(e.quantity).toFixed(1)}</Table.Td>
              </Table.Tr>
            ))}
            {entityInstance.getMaximumConsumption().map((e) => (
              <Table.Tr key={e.resource}>
                <Table.Th>{gameDatabase.getLang(selectedLanguage, 2007)}</Table.Th>
                <Table.Td>
                  {gameDatabase.getLang( selectedLanguage, resourcesLangIndex.get(e.resource) || 0, e.resource )}
                </Table.Td>
                <Table.Td>{(e.quantity).toFixed(1)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    );
  }

  const entitiesCards = (activePage - 1 < data.length ? data[activePage - 1] : []).map(GenerateCard);

  return (
    <Stack align="center">
      <Input
        placeholder={gameDatabase.getLang(selectedLanguage, 59057)}
        value={searchValue}
        onChange={(event) => setSearchValue(event.currentTarget.value)}
        rightSectionPointerEvents="all"
        mt="md"
        rightSection={
          <CloseButton
            aria-label="Clear input"
            onClick={() => setSearchValue('')}
            style={{ display: searchValue ? undefined : 'none' }}
          />
        }
      />
      <Pagination total={data.length} value={activePage} onChange={setPage} mt="sm" />
    <Stack maw="700px">
      {entitiesCards}
    </Stack>
  </Stack>
  );

}

export default GameDataView;