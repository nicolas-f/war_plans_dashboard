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
import { LineChart } from '@mantine/charts';
import { darken, Group, lighten, luminance, MantineColor, MultiSelect, Stack, Tabs, Text } from '@mantine/core';
import { DefaultMantineColor } from '@mantine/core/lib/core/MantineProvider/theme.types';
import { GameDatabase } from '@/database/gameDatabase';
import { SaveGameDatabase } from '@/database/saveGameDatabase';
import '@mantine/charts/styles.css';
import { useState } from 'react';
import { DatePickerInput } from '@mantine/dates';
import { resourcesLangIndex } from '@/database/dataMap';
import '@mantine/dates/styles.css';
import dayjs from 'dayjs';
import { IconCurrencyRubel } from '@tabler/icons-react';

export interface StatisticsViewProps {
  gameDatabase: GameDatabase;
  saveGameDatabase: SaveGameDatabase;
  selectedLanguage: string;
}

function addProperty(object: any, property: any, value: any) {
  return Object.assign(object, { [property]: value });
}

function stringToColor(input: string, luminanceTarget : number): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }

  // Convert to unsigned 32-bit integer and take modulo 0xFFFFFF
  const colorValue = (hash >>> 0) % 0xFFFFFF;

  // Extract RGB components
  const r = (colorValue >> 16) & 0xFF;
  const g = (colorValue >> 8) & 0xFF;
  const b = colorValue & 0xFF;

  // Convert to hex string with padding
  let colorString =`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  let lum = luminance(colorString)

  // Move to target luminance

  while(lum < luminanceTarget) {
    colorString = lighten(colorString, 0.1)
    lum = luminance(colorString)
  }

  while(lum > luminanceTarget) {
    colorString = darken(colorString, 0.1)
    lum = luminance(colorString)
  }

  return colorString
}

function PriceChartData({ gameDatabase, saveGameDatabase, selectedLanguage }: StatisticsViewProps) {
  // array of strings value when multiple is true
  const lastEntry = saveGameDatabase.dateIndex.last();
  let initialStartDate: string | null = null;
  let initialEndDate: string | null = null;
  if (lastEntry) {
    initialEndDate = dayjs(lastEntry[0]).format('YYYY-MM-DD');
    initialStartDate = dayjs(lastEntry[0]).subtract(1, 'year').format('YYYY-MM-DD');
  }
  const [startDate, setStartDate] = useState<string | null>(initialStartDate);
  const [endDate, setEndDate] = useState<string | null>(initialEndDate);
  const resourceLabels = Array.from(resourcesLangIndex
    .entries())
    .map((e) => ({ value: e[0], label: gameDatabase.getLang(selectedLanguage, e[1]) }))
    .toSorted((a, b) => a.label.localeCompare(b.label));
  const [selectedResource, setSelectedResource] = useState(['clothes']);
  const chartData = selectedResource.map((e) => ({
    resource: e,
    data: saveGameDatabase.getDataSet(
      ['$Economy_PurchaseCostRUB', ` ${e} `],
      dayjs(startDate).valueOf(),
      dayjs(endDate).valueOf(),
      150
    ),
  }));

  const data = [];
  const series: { name: string; color: string }[] = selectedResource.map((e) => ({
    name: gameDatabase.getLang(selectedLanguage, resourcesLangIndex.get(e) || 0),
    color: stringToColor(e, 0.5),
  }));

  if (chartData.length > 0) {
    const dates = chartData[0].data.map((e) => e.date);
    let index = 0;
    for (const epoch of dates) {
      const record = { date: dayjs(epoch).format('YYYY-MM-DD') };
      for (const dataSet of chartData) {
        addProperty(record, gameDatabase.getLang(selectedLanguage, resourcesLangIndex.get(dataSet.resource) || 0), dataSet.data[index].value);
      }
      data.push(record);
      index++;
    }
  }
  return (
    <Stack align="center" justify="center" gap="lg">
      <Group>
        <DatePickerInput
          label={gameDatabase.getLang(selectedLanguage, 1653)}
          value={startDate}
          onChange={setStartDate}
        />
        <MultiSelect
          value={selectedResource}
          onChange={setSelectedResource}
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
        withDots={false}
        withLegend
        data={data}
        dataKey="date"
        unit="₽"
        valueFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
        series={series}
        curveType="linear"
      />
    </Stack>
  );
}

export function StatisticsView({
  gameDatabase,
  saveGameDatabase,
  selectedLanguage,
}: StatisticsViewProps) {
  return (
    <Stack>
      <Text size="md">
        Basic chart, you may give feedback in order to display more useful statistics
      </Text>
      <Tabs defaultValue="prices">
        <Tabs.List>
          <Tabs.Tab value="prices" leftSection={<IconCurrencyRubel size={24} />}>
            {gameDatabase.getLang(selectedLanguage, 2130)}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="prices">
          <PriceChartData
            gameDatabase={gameDatabase}
            saveGameDatabase={saveGameDatabase}
            selectedLanguage={selectedLanguage}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
