import path from 'node:path';

export const MODS_DIRECTORY = path.resolve('..', '..', '..', 'mods');
export const DEFAULT_TEXTURES_DIRECTORY = path.resolve('..', '.default');
export const FAITHFUL_TEXTURES_DIRECTORY = path.resolve('..', 'assets');
export const ROOT_DIRECTORY = path.resolve('..');
export const RESOURCE_PACK_DIRECTORY = path.resolve('..');
export const CACHE_FILE = path.resolve('cache.json');
export const PACK_MCMETA = path.resolve('..', 'pack.mcmeta');
export const CLIENT_JAR = path.resolve('..', '..', '..', '..', '..', '..', 'libraries', 'com', 'mojang', 'minecraft', '1.7.10', 'minecraft-1.7.10-client.jar');

export type timestamp = number;
export type Cache = {
	paths: string[];
	skipped: string[];
	count: {
		total: number;
		skipped: number;
	};
}