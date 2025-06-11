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
import { Badge, Box, Button, Card, Group, Pagination, Space, Stack, Table, Text } from '@mantine/core';
import { GameDatabase } from '@/database/gameDatabase';
import { useState } from 'react';
import { SaveGameDatabase } from '@/database/saveGameDatabase';
import { resourcesLangIndex } from '@/database/dataMap';

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
  const [activePage, setPage] = useState(1);
  const data = chunk(gameDatabase.entities.entries().toArray(),
    4
  );

  const entitiesCards = data[activePage - 1].map(([entityKey, entityInstance]) => (

    <Card withBorder shadow="sm" radius="md" key={entityKey}>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Text fw={500}>{ gameDatabase.getLang(selectedLanguage, entityInstance.getLocalizedNameIndex())}</Text>
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
            <Table.Td>{entityInstance.getWorkersNeeded()}</Table.Td>
            <Table.Td />
          </Table.Tr>
          {entityInstance.getProduction().map((e) => (
            <Table.Tr key={e.resource}>
              <Table.Th>{gameDatabase.getLang(selectedLanguage, 2006)}</Table.Th>
              <Table.Td>{resourcesLangIndex.has(e.resource) ? gameDatabase.getLang(selectedLanguage, (resourcesLangIndex.get(e.resource)) || 0) : e.resource}</Table.Td>
              <Table.Td>{(e.quantity*entityInstance.getWorkersNeeded()).toFixed(1)}</Table.Td>
            </Table.Tr>
          ))}
          {entityInstance.getConsumption().map((e) => (
            <Table.Tr key={e.resource}>
              <Table.Th>{gameDatabase.getLang(selectedLanguage, 2007)}</Table.Th>
              <Table.Td>{resourcesLangIndex.has(e.resource) ? gameDatabase.getLang(selectedLanguage, (resourcesLangIndex.get(e.resource)) || 0) : e.resource}</Table.Td>
              <Table.Td>{(e.quantity*entityInstance.getWorkersNeeded()).toFixed(1)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  ))
  
  return (
    <Stack align="center">
      <Pagination total={data.length} value={activePage} onChange={setPage} mt="sm" />
    <Stack maw="700px">
      {entitiesCards}
    </Stack>
  </Stack>
  );

}

export default GameDataView;