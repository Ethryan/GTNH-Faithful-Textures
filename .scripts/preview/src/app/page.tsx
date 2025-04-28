'use client';

import { Card, Group, Modal, MultiSelect, Pagination, Stack, Text, TextInput, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { useEffect, useMemo, useRef, useState } from "react";
import { useDisclosure, useLocalStorage, useViewportSize } from '@mantine/hooks';
import { MenuHolder } from './menu';

import type { Cache } from '../../../src/constants';
import { BREAKPOINT_MOBILE_LARGE, BREAKPOINT_TABLET, BREAKPOINT_DESKTOP_MEDIUM, BREAKPOINT_DESKTOP_LARGE } from './utils/constants';
import { MCMeta, Texture } from 'react-minecraft';

function chunk<T>(arr: T[], size: number): T[][] {
  if (!arr.length) return [];

  const head = arr.slice(0, size);
  const tail = arr.slice(size);
  return [head, ...chunk(tail, size)];
}

export interface ModalData { 
  src: string, 
  animation?: { 
    mcmeta: {
      animation: MCMeta.Animation
    }
    tiled: boolean 
  } 
}

export default function Home() {
  const { setColorScheme } = useMantineColorScheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [cache, setCache] = useState<Cache | null>();

  useEffect(() => {
    setColorScheme('dark');
    fetch('/api/cache')
      .then((res) => res.json())
      .then(setCache)
  }, []);

  const [selectedAssets, setSelectedAssets] = useLocalStorage<string[]>({
    key: 'assets',
    defaultValue: ['minecraft'],
  });

  const allAssets = useMemo(() => {
    if (!cache) return [];

    const set = new Set<string>();
    cache.paths
      .map((filePath) => filePath.split('assets')[1].slice(1).split('/')[0])
      .forEach((assetFolder) => set.add(assetFolder));

    return Array.from(set).sort();
  }, [cache]);

  const [displayedTextures, setDisplayedTextures] = useState<string[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [search, setSearch] = useLocalStorage<string>({
    key: 'search',
    defaultValue: '',
  });

  useEffect(() => {
    if (!cache) return;

    const textures = cache.paths
      .filter((e) => selectedAssets.length === 0 ? true : selectedAssets.some((asset) => e.startsWith(`assets/${asset}`)))
      .filter((e) => search === '' ? true : e.toLowerCase().includes(search.toLowerCase()))
      .filter((e) => e.endsWith('.png'))

    setDisplayedTextures(textures.sort());
  }, [allAssets, selectedAssets, search]);

  const splittedTextures = useMemo(() => chunk(displayedTextures, 36), [displayedTextures]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { width } = useViewportSize();
  const cardsPerRow = width <= BREAKPOINT_MOBILE_LARGE 
    ? 1 
    : width <= BREAKPOINT_TABLET 
      ? 2
      : width <= BREAKPOINT_DESKTOP_MEDIUM
        ? 3
        : width <= BREAKPOINT_DESKTOP_LARGE
          ? 4
          : 6;

  const handleModalOpen = (data: ModalData) => {
    setModalData(data);
    open();
  }

  return (
    <Stack m="md">
      <Modal
        opened={opened}
        centered
        size="lg"
        onClose={() => {
          setModalData(null);
          close();
        }}
      >
        {modalData && (
          <Stack w="100%" h="100%" justify="center" align="center" mb={40}>
            <Texture
              size="500px"
              src={modalData.src}
              animation={modalData.animation}
            />
          </Stack>
        )}
      </Modal>

      <MultiSelect 
        w="100%"
        data={allAssets}
        value={selectedAssets}
        onChange={(v) => setSelectedAssets(v)}
        label="Select Assets folders"
        radius={0}
      />

      <TextInput
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        placeholder="Search for textures names or paths..."
        label="Search"
        radius={0}
      />

      <Text size="xs" c="dimmed" mt={-15} ml={2}>
        Showing {displayedTextures.length} results
      </Text>

      <Pagination
        mx="auto"
        total={splittedTextures.length}
        value={activePage}
        onChange={setActivePage}
        classNames={{
          control: 'bordered'
        }}
      />

      <Group gap="md">
        {splittedTextures[activePage - 1]?.map((filepath) => (
          <Card 
            w={`calc((100% - (${cardsPerRow - 1} * var(--mantine-spacing-md))) / ${cardsPerRow})`} 
            ref={containerRef}
            radius={0}
            withBorder
            key={filepath}
            p="xs"
          >
            <Stack gap="xs">
              <Group gap="md" wrap="nowrap" w="100%" justify="center">
                <MenuHolder filePath={filepath} resolution="x16" openModal={(data) => handleModalOpen(data)} />
                <MenuHolder filePath={filepath} resolution="x32" openModal={(data) => handleModalOpen(data)} />
              </Group>
              <Text w="100%" ta="center">
                {filepath.split('/').pop()?.replace('.png', '')}
              </Text>
            </Stack>
          </Card>
        ))}
      </Group>

      <Pagination
        mx="auto"
        total={splittedTextures.length}
        value={activePage}
        onChange={setActivePage}
        classNames={{
          control: 'bordered'
        }}
      />
    </Stack>
  );
}
