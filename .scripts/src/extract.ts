/**
 * Extract all default textures to '.default' folder
 * @author Juknum
 */

import path from 'node:path';
import fs from 'node:fs';

import { Open as OpenJar } from 'unzipper';
import { consola } from 'consola';

import { type Cache, CACHE_FILE, CLIENT_JAR, DEFAULT_TEXTURES_DIRECTORY, MODS_DIRECTORY } from './constants.ts';
import { isTransparent } from './isTransparent.ts';

export async function extractDefaultTextures() {
	if (!fs.existsSync(DEFAULT_TEXTURES_DIRECTORY)) {
		consola.start('Creating new .default folder...');
		
		fs.mkdirSync(DEFAULT_TEXTURES_DIRECTORY);
	}
	else {
		consola.start('Deleting old .default folder...');

		// delete .default & create new one
		fs.rmSync(DEFAULT_TEXTURES_DIRECTORY, { recursive: true });
		fs.mkdirSync(DEFAULT_TEXTURES_DIRECTORY);
	}

	let clientJAR = CLIENT_JAR;
	if (!fs.existsSync(CLIENT_JAR)) {
		clientJAR = await consola.prompt('Enter the path to the Minecraft 1.7.10 client JAR file', { type: 'text' });
		if (clientJAR.startsWith('"') && clientJAR.endsWith('"')) {
			clientJAR = clientJAR.slice(1, -1);
		}

		if (!fs.existsSync(clientJAR)) {
			consola.error('Invalid path to client JAR file.');
			return;
		}
	}

	const mods = [
		clientJAR,
		...fs.readdirSync(MODS_DIRECTORY).map((filename) => path.resolve(MODS_DIRECTORY, filename))
	]

	const paths = new Set<string>();
	const skipped = new Set<string>();

	for (const mod of mods) {
		const p = path.resolve(MODS_DIRECTORY, mod);

		// only keep .jar files from root directory
		if (fs.lstatSync(p).isDirectory()) continue;

		const directory = await OpenJar.file(p);
		const files = directory.files.filter((file) => file.path.includes('assets') && file.path.includes('textures'));

		consola.info('Looking for textures in', mod.split(path.sep).pop());

		// no textures found in this mod
		if (files.length === 0) continue;

		// extract all textures to .default folder
		for (const file of files) {
			if (file.type === 'Directory') continue;

			const fp = path.resolve(DEFAULT_TEXTURES_DIRECTORY, file.path.replace('assets/', ''));
			const buffer = await file.buffer();

			try {
				const transparentTexture = file.path.endsWith('.png') ? await isTransparent(buffer) : false;
				if (transparentTexture) {
					skipped.add(file.path);
					continue;
				}
			} catch (err) {
				consola.warn(`Error checking transparency of ${file.path}: ${err}`);
			}

			// create directory if it doesn't exist
			if (!fs.existsSync(path.dirname(fp))) {
				fs.mkdirSync(path.dirname(fp), { recursive: true });
			}

			fs.writeFileSync(fp, buffer);
			// only keep textures and .mcmeta files (avoid .pdn files)
			if (file.path.endsWith('.png') || file.path.endsWith('.mcmeta')) paths.add(file.path);
		}
	}

	consola.success(`Extracted ${paths.size + skipped.size} textures (${paths.size} new, ${skipped.size} skipped).`);

	const cache: Cache = {
		paths: Array.from(paths),
		skipped: Array.from(skipped),
		count: {
			total: paths.size + skipped.size,
			skipped: skipped.size,
		},
	};

	fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}
