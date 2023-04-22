import { readFileSync } from "fs";
import * as esbuild from "esbuild";
import { copy } from "esbuild-plugin-copy";
import { parse } from "dotenv";

import { prebuildFiles } from "./prebuild-html.mjs";

const isWatching = process.argv.includes("--watch");
if (isWatching) {
	console.log("--watch is provided. Files will be watched.");
}

prebuildFiles();

let loadedEnvVairables = {};

try {
	const envFile = readFileSync("./.env");
	loadedEnvVairables = parse(envFile);
} catch (_e) {}

/**
 * @type {import("esbuild").BuildOptions}
 */
const esbuildOptions = {
	entryPoints: [
		"src/index.tsx",
		"src/background.js"
	],
	minify: false,
	outdir: "build",
	bundle: true,
	loader: { ".svg": "dataurl" },
	platform: "browser",
	define: Object.fromEntries(Object.entries(loadedEnvVairables).map(([key, value]) => {
		return ["process.env.".concat(key), `"${value}"`];
	})),
	plugins: [
		copy({
			resolveFrom: "cwd",
			assets: {
				from: "./public/**/*",
				to: ["./build"],
			},
			watch: isWatching
		}),
	],
};

(async () => {
	if (isWatching) {
		const ctx = await esbuild.context(esbuildOptions);

		await ctx.watch();
		console.log("Watching...");

		process.on("SIGKILL", () => {
			ctx.dispose();
			console.log("Stopped watching");
		});
	} else {
		await esbuild.build(esbuildOptions);
	}
})();
