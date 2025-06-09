import { IconFileDownload, IconMoon, IconSun } from '@tabler/icons-react';
import { fs } from "@zip.js/zip.js";
import gameData from '/src/assets/data/media_soviet.zip?url';
import cx from 'clsx';
import { ActionIcon, AppShell, Button, FileInput, Flex, Space, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';
import classes from './Home.module.css';


const { FS } = fs;

function createZipFileSystem() {
  return new FS();
}

const apiFilesystem = createZipFileSystem();

const { root } = apiFilesystem;

async function parseZipFile() {
  try {
    const entries = await root.importHttpContent(gameData);
    for (const entry of entries) {
      console.log('Entry:', entry.getFullname());
    }
  } catch (error) {
    console.error('Error importing zip file:', error);
  }

  // loadGameAssetWorker.postMessage(new AdmZip('/src/assets/data/media_soviet.zip'))
}

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
        <Button onClick={parseZipFile} >Load game data</Button>
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