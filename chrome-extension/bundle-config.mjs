import * as esbuild from "esbuild";
import { copy } from "esbuild-plugin-copy";

const isWatching = process.argv.includes("--watch");
if (isWatching) {
	console.log("--watch is provided. Files will be watched.");
}

/**
 * @type {import("esbuild").BuildOptions}
 */
const esbuildOptions = {
	entryPoints: [
		"src/index.tsx",
		"src/content.js"
	],
	minify: true,
	outdir: "build",
	bundle: true,
	loader: { ".svg": "dataurl" },
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
