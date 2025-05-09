import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join, sep } from "path";

export async function POST(req: Request) {
	const configPath = join(process.cwd(), '..', 'config.json');
	const config = JSON.parse(readFileSync(configPath, "utf-8"));
	
	const res = await req.json();
	const filePath = res.filePath as string;
	const resolution = res.resolution as 'x16' | 'x32';

	const fullPath = resolution === "x16" 
		? config.directories.default.replace("$root", config.directories.$root) + filePath.replace("assets", "")
		: config.directories.faithful.replace("$root", config.directories.$root) + filePath.replace("assets", "");

	try {
		execSync(`explorer /select,"${fullPath.replaceAll('/', sep)}"`);
	} catch (err) {}

	return new Response('ok');
}