import { useState } from 'react';
import {
  IconBuildingFactory2,
  IconDatabase,
  IconDeviceDesktopAnalytics,
  IconGraph,
  IconSettings,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import { Group } from '@mantine/core';
import classes from './NavigationBar.module.css';

const mainLinksMockdata = [
  { link: '', icon: IconSettings, label: 'Settings' },
  { link: '', icon: IconDatabase, label: 'Game & Save Data' },
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
            <img src="src/favicon.png" alt="logo" />
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
