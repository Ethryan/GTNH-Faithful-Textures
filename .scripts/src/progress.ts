import fs from "node:fs";
import path from "node:path";

import consola from "consola";
import { type Cache, CACHE_FILE, FAITHFUL_TEXTURES_DIRECTORY } from "./constants.ts";

export function packProgress(assetsNames?: string[]): number {
	consola.info('Assuming extracted textures are up to date.\n');

	const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as Cache;

	const todo = assetsNames 
		? cache.paths.filter((p) => assetsNames.some((name) => p.startsWith(`assets/${name}`))).length
		: cache.paths.length;

	let assetsDone = new Map<string, { done: number; todo: number }>();
	let missingAssets = new Map<string, string[]>();
	
	(assetsNames 
		? cache.paths.filter((p) => assetsNames.some((name) => p.startsWith(`assets/${name}`)))
		: cache.paths
	).forEach((filePath) => {
		const fullPath = path.resolve(FAITHFUL_TEXTURES_DIRECTORY.replace('assets', ''), filePath);
		const assetFolder = fullPath.split('assets')[1].slice(1).split('\\')[0];

		if (!assetsDone.has(assetFolder)) assetsDone.set(assetFolder, { done: 0, todo: 0 });
		assetsDone.get(assetFolder)!.todo++;

		if (fs.existsSync(fullPath)) {
			assetsDone.get(assetFolder)!.done++;
		}
		else {
			if (!missingAssets.has(assetFolder)) missingAssets.set(assetFolder, []);
			missingAssets.get(assetFolder)!.push(filePath);
		}
	});

	const done = Array.from(assetsDone.values()).reduce((acc, { done }) => acc + done, 0);
	const percentage = Math.round((done / todo) * 100);

	const longestAssetName = Array.from(assetsDone.keys()).reduce((acc, asset) => asset.length > acc.length ? asset : acc, '');
	const assets = Array.from(assetsDone.keys()).sort();

	let outputTxt = '';

	for (const asset of assets) {
		const { done, todo } = assetsDone.get(asset)!;
		const percent = Math.round((done / todo) * 100);
		const str = `${asset.padEnd(longestAssetName.length + 10)}: ${percent.toString().padStart(5)}% (${done.toString()}/${todo.toString()})`;

		if (percent === 100) consola.success(str);
		else consola.info(str);

		if (!assetsNames) {
			outputTxt += `${str}\n`;
		}

		if (assetsNames && missingAssets.has(asset)) {
			consola.warn(`Missing files:`);
			missingAssets.get(asset)!.forEach((file) => consola.info(`  - ${file}`));
		}

		if (assetsNames) consola.info(`${str} ^^^^`);
	}

	const totalStr = `${'TOTAL'.padEnd(longestAssetName.length + 10)}: ${percentage.toString().padStart(5)}% (${done}/${todo})`;
	consola.info(totalStr);
	if (outputTxt !== '') fs.writeFileSync('progress.txt', outputTxt + totalStr);
	
	return percentage;
}