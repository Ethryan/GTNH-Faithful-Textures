import fs from 'node:fs';

import { packProgress } from './progress.ts';
import { PACK_MCMETA } from './constants.ts';

export async function updatePack(version: string) {

	const percentage = packProgress();

	const packMCMETA = {
		pack: {
			pack_format: 1,
			description: `§6GT New Horizons §bFaithful x32 §6By Ethryan §bv${version} §r(${percentage}% done)`
		}
	}

	fs.writeFileSync(PACK_MCMETA, JSON.stringify(packMCMETA, null, 2));
}