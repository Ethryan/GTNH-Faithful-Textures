'use client';

import { Group, MultiSelect, Pagination, Stack, TextInput } from '@mantine/core';
import { type Cache } from '../../../src/constants';
import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from '@mantine/hooks';
import { MenuHolder } from './menu';

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

  const data = chunk(displayedTextures, 36);

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
              <MenuHolder filePath={filePath} resolution="x16" />
              <MenuHolder filePath={filePath} resolution="x32" />
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
