import {jsmin} from 'jsmin';
import { readFile, writeFile } from "fs/promises";

const contents = await readFile('./dist/fed-embed.js', { encoding: 'utf8' });
const minified = jsmin(contents, 3);
await writeFile('./dist/fed-embed.min.js', minified);
