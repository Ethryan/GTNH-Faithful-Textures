import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export async function GET(req: Request) {
  const configPath = join(process.cwd(), '..', 'config.json');
  const config = JSON.parse(readFileSync(configPath, "utf-8"));

	try {
		const url = new URL(req.url);
    const filepath = url.searchParams.get("path");
    const resolution = url.searchParams.get("resolution");

    if (!filepath || !resolution || !["x16", "x32"].includes(resolution)) {
      return new Response(JSON.stringify({ error: "Invalid parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const texturePath = resolution === "x16" 
      ? config.directories.default.replace("$root", config.directories.$root) + filepath.replace("assets", "")
      : config.directories.faithful.replace("$root", config.directories.$root) + filepath.replace("assets", "");

    if (!existsSync(texturePath)) {
      return new Response(JSON.stringify({ error: "Texture not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Read texture file
    const textureFile = readFileSync(texturePath);
    const textureBase64 = `data:image/png;base64,${textureFile.toString("base64")}`;

    // Determine mcmeta file path
    const mcmetaPath = texturePath.replace(".png", ".png.mcmeta");
    let mcmetaContent = null;

    if (existsSync(mcmetaPath)) {
      try {
        mcmetaContent = JSON.parse(readFileSync(mcmetaPath, "utf-8"));
      } catch {
        mcmetaContent = { error: "Invalid mcmeta file" };
      }
    }

    return new Response(
      JSON.stringify({ texture: textureBase64, mcmeta: mcmetaContent }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=${resolution === 'x16' ? 604800 : 60}`, // 1 minute if x32, 1 week if x16
        },
      }
    );
	} catch (error) {
		return new Response('File not found', { status: 404 });
	}
}