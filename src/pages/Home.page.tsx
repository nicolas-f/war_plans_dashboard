import { IconFileDownload } from '@tabler/icons-react';
import { Button, Container, FileInput, Flex } from '@mantine/core';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';

const loadGameAssetWorker = new Worker(new URL("/src/workers/loadGameAsset.js", import.meta.url));

async function parseZipFile() {
  loadGameAssetWorker.postMessage('/src/assets/data/media_soviet.zip')
}

function LoadSaveGameFileInput() {
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
      mih={50}
      bg="rgba(0, 0, 0, .3)"
      gap="sm"
      justify="center"
      direction="column"
      wrap="nowrap"
    >
      <Button onClick={parseZipFile} >Load game data</Button>
      <LoadSaveGameFileInput/>
    </Flex>
  );
}

export function HomePage() {
  return (
    <Flex h="100vh">
      <NavigationBar />
      <Container fluid><HomeContent /></Container>
    </Flex>
  );
}
