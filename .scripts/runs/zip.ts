
import path from "node:path";

import { ROOT_DIRECTORY } from "../src/constants.ts";
import { zipPack } from "../src/zip.ts";

zipPack(ROOT_DIRECTORY, path.join(ROOT_DIRECTORY, 'pack.zip'));