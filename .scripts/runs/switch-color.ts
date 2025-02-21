import { recolorPixel } from "../src/switch-color.ts";

const args = process.argv.slice(2);

if (args.length === 0) {
	console.error('Please provide a source file, the color to replace, and the color to replace it with, e.g: "npm run switch-color image.png \'#ff0000\' \'#00ff00\'"');
}
else recolorPixel(args[0], args[1], args[2]);