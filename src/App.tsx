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
import { MantineProvider, ActionIcon, AppShell, Button, FileInput, Flex, Space,
  useComputedColorScheme, useMantineColorScheme} from '@mantine/core';
import { IconFileDownload, IconMoon, IconSun } from '@tabler/icons-react';
import {parseZipFileFromUrl} from './features/parseGameData'
import cx from 'clsx';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';
import classes from './App.module.css';
import gameData from '/src/assets/data/media_soviet.zip?url';

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

function onLoadGameData() {
  parseZipFileFromUrl(gameData)
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
      <Button onClick={onLoadGameData} >Load game data</Button>
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

export default function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <HomePage />
    </MantineProvider>
  );
}
