import { copyFileSync, existsSync, mkdirSync } from "fs";
import { resolve, sep } from "path";

export async function POST(req: Request) {
	const res = await req.json();
	const filePath = res.filePath as string;

	const x16fullPath = resolve(process.cwd(), '..', '..', filePath.replace('assets', '.default'));
	const x32fullPath = resolve(process.cwd(), '..', '..', filePath);

	const x32Dir = x32fullPath.split(sep).slice(0, -1).join('/');
	if (!existsSync(x32Dir)) mkdirSync(x32Dir, { recursive: true });

	// copy x16 to x32
	copyFileSync(x16fullPath, x32fullPath);

	if (existsSync(x16fullPath + '.mcmeta')) {
		copyFileSync(x16fullPath + '.mcmeta', x32fullPath + '.mcmeta');
	}

	return new Response('ok');
}