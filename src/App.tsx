import { GameDatabase } from '@/model/gameDatabase';
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
  Textarea,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { NavigationBar, NavigationBarProps } from '@/components/NavigationBar/NavigationBar';
import { parseZipFileFromUrl } from './features/parseGameData';
import classes from './App.module.css';

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

function GameDataPageContent() {
  return <Notification title="We notify you that">Game data page content</Notification>;
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
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const pages = [
    { id: 'settings', link: SettingsPageContent, icon: IconSettings, label: 'Settings' },
    {
      id: 'gamedata',
      link: GameDataPageContent,
      icon: IconDatabase,
      label: 'Game & SaveGame Data',
    },
    {
      id: 'production',
      link: ProductionGameContent,
      icon: IconBuildingFactory2,
      label: 'Production',
    },
    { id: 'stats', link: GameStatisticsContent, icon: IconGraph, label: 'Game statistics' },
  ];

  const [activePage, setActivePage] = useState(pages[0].id);

  React.useEffect(() => {
    const loadDatabase = async () => {
      try {
        setLoading(true);
        const data = await parseZipFileFromUrl(gameData);
        setGameDatabase(data);
      } finally {
        setLoading(false);
      }
    };
    loadDatabase();
  }, []);

  const renderContent = () => {
    for (const page of pages) {
      if (page.id === activePage) {
        return page.link();
      }
    }
    return null;
  };

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
                  data={Object.keys(gameDatabase.translations)} />
              </Box>
              <DarkLightButton />
              <Space h="md" />
            </Flex>
          </AppShell.Header>
          <AppShell.Navbar>
            <NavigationBar defaultId={activePage} links={pages} onActiveChange={setActivePage} />
          </AppShell.Navbar>
          <AppShell.Main>{renderContent()}</AppShell.Main>
        </AppShell>
      </Box>
    </MantineProvider>
  );
}
