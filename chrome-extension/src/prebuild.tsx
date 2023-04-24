import { join } from "path";
import { readFile, rm } from "fs/promises";
import { outputFile } from "fs-extra";
import { renderToStaticMarkup } from "react-dom/server";

import Alert from "./prebuild-components/alert";
import Index from "./prebuild-components/index";

const components = [Alert, Index] as const;

const template = (content: string, javascript?: string, css?: string) => {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<link rel="icon" href="/favicon.ico" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans&display=swap" rel="stylesheet">
	<meta name="viewport" content="width=device-width,initial-scale=1" />
	<meta name="theme-color" content="#000000" />
	<meta name="description" content="Web site created using create-react-app" />
	<link rel="apple-touch-icon" href="/logo192.png" />
	<title>React App</title>
	${css == undefined ? "" : `<style>${css}</style>`}
</head>
<body>
	${css?.includes("index.css") ? `<div id="root">${content}</div>` : content}
	${javascript == undefined ? "" : `<script>${javascript}</script>`}
</body>
</html>
`;
};

export function run() {
	return Promise.all(
		components.map(async (component) => {
			const rendered = renderToStaticMarkup(component());
			const baseName = component.name.toLowerCase();
			const jsFile = join("build", baseName.concat(".js"));
			const cssFile = join("build", baseName.concat(".css"));

			let cssContent = undefined,
				jsContent = undefined;
			try {
				cssContent = await readFile(cssFile, "utf-8");

				// await rm(cssFile);
			} catch (_e) {}

			try {
				jsContent = await readFile(jsFile, "utf-8");

				// await rm(jsFile);
			} catch (_e) {}

			const destinationFile = join("./build/static/", baseName.concat(".html"));
			console.log("Writing to", destinationFile);
			return outputFile(
				destinationFile,
				template(rendered, jsContent, cssContent)
			).catch(console.error);
		})
	);
}
