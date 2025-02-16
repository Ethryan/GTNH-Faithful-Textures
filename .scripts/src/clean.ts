/**
 * Remove unused files from the project.
 * @author Juknum
 * 
 * INFO: also remove textures that are marked as "skipped" in the cache file unless they are not fully transparent.
 */

import fs from "node:fs";
import path from "node:path";

import { consola } from "consola";

import { type Cache, CACHE_FILE, RESOURCE_PACK_DIRECTORY } from "./constants.ts";
import { extractDefaultTextures } from "./extract.ts";
import { isTransparent } from "./isTransparent.ts";

export async function clean() {
	if (!fs.existsSync(CACHE_FILE)) await extractDefaultTextures();

	consola.start("Cleaning unused files...");

	const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as Cache;

	const existingPaths = new Set<string>(cache.paths);
	const skippedPaths = new Set<string>(cache.skipped);

	const deletedPaths = new Set<string>();

	const traverseDirectory = async (currentPath: string): Promise<boolean> => {
		const entries = fs.readdirSync(currentPath);
		let isEmpty = true;

		for (const entry of entries) {
			const fullPath = path.join(currentPath, entry);
			if (!fullPath.includes('assets')) continue;
			if (fullPath.endsWith('.mcmeta')) continue;
			
			const stat = fs.statSync(fullPath);

			if (stat.isDirectory()) {
				const subDirEmpty = await traverseDirectory(fullPath);
				if (subDirEmpty) {
					try {
						fs.rmdirSync(fullPath);
					} catch (err) {
						consola.error(`Failed to delete ${fullPath}`);
						console.error(err);
					}
				}
				else isEmpty = false;
			}

			else {
				const filepath = fullPath.replace(RESOURCE_PACK_DIRECTORY, '').slice(1).replaceAll('\\', '/');

				if (!existingPaths.has(filepath)) {
					if (
						!skippedPaths.has(filepath) || 
						(skippedPaths.has(filepath) && await isTransparent(fs.readFileSync(fullPath)))
					) {
						// delete the unwanted file
						fs.unlinkSync(fullPath);
						// delete mcmeta if it exists
						if (fs.existsSync(`${fullPath}.mcmeta`)) {
							fs.unlinkSync(`${fullPath}.mcmeta`);
							deletedPaths.add(`${fullPath}.mcmeta`);
						}

						consola.info(`Deleted ${filepath}`);
						deletedPaths.add(filepath);
					}
				}
				else isEmpty = false;
			}
		}

		return isEmpty;
	};

	await traverseDirectory(RESOURCE_PACK_DIRECTORY);
	consola.success(`Deleted ${deletedPaths.size} files.`);
}