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
import { MultiSelect, Stack, Group, Text, Tabs } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { GameDatabase } from '@/database/gameDatabase';
import { SaveGameDatabase } from '@/database/saveGameDatabase';
import '@mantine/charts/styles.css';
import { resourcesLangIndex } from '@/database/dataMap';
import { useState } from 'react';
import { DatePickerInput } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { IconCurrencyRubel } from '@tabler/icons-react';
import dayjs from 'dayjs';

export interface StatisticsViewProps {
  gameDatabase: GameDatabase
  saveGameDatabase: SaveGameDatabase
  selectedLanguage: string
}
const data = [
  {
    date: 'Mar 22',
    Apples: 2890,
    Oranges: 2338,
    Tomatoes: 2452,
  },
  {
    date: 'Mar 23',
    Apples: 2756,
    Oranges: 2103,
    Tomatoes: 2402,
  },
  {
    date: 'Mar 24',
    Apples: 3322,
    Oranges: 986,
    Tomatoes: 1821,
  },
  {
    date: 'Mar 25',
    Apples: 3470,
    Oranges: 2108,
    Tomatoes: 2809,
  },
  {
    date: 'Mar 26',
    Apples: 3129,
    Oranges: 1726,
    Tomatoes: 2290,
  },
];


function PriceChartData({ gameDatabase, saveGameDatabase, selectedLanguage}: StatisticsViewProps) {
  // array of strings value when multiple is true
  const lastEntry = saveGameDatabase.dateIndex.last()
  let initialStartDate: string | null = null
  let initialEndDate: string | null = null
  if(lastEntry) {
    initialEndDate = dayjs(lastEntry[0]).format('YYYY-MM-DD')
    initialStartDate = dayjs(lastEntry[0]).subtract(1, 'year').format('YYYY-MM-DD')
  }
  const [startDate, setStartDate] = useState<string | null>(initialStartDate);
  const [endDate, setEndDate] = useState<string | null>(initialEndDate);
  const resourceLabels = resourcesLangIndex.entries().map((e) => (
    { value: e[0], label: gameDatabase.getLang(selectedLanguage, e[1]) }
  )).toArray()
  const [selectedResource, setSelectedResource] = useState(["clothes"]);
  return (
    <Stack
      align="center"
      justify="center"
      gap="md">
      <Group>
        <DatePickerInput
          label={gameDatabase.getLang(selectedLanguage, 1653)}
          value={startDate}
          onChange={setStartDate}
        />
        <MultiSelect
          value={selectedResource} onChange={setSelectedResource}
          label={gameDatabase.getLang(selectedLanguage, 755)}
          data={resourceLabels}
        />
        <DatePickerInput
          label={gameDatabase.getLang(selectedLanguage, 1654)}
          value={endDate}
          onChange={setEndDate}
        />
      </Group>
      <LineChart
        h={300}
        data={data}
        dataKey="date"
        series={[
          { name: 'Apples', color: 'indigo.6' },
          { name: 'Oranges', color: 'blue.6' },
          { name: 'Tomatoes', color: 'teal.6' },
        ]}
        curveType="linear"
      />
    </Stack>
  );
}

export function StatisticsView({ gameDatabase, saveGameDatabase, selectedLanguage}: StatisticsViewProps) {
  return (
    <Stack >
      <Text size="md" >
        Basic chart, you may give feedback in order to display more useful statistics
      </Text>
      <Tabs defaultValue="prices">
      <Tabs.List>
        <Tabs.Tab value="prices" leftSection={<IconCurrencyRubel size={12} />}>
          {gameDatabase.getLang(selectedLanguage, 2130)}
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="prices">
        <PriceChartData gameDatabase={gameDatabase} saveGameDatabase={saveGameDatabase} selectedLanguage={selectedLanguage} />
      </Tabs.Panel>
    </Tabs>
  </Stack>)
  //return (<PriceChartData gameDatabase={gameDatabase} saveGameDatabase={saveGameDatabase} selectedLanguage={selectedLanguage} />);
}
