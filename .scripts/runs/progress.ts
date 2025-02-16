import consola from "consola";

import { packProgress } from "../src/progress.ts";

const args = process.argv.slice(2);

if (args.length === 0) {
	consola.warn('To see detailed progress for specific assets, provide the assets names, e.g.: "npm run progress minecraft gregtech"');
}

if (args[0]) packProgress(args);
else packProgress();