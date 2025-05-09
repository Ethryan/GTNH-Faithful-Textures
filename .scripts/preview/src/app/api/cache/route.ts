import { readFileSync } from "node:fs";
import { join } from "node:path";

export async function GET() {
	const cachePath = join(process.cwd(), '..', 'cache.json');

	return new Response(readFileSync(cachePath), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}