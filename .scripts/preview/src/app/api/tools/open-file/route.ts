import { execSync } from "child_process";
import { resolve } from "path";

export async function POST(req: Request) {
	const res = await req.json();
	const filePath = res.filePath as string;
	const resolution = res.resolution as 'x16' | 'x32';

	const fullPath = resolve(
		process.cwd(), 
		'..', 
		'..',
		resolution === 'x16' ? filePath.replace('assets', '.default') : filePath
	);

	try {
		console.log(`explorer /select,"${fullPath}"`);
		execSync(`explorer /select,"${fullPath}"`);
	} catch (err) {}

	return new Response('ok');
}