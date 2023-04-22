import { readdirSync } from "fs";
import { rm } from "fs/promises";
import { join } from "path";
import * as esbuild from "esbuild";

/**
 * @param {string} dir
 * @param {boolean} deep
 * @returns {string[]}
 */
export function readFileStructure(dir, deep = true) {
	const files = readdirSync(dir, { withFileTypes: true });
	/**
	 * @type {string[]}
	 */
	const structured = [];

	files.forEach((file) => {
		const name = file.name;
		if (file.isFile()) {
			structured.push(join(dir, name));
		} else if (file.isDirectory() && deep) {
			readFileStructure(join(dir, name)).forEach((_file) => {
				structured.push(_file);
			});
		}
	});

	return structured;
}

export async function prebuildFiles() {
	const file = "./src/prebuild-components/index.tsx";

	const build = await esbuild.build({
		entryPoints: [file],
		bundle: true,
		outfile: "build/prebuild.js",
		jsx: "transform",
		jsxFactory: "React.createElement",
		platform: "node",
	});

	if (build.errors.length > 0) {
		console.error(build.errors);
	}

	await import("./build/prebuild.js");
	await rm("./build/prebuild.js");
}
