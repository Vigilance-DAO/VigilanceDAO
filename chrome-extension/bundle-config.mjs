import { readFileSync } from "fs";
import { writeFile } from "fs/promises";
import * as esbuild from "esbuild";
import browserify from "browserify";
import { copy } from "esbuild-plugin-copy";
import { join } from "path";
import { parse } from "dotenv";

const isWatching = process.argv.includes("--watch");
if (isWatching) {
	console.log("--watch is provided. Files will be watched.");
}

// const b = browserify([
// 	"src/content.js",
// ]);

// /**
//  * @type {import("esbuild").Plugin}
//  */
// const browserifyPlugin = {
// 	name: "browserify-plugin",
// 	setup(build) {
// 		build.onStart(() => {
// 			console.time("browserify");
// 			b.bundle(async (error, buffer) => {
// 				if (error) {
// 					throw new Error(error);
// 				}
// 				console.timeEnd("browserify");
// 				writeFile(
// 					join("./", build.initialOptions.outdir, "content.js"),
// 					buffer
// 				).catch(err => {
// 					console.error("Error while writing content.js", err);
// 				})
// 			});
// 		})

// 	}
// }

const envFile = readFileSync("./.env");
const loadedEnvVairables = parse(envFile);

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
		// browserifyPlugin
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
