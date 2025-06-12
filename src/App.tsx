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

import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
  IconBuildingFactory2,
  IconDatabase,
  IconFileZip,
  IconGraph,
  IconMoon,
  IconPhoto,
  IconSettings,
  IconSun,
  IconUpload,
  IconX,
  IconZip,
} from '@tabler/icons-react';
import savegameData from '/src/assets/data/default_save.zip?url';
import gameData from '/src/assets/data/media_soviet.zip?url';
import cx from 'clsx';
import {
  ActionIcon,
  AppShell,
  Box,
  Flex,
  Group,
  LoadingOverlay,
  MantineProvider,
  NativeSelect,
  Notification,
  Space,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE, FileWithPath } from '@mantine/dropzone';
import GameDataView from '@/components/GameDataView/GameDataView';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';
import { StatisticsView } from '@/components/StatisticsView/StatisticsView';
import { GameDatabase } from '@/database/gameDatabase';
import { SaveGameDatabase } from '@/database/saveGameDatabase';
import { parseSaveGameZipFileFromUrl } from '@/features/parseSaveData';
import { parseZipFileFromUrl } from './features/parseGameData';
import classes from './App.module.css';
import {SettingsView} from "@/components/SettingsView/SettingsView";
function onDropSaveGame (saveFile :FileWithPath[]) {

}


function ProductionGameContent() {
  return <Notification title="We notify you that">Production data page content</Notification>;
}

function DarkLightButton() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });

  return (
    <ActionIcon
      onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
      variant="default"
      size="input-sm"
      aria-label="Toggle color scheme"
    >
      <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
      <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
    </ActionIcon>
  );
}

/**
 * Main application component that manages the overall structure and state of the app.
 *
 * @return {JSX.Element} The rendered structure of the application, including headers, navigation, and main content.
 */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [gameDatabase, setGameDatabase] = useState(new GameDatabase());
  const [savegameDatabase, setSavegameDatabase] = useState(new SaveGameDatabase());
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const pages = [
    {
      id: 'settings',
      icon: IconSettings,
      label: 'Settings',
    },
    {
      id: 'gamedata',
      icon: IconDatabase,
      label: 'Game & SaveGame Data',
    },
    {
      id: 'production',
      icon: IconBuildingFactory2,
      label: 'Production',
    },
    {
      id: 'stats',
      icon: IconGraph,
      label: 'Game statistics',
    },
  ];

  const [activePage, setActivePage] = useState(pages[0].id);

  React.useEffect(() => {
    const loadDatabase = async () => {
      try {
        setLoading(true);
        const start = new Date().getTime();
        await loadGameData();
        let elapsed = new Date().getTime() - start;
        console.log(`Game data loaded in ${elapsed} ms`);
      } finally {
        setLoading(false);
      }
    };

    const loadGameData = async () => {
      const GAME_DATABASE = await parseZipFileFromUrl(gameData);
      const SAVE_GAME_DATABASE = await parseSaveGameZipFileFromUrl(savegameData);

      setGameDatabase(GAME_DATABASE);
      setSavegameDatabase(SAVE_GAME_DATABASE);

      const epochStartValue = SAVE_GAME_DATABASE.dateIndex.firstKey();
      if (!startDate && epochStartValue !== undefined && epochStartValue !== null) {
        const INITIAL_EPOCH = Number(epochStartValue);

        if (!Number.isNaN(INITIAL_EPOCH)) {
          const FORMATTED_DATE = dayjs(INITIAL_EPOCH).format('YYYY-MM-DD');
          setStartDate(FORMATTED_DATE);
        }
      }

      const epochEndValue = SAVE_GAME_DATABASE.dateIndex.lastKey();
      if (!endDate && epochEndValue !== undefined && epochEndValue !== null) {
        const INITIAL_EPOCH = Number(epochEndValue);

        if (!Number.isNaN(INITIAL_EPOCH)) {
          const FORMATTED_DATE = dayjs(INITIAL_EPOCH).format('YYYY-MM-DD');
          setEndDate(FORMATTED_DATE);
        }
      }
    };
    loadDatabase();
  }, []);

  return (
    <MantineProvider defaultColorScheme="dark">
      <Box pos="relative">
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <AppShell
          header={{ height: 50 }}
          navbar={{
            width: 330,
            breakpoint: 'sm',
          }}
          padding="md"
        >
          <AppShell.Header>
            <Space h="5px" />
            <Group justify="center" gap="lg">
              <DateInput
                value={startDate}
                onChange={setStartDate}
                placeholder={gameDatabase.getLang(selectedLanguage, 1653)}
              />
              <DateInput
                value={endDate}
                onChange={setEndDate}
                placeholder={gameDatabase.getLang(selectedLanguage, 1654)}
              />
              <NativeSelect
                value={selectedLanguage}
                onChange={(event) => setSelectedLanguage(event.currentTarget.value)}
                data={gameDatabase.translations.keys().toArray()}
              />
              <DarkLightButton />
            </Group>
          </AppShell.Header>
          <AppShell.Navbar>
            <NavigationBar defaultId={activePage} links={pages} onActiveChange={setActivePage} />
          </AppShell.Navbar>
          <AppShell.Main>
            {(() => {
              switch (activePage) {
                case 'settings':
                  return <SettingsView />;
                case 'gamedata':
                  return (
                    <GameDataView
                      gameDatabase={gameDatabase}
                      saveGameDatabase={savegameDatabase}
                      selectedLanguage={selectedLanguage}
                    />
                  );
                case 'production':
                  return <ProductionGameContent />;
                case 'stats':
                  return (
                    <StatisticsView
                      gameDatabase={gameDatabase}
                      saveGameDatabase={savegameDatabase}
                      selectedLanguage={selectedLanguage}
                    />
                  );
                default:
                  return null;
              }
            })()}
          </AppShell.Main>
        </AppShell>
      </Box>
    </MantineProvider>
  );
}
