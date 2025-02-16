'use client';

import cacheJSON from '../../cache.json';
import { type Cache } from '../../../src/constants';
import { useMemo, useState } from "react";
import { MCMeta, Texture } from 'react-minecraft';

export default function Home() {
  const cache = cacheJSON as Cache;
  const [currentAsset, setCurrentAsset] = useState<string>('minecraft');

  const assets = useMemo(() => {
    const set = new Set<string>();
    cache.paths
      .map((filePath) => filePath.split('assets')[1].slice(1).split('/')[0])
      .forEach((assetFolder) => set.add(assetFolder));
    return set;
  }, [cache]);

  return (
    <div className="container">
      <div className="assets-buttons">
        {Array.from(assets).sort().map((asset) => (
          <button className={asset === currentAsset ? "asset-button asset-button-selected" : "asset-button"} key={asset} onClick={() => setCurrentAsset(asset)}>{asset}</button>
        ))}
      </div>
      <main>
        <h2>Assets</h2>
        
        <div className="assets-textures">
          {cache.paths
            .filter((e) => e.startsWith(`assets/${currentAsset}`) && e.endsWith('.png'))
            .sort()
            .map((filePath) => (
            <div key={filePath} className="assets-texture">
              <div className="assets-texture-images">
                <Texture
                  src={filePath.replace('assets', './faithful')}
                  size="175px"
                />
                <Texture 
                  src={filePath.replace('assets', './default')}
                  size="175px" 
                />
              </div>
              <span className="assets-texture-name">{filePath.split('/').pop()?.replace('.png', '')}</span>
            </div>
          ))}
        </div>
      </main>
    </div>

  );
}
