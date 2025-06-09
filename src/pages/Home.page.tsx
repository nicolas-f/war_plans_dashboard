import * as fs from 'node:fs';
import { Button, Flex } from '@mantine/core';
import { NavigationBar } from "@/components/NavigationBar/NavigationBar";
// import gameData from '../data/media_soviet.zip';

const loadGameAssetWorker = new Worker(new URL("/src/workers/loadGameAsset.js", import.meta.url));

async function parseZipFile() {
  loadGameAssetWorker.postMessage("test")
  //const filePath : fs.PathLike= path.resolve(__dirname, 'data/media_soviet.zip');
  // const readStream = fs.createReadStream(gameData, { encoding: 'utf8' });
  //
  // try {
  //   for await (const chunk of readStre
  //   am) {
  //     console.log('--- File chunk start ---');
  //     console.log(chunk);
  //     console.log('--- File chunk end ---');
  //   }
  //   console.log('Finished reading the file.');
  // } catch (error) {
  //   console.error(error);
  // }
  //   console.error(`Error reading file: ${error.message}`);
  // }
}

function HomeContent() {
  return (
    <Flex
      mih={50}
      bg="rgba(0, 0, 0, .3)"
      gap="sm"
      justify="center"
      align="center"
      direction="column"
      wrap="nowrap"
    >
      <Button onClick={parseZipFile} >Load game data</Button>
    </Flex>
  );
}

export function HomePage() {
  return (
    <>
      <NavigationBar />
      <HomeContent />
    </>
  );
}
