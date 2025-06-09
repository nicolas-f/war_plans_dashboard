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

import { useState } from 'react';
import {
  IconBuildingFactory2,
  IconDatabase,
  IconGraph,
  IconSettings,

} from '@tabler/icons-react';
import { Group, Image, Text } from '@mantine/core';
import classes from './NavigationBar.module.css';
import "/src/assets/fonts/SovietProgram/SovietProgram.ttf"
import wrLogo from "/src/favicon.png"

const mainLinksMockdata = [
  { link: '', icon: IconSettings, label: 'Settings' },
  { link: '', icon: IconDatabase, label: 'Game & SaveGame Data' },
  { link: '', icon: IconBuildingFactory2, label: 'Production' },
  { link: '', icon: IconGraph, label: 'Game statistics' },
];

export function NavigationBar() {
  const [active, setActive] = useState('Settings');

  const mainLinks = mainLinksMockdata.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <div className={classes.logo}>
            <Image src={wrLogo} alt="logo" />
            <div className={classes.titleContainer}>
              <div>
                <Text className={classes.logoTitle}>Soviet Republic</Text>
                <Text className={classes.logoTitle}>Worker And Resources</Text>
                <Text className={classes.logoTitle}>Dashboard</Text>
              </div>
            </div>
          </div>
        </Group>
        {mainLinks}
      </div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()} />
      </div>
    </nav>
  );
}
