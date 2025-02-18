import { readFileSync } from "node:fs";
import { join } from "node:path";

// Cache the cwd path since it won't change
const BASE_PATH = process.cwd();

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const filepath = url.searchParams.get('path');
		const resolution = url.searchParams.get('resolution');

		if (!filepath || !resolution || !['x16', 'x32'].includes(resolution)) {
			return new Response('Invalid parameters', { status: 400 });
		}

		const fullPath = join(
			BASE_PATH, 
			'..', 
			'..',
			resolution === 'x16' ? filepath.replace('assets', '.default') : filepath
		);

		const file = readFileSync(fullPath);
		
		return new Response(file, {
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'public, max-age=31536000', // Add caching
			},
		});
	} catch (error) {
		return new Response('File not found', { status: 404 });
	}
}