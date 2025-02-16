import { recolor } from "../src/recolor.ts";

const args = process.argv.slice(2);

if (args.length === 0) {
	console.error('Please provide a source file and at least one target, e.g: "npm run recolor source16.png target1.png target2.png"');
}

else recolor(args[0], args.slice(1));