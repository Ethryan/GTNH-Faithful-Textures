
import consola from "consola";
import { updatePack } from "../src/update.ts";

const args = process.argv.slice(2);

if (args.length === 0) {
	consola.error('Please provide a version number, e.g.: "npm run update 1.0.0"');
}

else updatePack(args[0]);