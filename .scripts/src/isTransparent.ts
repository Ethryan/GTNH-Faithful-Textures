
import sharp from 'sharp';

/**
 * Check if an image buffer is fully transparent.
 * @param buffer - The image buffer to check.
 * @returns A promise that resolves to true if the image is fully transparent, false otherwise.
 */
export async function isTransparent(buffer: Buffer): Promise<boolean> {
	const { data, info } = await sharp(buffer)
		.raw()
		.ensureAlpha()
		.toBuffer({ resolveWithObject: true });


	for (let i = 0; i < data.length; i += info.channels) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const a = data[i + 3];

		if (a !== 0) {
			return false;
		}
	}

	return true;
}