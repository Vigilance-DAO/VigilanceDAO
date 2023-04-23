import { readFileSync } from "fs";
import { rm } from "fs/promises";
import * as esbuild from "esbuild";
import { copy } from "esbuild-plugin-copy";
import { parse } from "dotenv";

const isWatching = process.argv.includes("--watch");
if (isWatching) {
	console.log("--watch is provided. Files will be watched.");
}

let definedValues = {};

try {
	const envFile = readFileSync("./.env");
	definedValues = Object.fromEntries(
		Object.entries(parse(envFile)).map(([key, value]) => {
			return ["process.env.".concat(key), `"${value}"`];
		})
	);
} catch (_e) {}

/**
 * @type {import("esbuild").BuildOptions}
 */
const esbuildOptions = {
	entryPoints: ["src/index.tsx", "src/background.js"],
	minify: false,
	outdir: "build",
	bundle: true,
	loader: { ".svg": "dataurl" },
	platform: "browser",
	define: definedValues,
	plugins: [
		copy({
			resolveFrom: "cwd",
			assets: {
				from: "./public/**/*",
				to: ["./build"],
			},
			watch: isWatching,
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

	// prebuild html files
	const file = "./src/prebuild.tsx";

	console.log("Building", file);
	const build = await esbuild.build({
		entryPoints: [file],
		bundle: true,
		outfile: "build/prebuild.js",
		jsx: "transform",
		jsxFactory: "React.createElement",
		platform: "node",
		sourcemap: "inline",
		minify: false,
		define: definedValues,
	});
	if (build.warnings.length > 0) {
		console.warn(build.warnings);
	}
	if (build.errors.length > 0) {
		console.error(build.errors);
	}
	console.log("Building", file, "done");

	console.log("Generating prebuilt html");
	await import("./build/prebuild.js");
	await rm("./build/prebuild.js");
	console.log("Generating prebuilt html done");
})();
