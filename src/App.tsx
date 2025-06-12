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
  IconGraph,
  IconMoon,
  IconSettings,
  IconSun,

} from '@tabler/icons-react';
import savegameData from '/src/assets/data/default_save.zip?url';
import gameData from '/src/assets/data/media_soviet.zip?url';
import cx from 'clsx';
import {
  ActionIcon,
  AppShell,
  Box,
  Group,
  LoadingOverlay,
  MantineProvider,
  NativeSelect,
  Notification,
  Space,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import GameDataView from '@/components/GameDataView/GameDataView';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';
import { StatisticsView } from '@/components/StatisticsView/StatisticsView';
import { GameDatabase } from '@/database/gameDatabase';
import { SaveGameDatabase } from '@/database/saveGameDatabase';
import {
  parseSaveGameIniFile,
  parseSaveGameZipFileFromBlob,
  parseSaveGameZipFileFromUrl,
} from '@/features/parseSaveData';
import { parseZipFileFromUrl } from './features/parseGameData';
import classes from './App.module.css';
import {SettingsView} from "@/components/SettingsView/SettingsView";
import { a } from 'vitest/dist/chunks/suite.d.FvehnV49';
import { FileWithPath } from 'react-dropzone';



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
  const [savegameLoading, setSavegameLoading] = useState(false);
  const [gameDatabase, setGameDatabase] = useState(new GameDatabase());
  const [savegameDatabase, setSavegameDatabase] = useState(new SaveGameDatabase());
  const [selectedLanguage, setSelectedLanguage] = useState('English');

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
        const elapsed = new Date().getTime() - start;
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

    };
    loadDatabase();
  }, []);

  async function onDropFile(files: FileWithPath[]) {
    if(files.length === 0) {return;}
    setSavegameLoading(true);
    try{
      const start = new Date().getTime();
      if(files[0].name.toLowerCase().endsWith('.zip')) {
        const arrayBuffer = await files[0].arrayBuffer();
        const SAVE_GAME_DATABASE = await parseSaveGameZipFileFromBlob(new Blob([arrayBuffer]));
        setSavegameDatabase(SAVE_GAME_DATABASE);
      } else if(files[0].name.toLowerCase().endsWith('.ini')) {
        const saveGameDatabase = new SaveGameDatabase()
        const text = await files[0].text()
        parseSaveGameIniFile(text, saveGameDatabase)
        setSavegameDatabase(saveGameDatabase);
      }
      const elapsed = new Date().getTime() - start;
      console.log(`SaveGame data processed in ${elapsed} ms`);
    } finally {
      setSavegameLoading(false);
    }
  }

  return (
    <MantineProvider defaultColorScheme="dark">
      <Box pos="relative">
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <AppShell
          header={{ collapsed : true,
            height: 60 }}
          navbar={{
            width: 330,
            breakpoint: 'sm',
          }}
          padding="md"
        >
          <AppShell.Header />
          <AppShell.Navbar>
            <NavigationBar defaultId={activePage} links={pages} onActiveChange={setActivePage} />
            <Space h="5px" />
            <Group justify="left" gap="lg">
              <Space h="5px" />
              <DarkLightButton />
              <NativeSelect
                value={selectedLanguage}
                onChange={(event) => setSelectedLanguage(event.currentTarget.value)}
                data={gameDatabase.translations.keys().toArray()}
              />
            </Group>
          </AppShell.Navbar>
          <AppShell.Main>
            {(() => {
              switch (activePage) {
                case 'settings':
                  return <SettingsView
                    loading={savegameLoading}
                    onDrop={onDropFile}
                    onReject={(files) => console.log('rejected files', files)}/>;
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
