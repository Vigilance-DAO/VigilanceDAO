import { rm } from "fs/promises";
import * as esbuild from "esbuild";

export async function prebuildFiles() {
	const file = "./src/prebuild.tsx";

	console.log("Building", file);
	const build = await esbuild.build({
		entryPoints: [file],
		bundle: true,
		outfile: "build/prebuild.js",
		jsx: "transform",
		jsxFactory: "React.createElement",
		platform: "node",
	});
	console.log("Building", file, "finished");

	if (build.errors.length > 0) {
		console.error(build.errors);
	}

	console.log("Generating prebuilt html");
	await import("./build/prebuild.js");
	await rm("./build/prebuild.js");
	console.log("Generating prebuilt html done");
}
