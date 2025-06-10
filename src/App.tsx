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



import React from 'react';
import { IconFileDownload, IconMoon, IconSun } from '@tabler/icons-react';
import gameData from '/src/assets/data/media_soviet.zip?url';
import cx from 'clsx';
import { ActionIcon, AppShell, Box, FileInput, Flex, LoadingOverlay, MantineProvider, Notification, Space, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';
import { parseZipFileFromUrl } from './features/parseGameData';
import classes from './App.module.css';
import { useDisclosure } from '@mantine/hooks';


;














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

function HomeContent() {
  return (
    <Flex
      maw={400}
      direction={{ base: 'column', sm: 'column' }}
      gap={{ base: 'sm', sm: 'lg' }}
      justify={{ sm: 'center' }}
      wrap="wrap"
    >
      <LoadSaveGameFileInput/>
    </Flex>
  );
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

export function HomePage() {

  return (
    <AppShell
      header={{ height: 50 }}
      navbar={{
        width: 330,
        breakpoint: 'sm',
      }}
      padding="md"
    >
      <AppShell.Header>
        <Flex
          gap="md"
          justify="flex-end"
          align="center"
          direction="row"
          wrap="wrap"
        >
          <DarkLightButton/>
          <Space h="md" />
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar><NavigationBar /></AppShell.Navbar>

      <AppShell.Main><HomeContent /></AppShell.Main>
    </AppShell>
  );
}

function LoadingNotification() {
  return (
    <Notification classNames={{ loader: classes.loader }} title="Please wait">
      Loading game data comrade !
    </Notification>
  );
}

export default function App() {
  const [databaseLoaded, { toggle }] = useDisclosure(false);
  const [gameDatabase, setGameDatabase] = React.useState(new GameDatabase());

  React.useEffect(() => {
    const loadDatabase = async () => {
      try {
        const data = await parseZipFileFromUrl(gameData);
        setGameDatabase(data);
      } finally {
        toggle()
      }
    };
    loadDatabase()
  }, []);

  return (
    <MantineProvider defaultColorScheme="dark">
      <Box pos="relative">
        <LoadingOverlay visible={databaseLoaded} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }}/>
        <HomePage />
      </Box>
    </MantineProvider>
  );
}