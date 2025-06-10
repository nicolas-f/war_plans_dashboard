import { GameDatabase } from '@/database/gameDatabase';
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

import '@mantine/core/styles.css';

import React, { useState } from 'react';
import {
  IconBuildingFactory2,
  IconDatabase,
  IconFileDownload,
  IconGraph,
  IconMoon,
  IconSettings,
  IconSun,
} from '@tabler/icons-react';
import gameData from '/src/assets/data/media_soviet.zip?url';
import savegameData from '/src/assets/data/default_save.zip?url';
import cx from 'clsx';
import {
  ActionIcon,
  AppShell,
  Box,
  FileInput,
  Flex,
  LoadingOverlay,
  MantineProvider, NativeSelect,
  Notification,
  Space,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';
import { parseZipFileFromUrl } from './features/parseGameData';
import classes from './App.module.css';
import { parseSaveGameZipFileFromUrl } from '@/features/parseSaveData';
import { SaveGameDatabase } from '@/database/saveGameDatabase';
import GameDataView from '@/components/gameDataView/GameDataView';

function LoadSaveGameFileInput() {
  //https://github.com/gildas-lormeau/zip-manager/blob/main/src/zip-manager/components/TopButtonBar.jsx
  const icon = <IconFileDownload size={18} stroke={1.5} />;
  return (
    <FileInput
      rightSection={icon}
      label="Game save file"
      description="Will fetch prices and statistics from your save game (not uploaded)"
      placeholder="SovietRepublic\media_soviet\save\mysave.zip"
      rightSectionPointerEvents="none"
      mt="md"
    />
  );
}

function SettingsPageContent() {
  return (
    <Flex
      maw={400}
      direction={{ base: 'column', sm: 'column' }}
      gap={{ base: 'sm', sm: 'lg' }}
      justify={{ sm: 'center' }}
      wrap="wrap"
    >
      <LoadSaveGameFileInput />
    </Flex>
  );
}

function ProductionGameContent() {
  return <Notification title="We notify you that">Production data page content</Notification>;
}

function GameStatisticsContent() {
  return <Notification title="We notify you that">Game statistics page content</Notification>;
}

function DarkLightButton() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });

  return (
    <ActionIcon
      onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
      variant="default"
      size={42}
      aria-label="Toggle color scheme"
    >
      <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
      <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
    </ActionIcon>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [gameDatabase, setGameDatabase] = useState(new GameDatabase());
  const [savegameDatabase, setSavegameDatabase] = useState(new SaveGameDatabase());
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const pages = [
    { id: 'settings',
      icon: IconSettings,
      label: 'Settings'
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
    { id: 'stats',
      icon: IconGraph,
      label: 'Game statistics'
    },
  ];

  const [activePage, setActivePage] = useState(pages[0].id);

  React.useEffect(() => {
    const loadDatabase = async () => {
      try {
        setLoading(true);
        const data = await parseZipFileFromUrl(gameData);
        const saveGameData = await parseSaveGameZipFileFromUrl(savegameData);
        setGameDatabase(data);
        setSavegameDatabase(saveGameData);
      } finally {
        setLoading(false);
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
            <Flex gap="md" justify="flex-end" align="center" direction="row" wrap="wrap">
              <Box w={180}>
                <NativeSelect
                  value={selectedLanguage}
                  onChange={(event) => setSelectedLanguage(event.currentTarget.value)}
                  data={gameDatabase.translations.keys().toArray()} />
              </Box>
              <DarkLightButton />
              <Space h="md" />
            </Flex>
          </AppShell.Header>
          <AppShell.Navbar>
            <NavigationBar defaultId={activePage} links={pages} onActiveChange={setActivePage} />
          </AppShell.Navbar>
          <AppShell.Main>
            {(() => {
              switch (activePage) {
                case 'settings': return <SettingsPageContent />;
                case 'gamedata': return <GameDataView gameDatabase={gameDatabase} savegameDatabase={savegameDatabase} />;
                case 'production': return <ProductionGameContent />;
                case 'stats': return <GameStatisticsContent />;
                default: return null;
              }
            })()}
          </AppShell.Main>
        </AppShell>
      </Box>
    </MantineProvider>
  );
}
