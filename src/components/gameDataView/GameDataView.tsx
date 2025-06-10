/*
 * Copyright (C) 2025
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

export interface GameDataViewProps {
  gameDatabase: GameDatabase
  saveGameDatabase: SaveGameDatabase
}

function chunk<T>(array: T[], size: number): T[][] {
  if (!array.length) {
    return [];
  }
  const head = array.slice(0, size);
  const tail = array.slice(size);
  return [head, ...chunk(tail, size)];
}


export function GameDataView({ gameDatabase, saveGameDatabase }: GameDataViewProps) {
  const [activePage, setPage] = useState(1);
  const data = chunk(gameDatabase.entities.entries().toArray(),
    5
  );

  const entitiesCards = data[activePage - 1].map(([key, value]) => (

    <Card withBorder shadow="sm" radius="md" key={key}>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Text fw={500}>{key}</Text>
        </Group>
      </Card.Section>
      <Space h="md" />
      <Table variant="vertical" layout="fixed" withTableBorder>
        <Table.Tbody>
          <Table.Tr>
            <Table.Th w={160}>Type</Table.Th>
            <Table.Td>{value.data}</Table.Td>
          </Table.Tr>

          <Table.Tr>
            <Table.Th>Status</Table.Th>
            <Table.Td>Open</Table.Td>
          </Table.Tr>

          <Table.Tr>
            <Table.Th>Total issues</Table.Th>
            <Table.Td>135</Table.Td>
          </Table.Tr>

          <Table.Tr>
            <Table.Th>Total story points</Table.Th>
            <Table.Td>874</Table.Td>
          </Table.Tr>

          <Table.Tr>
            <Table.Th>Last updated at</Table.Th>
            <Table.Td>September 26, 2024 17:41:26</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Card>
  ))
  
  return (
    <Stack align="center">
      <Pagination total={data.length} value={activePage} onChange={setPage} mt="sm" />
    <Stack>
      {entitiesCards}
    </Stack>
  </Stack>
  );
}

export default GameDataView;