'use client';

import { Button, ButtonGroup, Group, Menu, MenuItem, MultiSelect, Pagination, Stack, TextInput } from '@mantine/core';
import { type Cache } from '../../../src/constants';
import { useEffect, useMemo, useRef, useState } from "react";
import { MCMeta, Texture } from 'react-minecraft';
import { useLocalStorage } from '@mantine/hooks';

function chunk<T>(arr: T[], size: number): T[][] {
  if (!arr.length) return [];

  const head = arr.slice(0, size);
  const tail = arr.slice(size);
  return [head, ...chunk(tail, size)];
}

export default function Home() {
  const [cache, setCache] = useState<Cache | null>();

  const [search, setSearch] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [displayedTextures, setDisplayedTextures] = useState<string[]>([]);

  const [assets, setAssets] = useLocalStorage<string[]>({
    key: 'assets',
    defaultValue: ['minecraft'],
  });

  const allAssets = useMemo(() => {
    if (!cache) return new Set<string>();

    const set = new Set<string>();
    cache.paths
      .map((filePath) => filePath.split('assets')[1].slice(1).split('/')[0])
      .forEach((assetFolder) => set.add(assetFolder));

    return set;
  }, [cache]);

  useEffect(() => {
    fetch('/api/cache')
      .then((res) => res.json())
      .then((data) => setCache(data));
  }, [])

  useEffect(() => {
    const textures = cache?.paths
      .filter((e) => e.endsWith('.png'))
      .filter((e) => assets.length === 0 ? true : assets.some((asset) => e.startsWith(`assets/${asset}`) && e.endsWith('.png')))
      .filter((e) => search === '' ? true : e.toLowerCase().includes(search.toLowerCase()))
      .sort();

    setDisplayedTextures(textures || []);
  }, [allAssets, assets, search]);

  useEffect(() => {
    setActivePage(1);
  }, [search]);

  const data = chunk(displayedTextures, 32);

  const MenuHolder = (filePath: string, resolution: 'x16' | 'x32') => {
    return (
      <Menu
        position="right-start"
      >
        <Menu.Target>
          <Texture
            src={`/api/texture?path=${filePath}&resolution=${resolution}`}
            size="120px"
          />
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Tools</Menu.Label>
          <Menu.Item 
            onClick={() => void fetch('/api/tools/open-file', {
              method: 'POST',
              body: JSON.stringify({ filePath, resolution }),
            })}
          >
            Reveal in File Explorer
          </Menu.Item>
          <MenuItem
            onClick={() => navigator.clipboard.writeText(filePath)}
          >
            Copy file path
          </MenuItem>
          {resolution === 'x16' && (
            <MenuItem
              onClick={() => void fetch('/api/tools/copy-paste-to-x32', { 
                method: 'POST', 
                body: JSON.stringify({ filePath }),
              })}
            >
              Copy to x32
            </MenuItem>
          )}
        </Menu.Dropdown>
      </Menu>
    )
  };

  return (
    <Stack p="md">
      <MultiSelect
        classNames={{
          input: 'input',
          dropdown: 'dropdown',
        }}
        w="100%"
        data={Array.from(allAssets).sort()}
        value={assets}
        onChange={setAssets}
        searchable
        label="Assets"
        variant="unstyled"
      />

      <TextInput
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        label="Results"
        placeholder="Search"
        variant="unstyled"
        classNames={{
          input: 'input'
        }}
      />

      <Group>
        {data[activePage - 1]?.map((filePath) => (
          <Stack
            key={filePath}
            className="textureGroup"
            p="md"
            w="calc((100% - (5 * var(--mantine-spacing-md))) / 6)"
            mah="191.69px"
          >
            <Group mx="auto">
              {MenuHolder(filePath, "x32")}
              {MenuHolder(filePath, "x16")}
            </Group>
            <label className="label mantine-InputWrapper-label mantine-MultiSelect-label">
              {filePath.split('/').pop()?.replace('.png', '')}
            </label>
          </Stack>
        ))}
      </Group>

      <Pagination
        mx="auto"
        total={data.length}
        value={activePage}
        onChange={setActivePage}
        classNames={{
          control: 'bordered'
        }}
      />

    </Stack>
  );
}
