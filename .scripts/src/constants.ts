import path from 'node:path';
import config from '../config.json' with { type: 'json' };

const root = config.directories.$root;

export const MODS_DIRECTORY = config.directories.mods.replace('$root', root);
export const DEFAULT_TEXTURES_DIRECTORY = config.directories.default.replace('$root', root);
export const FAITHFUL_TEXTURES_DIRECTORY = config.directories.faithful.replace('$root', root);
export const ROOT_DIRECTORY = config.directories.resourcepack.replace('$root', root);
export const RESOURCE_PACK_DIRECTORY = ROOT_DIRECTORY;
export const CACHE_FILE = path.resolve('cache.json');
export const PACK_MCMETA = path.join(RESOURCE_PACK_DIRECTORY, 'pack.mcmeta');
export const CLIENT_JAR = config.directories.client_jar.replace('$root', root);

export type timestamp = number;
export type Cache = {
	paths: string[];
	skipped: string[];
	count: {
		total: number;
		skipped: number;
	};
}