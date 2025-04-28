
# Scripts

If you're reading this, you're probably looking to use the scripts in this repository; Here's a quick guide to get you started.

## Prerequisites

- [Node.JS v23.7.0](https://nodejs.org/fr) or higher (23.7.0 is the first version to support TypeScript "out of the box")
- Copy the `config.example.json` file to `config.json` and fill the values with your own.
- Install the dependencies:

```bash
# Install the dependencies for the scripts
npm install
# Install the dependencies for the preview application
cd preview
npm install 
```

## Running the preview application

The preview application is a simple web application that allows you to preview the textures in the resource pack. All the code is placed in the `preview` folder. The application is built using Next.js and React.js.

To start the preview application, run the following command in the `preview` folder:

```bash
cd preview
npm run dev
```

This will start the application on [`http://localhost:3000`](http://localhost:3000). You can then open this URL in your web browser to see the textures in action.
The application provides simple tools to manage the textures when clicking on them, such as:
- **Fullscreen Preview**: Preview the texture in BIG.
- **Reveal in File Explorer**: Open the texture in your file explorer (windows only _for now_).
- **Copy asset path**: Copy the asset path to the clipboard.
- **Copy to x32**: (only on x16 textures) Copy the texture to the x32 folder.

![image](https://github.com/user-attachments/assets/252de524-39c9-4922-a6c3-94d5bba0a056)

## Running the scripts

### `npm run extract`

This script extracts the default textures to the `.default` folder and update the `cache.json` file with the new paths.

**Example:**
```bash
npm run extract
```

### `npm run cleanup`

This script removes the textures from the `assets` folder that are not present in the `cache.json` file. This is useful to clean up the assets folder and remove unused textures from the project directory.

**Example:**
```bash
npm run cleanup
```

### `npm run update <x.y.z>`

This script updates the `pack.mcmeta` with the given version (`x.y.z`) and the pack percentage progression. It also updates the `progress.txt` file with the progression of each mod.

**Info:**
- The version should be following the SemVer format `x.y.z` (e.g. `0.9.18`).
- This script is mainly used in the CI/CD pipeline to create the resource pack for the release.

**Example:**
```bash
npm run update 0.9.18
```

### `npm run zip`

This script zips required files to create a resource pack. It will create a `pack.zip` file in the root directory of the project. 

**Info:**
- It does not update the `pack.mcmeta` file, so you need to run the `update` script before running this one.
- This script is mainly used in the CI/CD pipeline to create the resource pack for the release.

**Example:**
```bash
npm run zip
```

### `npm run recolor <source> <target...>`

This script recolors the `source` texture using the palettes of the `target`s textures, all provided files needs to be in the `.default` folder. The script will automatically create a new x32 version of each target texture in the `assets` folder.

**Info:**
- It does not support relative paths _yet_.
- The x32 version of the `source` texture needs to be done and placed at the same path as the x16 version.
- Has some issue with different resolutions between the source and target textures.
- Works best when the source and target textures have the same number of colors and when the pixels are in the same place.

**Example:**
```bash
# will recolor the Vanilla x32 iron_ingot to the Good Generator wrappedUraniumIngot 
# using the palette of both x16 textures
npm run recolor "<ROOT>/.default/minecraft/textures/items/iron_ingot.png" "<ROOT>/.default/goodgenerator/textures/items/wrappedUraniumIngot.png" "<ROOT>/.default/goodgenerator/textures/items/wrappedThoriumIngot.png"
```

### `npm run switch-color <source> <color1> <color2>`

This script exactly 1 color from the source texture to the target color.

**Info:**
- It does not support relative paths _yet_.

**Example:**
```bash
# will replace all pixels of the color #ff0000 in the source texture with the color #00ff00
npm run switch-color "<ROOT>/.default/minecraft/textures/items/iron_ingot.png" "#ff0000" "#00ff00"
```