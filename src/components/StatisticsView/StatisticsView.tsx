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
import { darken, Group, lighten, luminance, MultiSelect, Space, Stack, Tabs, Text, Badge } from '@mantine/core';
import { GameDatabase } from '@/database/gameDatabase';
import { SaveGameDatabase } from '@/database/saveGameDatabase';
import classes from './StatisticsView.module.css';


import '@mantine/charts/styles.css';



import React, { useState } from 'react';
import { DatePickerInput } from '@mantine/dates';
import { languageNumericFormat, resourcesLangIndex } from '@/database/dataMap';



import '@mantine/dates/styles.css';



import dayjs from 'dayjs';
import { IconCurrencyRubel, IconScale } from '@tabler/icons-react';
import { getStoreData, setStoreData, Stores } from '@/database/db';


export interface StatisticsViewProps {
  gameDatabase: GameDatabase;
  saveGameDatabase: SaveGameDatabase;
  selectedLanguage: string;
}

function addProperty(object: any, property: any, value: any) {
  return Object.assign(object, { [property]: value });
}

function roundToUpperTen(num: number): number {
  return Math.ceil(num / 10) * 10;
}

function roundToLowerTen(num: number): number {
  return Math.floor(num / 10) * 10;
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

const selectedResourceDbKey = 'selectedResource';
const startDateStatsDbKey = 'startDateStats';
const endDateStatsDbKey = 'endDateStats';

interface PriceChartDataProps extends StatisticsViewProps {
  startDate : string
  endDate: string
  selectedResource: string[]
}

function computeBalanceData(resource: string, startDate: string, endDate: string,
                            saveGameDatabase: SaveGameDatabase): Array<{date:string, value: number}> {
  const factoryConsumption = saveGameDatabase.getDataSet(
    ['$Resources_SpendFactories', ` ${resource} `],
    dayjs(startDate).valueOf(),
    dayjs(endDate).valueOf(),
    150
  )
  const factoryProduction = saveGameDatabase.getDataSet(
    ['$Resources_Produced', ` ${resource} `],
    dayjs(startDate).valueOf(),
    dayjs(endDate).valueOf(),
    150
  )
  const citizenConsumption = saveGameDatabase.getDataSet(
    ['$Resources_SpendShops', ` ${resource} `],
    dayjs(startDate).valueOf(),
    dayjs(endDate).valueOf(),
    150
  )
  const vehicleConsumption = saveGameDatabase.getDataSet(
    ['$Resources_SpendVehicles', ` ${resource} `],
    dayjs(startDate).valueOf(),
    dayjs(endDate).valueOf(),
    150
  )



  return factoryConsumption.map((e, index) => {
    //console.log(`production ${factoryProduction[index].value} consumption ${factoryConsumption[index].value} citizen ${citizenConsumption[index].value} vehicle ${vehicleConsumption[index].value}`)
    return {
      date: dayjs(e.date).format('YYYY-MM-DD'),
      value: factoryProduction[index].value - e.value - citizenConsumption[index].value - vehicleConsumption[index].value,
    }
  })
}

function InteriorResourceBalanceChartData({ gameDatabase, saveGameDatabase, selectedLanguage, startDate, endDate, selectedResource} : PriceChartDataProps) {

  const chartData = selectedResource.map((e) => ({
    resource: e,
    data: computeBalanceData(e, startDate, endDate, saveGameDatabase),
  }));

  const data = [];

  if (chartData.length > 0) {
    const dates = chartData[0].data.map((e) => e.date);
    let index = 0;
    for (const d of dates) {
      const record = { date: d };
      for (const dataSet of chartData) {
        addProperty(record, dataSet.resource, dataSet.data[index].value);
      }
      data.push(record);
      index++;
    }
  }

  const minBalance = roundToLowerTen(chartData
    .map((e) => e.data.reduce((a, b) => Math.min(a, b.value), Number.MAX_SAFE_INTEGER))
    .reduce((a, b) => Math.min(a, b), Number.MAX_SAFE_INTEGER));

  const maxBalance = roundToUpperTen(chartData
    .map((e) => e.data.reduce((a, b) => Math.max(a, b.value), Number.MIN_SAFE_INTEGER))
    .reduce((a, b) => Math.max(a, b), Number.MIN_SAFE_INTEGER));

  const series: { name: string; label: string }[] = selectedResource.map((e) => ({
    name: e,
    label: gameDatabase.getLang(selectedLanguage, resourcesLangIndex.get(e) || 0),
    color: stringToColor(e, 0.5)
  }));

  return (
      <LineChart
        h={300}
        className={classes.root}
        curveType="linear"
        withDots={false}
        withLegend
        data={data}
        dataKey="date"
        referenceLines={[
          { y: 0, label: '0 t', color: 'var(--line-color)' },
        ]}
        xAxisLabel={gameDatabase.getLang(selectedLanguage, 612)}
        yAxisProps={{domain: [-Math.max(-minBalance, maxBalance), Math.max(-minBalance, maxBalance)] }}
        unit={` ${  gameDatabase.getLang(selectedLanguage, 590)}`}
        valueFormatter={(value) =>
         new Intl.NumberFormat((languageNumericFormat.get(selectedLanguage)?.locale) || 'en-US',
            { maximumSignificantDigits: 1 }).format(value)}
        series={series}
      />
  );
}

function PriceChartData({ gameDatabase, saveGameDatabase, selectedLanguage, startDate, endDate, selectedResource} : PriceChartDataProps) {

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
      <LineChart
        h={300}
        xAxisLabel={gameDatabase.getLang(selectedLanguage, 612)}
        withDots={false}
        withLegend
        data={data}
        dataKey="date"
        unit="₽"
        valueFormatter={(value) => new Intl.NumberFormat((languageNumericFormat.get(selectedLanguage)?.locale) || 'en-US').format(value)}
        series={series}
        curveType="natural"
      />
  );
}

export function StatisticsView({
  gameDatabase,
  saveGameDatabase,
  selectedLanguage,
}: StatisticsViewProps) {

  const [dataBaseDataLoaded, setDataBaseDataLoaded] = useState(false);
  const [selectedResource, setSelectedResource] = useState(['clothes']);

  const resourceLabels = Array.from(resourcesLangIndex
    .entries())
    .map((e) => ({ value: e[0], label: gameDatabase.getLang(selectedLanguage, e[1]) }))
    .toSorted((a, b) => a.label.localeCompare(b.label));

  // array of strings value when multiple is true
  const lastEntry = saveGameDatabase.dateIndex.last();
  let initialStartDate: string = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
  let initialEndDate: string = dayjs().format('YYYY-MM-DD');
  if (lastEntry) {
    initialEndDate = dayjs(lastEntry[0]).format('YYYY-MM-DD');
    initialStartDate = dayjs(lastEntry[0]).subtract(1, 'year').format('YYYY-MM-DD');
  }
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);


  React.useEffect(() => {
    const loadIndexedDbEntries= async () => {
      const dbStartDate = await getStoreData<string>(Stores.pagesState, startDateStatsDbKey)
      if (dbStartDate) {
        setStartDate(dbStartDate)
      }
      const dbEndDate = await getStoreData<string>(Stores.pagesState, endDateStatsDbKey)
      if (dbEndDate) {
        setEndDate(dbEndDate)
      }
      const dbSelectedResources = await getStoreData<string[]>(Stores.pagesState, selectedResourceDbKey)
      if (dbSelectedResources) {
        setSelectedResource(dbSelectedResources)
      }
    };
    loadIndexedDbEntries();
    setDataBaseDataLoaded(true);
  }, [])


  React.useEffect(() => {
    if(dataBaseDataLoaded) {
      setStoreData(
        Stores.pagesState,
        startDateStatsDbKey,
        startDate
      );
    }
  }, [startDate])

  React.useEffect(() => {
    if(dataBaseDataLoaded) {
      setStoreData(
        Stores.pagesState,
        endDateStatsDbKey,
        endDate
      );
    }
  }, [endDate])

  React.useEffect(() => {
    if(dataBaseDataLoaded) {
      setStoreData(
        Stores.pagesState,
        selectedResourceDbKey,
        selectedResource
      );
    }
  }, [selectedResource])



  return (
    <Stack>
      <Space h="xl" />
      <Text size="md">
        Basic chart, you may give feedback in order to display more useful statistics
      </Text>
      <Group grow>
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
      <Badge size="lg" leftSection={<IconCurrencyRubel />}>
        {gameDatabase.getLang(selectedLanguage, 2130)}</Badge>
      <PriceChartData
        gameDatabase={gameDatabase}
        saveGameDatabase={saveGameDatabase}
        selectedLanguage={selectedLanguage}
        startDate={startDate}
        endDate={endDate}
        selectedResource={selectedResource}
      />
      <Badge size="lg"  leftSection={<IconScale />}>
        {gameDatabase.getLang(selectedLanguage, 1511)}</Badge>
      <InteriorResourceBalanceChartData
        gameDatabase={gameDatabase}
        saveGameDatabase={saveGameDatabase}
        selectedLanguage={selectedLanguage}
        startDate={startDate}
        endDate={endDate}
        selectedResource={selectedResource}
      />
    </Stack>
  );
}
