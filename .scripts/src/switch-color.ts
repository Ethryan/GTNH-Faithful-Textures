import consola from "consola";
import sharp from "sharp";

export async function recolorPixel(imagePath: string, colorIn: string, colorOut: string) {
  try {
    const image = sharp(imagePath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    const inColor = hexToRgb(colorIn);
    const outColor = hexToRgb(colorOut);

    for (let i = 0; i < data.length; i += 4) {
      if (
        data[i] === inColor.r &&
        data[i + 1] === inColor.g &&
        data[i + 2] === inColor.b
      ) {
        data[i] = outColor.r;
        data[i + 1] = outColor.g;
        data[i + 2] = outColor.b;
      }
    }

    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .toFile(imagePath);

    consola.success("Image recoloring complete!");
  } catch (error) {
    consola.error("Error processing the image:", error);
  }
}

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}