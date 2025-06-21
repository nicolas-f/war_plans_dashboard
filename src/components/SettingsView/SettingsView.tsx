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

import { Dropzone, DropzoneProps } from '@mantine/dropzone';
import { Group, Stack, Text } from '@mantine/core';
import { IconFileZip, IconUpload, IconX } from '@tabler/icons-react';
import React from 'react';


export function SettingsView(props: DropzoneProps) {

  return (
    <Stack gap="xl"> <Text size="xl">Welcome to the Workers and Resources dashboard website.</Text>
      <Text size="m">Please drag&drop your save game file in order to use your save game prices. It will be stored into your browser cache.</Text>
    <Dropzone
      accept={{
        'text/plain': ['.ini'], // All images
        'application/zip': ['.zip'],
        'application/x-zip-compressed': ['.zip'],
      }}
      {...props}
    >
      <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconFileZip size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            Load your game save data into this tool, drag save game zip file or stats.ini here or click to select file
          </Text>
        </div>
      </Group>
    </Dropzone>
    </Stack>
  );
}

