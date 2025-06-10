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
import { Icon } from '@tabler/icons-react';
import { Group, Image, Text } from '@mantine/core';
import classes from './NavigationBar.module.css';

import '/src/assets/fonts/SovietProgram/SovietProgram.ttf';

import wrLogo from '/src/favicon.png';

export interface NavigationBarProps {
  defaultId: string
  onActiveChange?: (activeLabel: string) => void;
  links: {
    id: string;
    icon: Icon;
    label: string;
  }[];
}

export function NavigationBar({ defaultId, onActiveChange, links }: NavigationBarProps) {
  const [active, setActive] = useState(defaultId);

  const mainLinks = links.map((item) => (
    <a
      className={classes.link}
      data-active={item.id === active || undefined}
      key={item.label}
      href=""
      onClick={(event) => {
        event.preventDefault();
        setActive(item.id);
        onActiveChange?.(item.id);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
          <div className={classes.logoDiv}>
            <Image src={wrLogo} alt="logo" className={classes.logo}/>
            <div className={classes.titleContainer}>
              <div>
                <Text className={classes.logoTitle}>Soviet Republic</Text>
                <Text className={classes.logoTitle}>Worker And Resources</Text>
                <Text className={classes.logoTitle}>Dashboard</Text>
              </div>
            </div>
          </div>
        {mainLinks}
      </div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()} />
      </div>
    </nav>
  );
}
