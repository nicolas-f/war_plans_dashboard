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

import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';



import React, { useState } from 'react';
import { IconBuildingFactory2, IconDatabase, IconGraph, IconMoon, IconSettings, IconSun } from '@tabler/icons-react';
import savegameData from '/src/assets/data/default_save.zip?url';
import gameData from '/src/assets/data/media_soviet.zip?url';
import cx from 'clsx';
import { FileWithPath } from 'react-dropzone';
import { ActionIcon, AppShell, Box, Group, LoadingOverlay, MantineProvider, NativeSelect, Space, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import GameDataView from '@/components/GameDataView/GameDataView';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';
import { ProductionGameContent } from '@/components/ProductionPlannerView/ProductionPlannerView';
import { SettingsView } from '@/components/SettingsView/SettingsView';
import { StatisticsView } from '@/components/StatisticsView/StatisticsView';
import { getStoreData, initDB, setStoreData, Stores } from '@/database/db';
import { GameDatabase } from '@/database/gameDatabase';
import { SaveGameDatabase, statisticsDbKey } from '@/database/saveGameDatabase';
import { parseSaveGameIniFile, parseSaveGameZipFileFromBlob, parseSaveGameZipFileFromUrl } from '@/features/parseSaveData';
import { mantineTheme } from '@/theme';
import { parseZipFileFromUrl } from './features/parseGameData';
import classes from './App.module.css';


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

  const handleInitDB = async () => {
    await initDB();
  };

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
        await handleInitDB()
        // check if the user have already uploaded a save game previously
        const stats = await getStoreData<string>(Stores.pagesState, statisticsDbKey)
        if(stats) {
          const SAVE_GAMEDB = new SaveGameDatabase()
          parseSaveGameIniFile(stats, SAVE_GAMEDB)
          console.log(`read save game db :${stats.length} bytes`)
          setSavegameDatabase(SAVE_GAMEDB);
        } else {
          const SAVE_GAME_DATABASE = await parseSaveGameZipFileFromUrl(savegameData);
          setSavegameDatabase(SAVE_GAME_DATABASE);
        }
      } finally {
        setLoading(false);
      }
    };

    const loadGameData = async () => {
      const GAME_DATABASE = await parseZipFileFromUrl(gameData);
      setGameDatabase(GAME_DATABASE);
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
        const saveGameDatabase = await parseSaveGameZipFileFromBlob(new Blob([arrayBuffer]));
        setSavegameDatabase(saveGameDatabase);
        setStoreData(Stores.pagesState, statisticsDbKey, saveGameDatabase.statistics)
      } else if(files[0].name.toLowerCase().endsWith('.ini')) {
        const saveGameDatabase = new SaveGameDatabase()
        const text = await files[0].text()
        parseSaveGameIniFile(text, saveGameDatabase)
        setSavegameDatabase(saveGameDatabase);
        setStoreData(Stores.pagesState, statisticsDbKey, saveGameDatabase.statistics)
      }
      const elapsed = new Date().getTime() - start;
      console.log(`SaveGame data processed in ${elapsed} ms`);
    } finally {
      setSavegameLoading(false);
    }
  }

  return (
    <MantineProvider defaultColorScheme="dark" theme={mantineTheme} >
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
            <Group justify="center" gap="lg">
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
                  return <ProductionGameContent
                    gameDatabase={gameDatabase}
                    saveGameDatabase={savegameDatabase}
                    selectedLanguage={selectedLanguage}
                  />;
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
