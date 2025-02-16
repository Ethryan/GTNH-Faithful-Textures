import fs from "node:fs";
import path from "node:path";

import consola from "consola";
import sharp from "sharp";


/**
 * This function takes the source image (in x32) and recolors it to match the palette of each target image.
 * 
 * @param {string} source16x - The path to the faithful source image.
 * @param {string[]} targets - The paths to the target images.
 */
export async function recolor(source16x: string, targets: string[]): Promise<void> {
	const { data: data16, info: info16 } = await sharp(source16x).raw().ensureAlpha().toBuffer({ resolveWithObject: true });

	const source32x = source16x.replace('.default', 'assets');
	if (!fs.existsSync(source32x)) {
		consola.error(`The source image ${source32x} does not exist, can't recolor it.`);
		return;
	}

	const palette16 = getPalette(data16, info16);

	for (let target of targets) {
		const { data: data32, info: info32 } = await sharp(source32x).raw().ensureAlpha().toBuffer({ resolveWithObject: true });

		// check if the target image has the same dimensions as the source image
		if (info32.width * info32.height < (info16.width * 2) * (info16.height * 2)) {
			consola.error('The default texture is the same size as the x32 texture.');
			continue;
		}

		const { data: dataTarget, info: infoTarget } = await sharp(target).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
		const paletteTarget = getPalette(dataTarget, infoTarget);

		// map the source 16 palette to the target palette
		const mapping = new Map<string, string>();
		for (let [key, value] of palette16) {
			mapping.set(value, paletteTarget.get(key)!);
		}

		for (let i = 0; i < data32.length; i += info32.channels) {
			const r = data32[i];
			const g = data32[i + 1];
			const b = data32[i + 2];
			const a = data32[i + 3];

			const hex = getHex(r, g, b, a);
			const newHex = mapping.get(hex);

			if (newHex) {
				const newColor = Buffer.from(newHex.slice(1), 'hex');
				data32[i] = newColor[0];
				data32[i + 1] = newColor[1];
				data32[i + 2] = newColor[2];
				data32[i + 3] = newColor[3];
			}
		}
		
		// save the recolored image to the target path, with the '.default' suffix replaced 
		// with the 'assets' suffix
		const targetPath = target.replace('.default', 'assets');
		if (!fs.existsSync(targetPath)) {
			fs.mkdirSync(path.dirname(targetPath), { recursive: true });
		}

		// copy mcmeta file if it exists
		const sourceMCMETA = source32x + '.mcmeta';
		const targetMCMETA = targetPath + '.mcmeta';
		if (fs.existsSync(sourceMCMETA)) {
			fs.copyFileSync(sourceMCMETA, targetMCMETA);
		}

		await sharp(data32, { raw: { width: info32.width, height: info32.height, channels: info32.channels } }).toFile(targetPath);
		consola.success(`Recolored ${source32x} to ${targetPath}`);
	}
}

function getHex(r: number, g: number, b: number, a: number): `#${string}` {
	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}${a.toString(16).padStart(2, '0').toUpperCase()}`;
}

function getPalette(data: Buffer, info: sharp.OutputInfo): Map<`${number},${number}`, string> {
	const palette = new Map<`${number},${number}`, string>();

	for (let i = 0; i < data.length; i += info.channels) {
		const x = i / info.channels % info.width;
		const y = Math.floor(i / info.channels / info.width);

		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const a = data[i + 3];

		const hexColor = getHex(r, g, b, a);
		palette.set(`${x},${y}`, hexColor);
	}

	return palette;
};