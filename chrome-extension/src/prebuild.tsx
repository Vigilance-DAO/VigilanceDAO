import { join } from "path";
import { readFile, rm } from "fs/promises";
import { outputFile } from "fs-extra";
import { renderToStaticMarkup } from "react-dom/server";

import * as Alert from "./prebuild-components/alert";
import * as Index from "./prebuild-components/index";
import * as FinancialAlert from "./prebuild-components/financial-alert";

interface PrebuildComponentModule {
	default: () => JSX.Element;
	config?: {
		/**
		 * @default false
		 */
		skipTemplate?: boolean;
		jsFile?: string;
	};
}

const components: readonly PrebuildComponentModule[] = [
	Alert,
	Index,
	FinancialAlert,
] as const;

const template = (
	content: string,
	jsFile?: string,
	css?: string,
	skipTemplate?: boolean
) => {
	if (skipTemplate) {
		return (css == undefined ? "" : `<style>${css}</style>`).concat(content);
	} else {
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
	${
		css?.includes("index.css") || css?.includes("App.css")
			? `<div id="root">${content}</div>`
			: content
	}
	${jsFile == undefined ? "" : `<script src="${jsFile}"></script>`}
</body>
</html>
`;
	}
};

export function run() {
	return Promise.all(
		components.map(async (componentModule) => {
			const component = componentModule.default;
			const rendered = renderToStaticMarkup(component());
			const baseName = component.name.toLowerCase();
			const jsFile =
				componentModule.config?.jsFile ||
				"../prebuild-components/".concat(baseName.concat(".js"));
			const cssFile = join(
				"build/prebuild-components",
				baseName.concat(".css")
			);

			let cssContent = undefined;
			try {
				cssContent = await readFile(cssFile, "utf-8");
				const lines = cssContent.split("\n");
				if (lines.at(-2)?.startsWith("/*# sourceMappingURL")) {
					lines[lines.length - 2] = "";
					cssContent = lines.join("\n");
				}
				// await rm(cssFile);
			} catch (_e) {}

			const destinationFile = join("./build/static/", baseName.concat(".html"));
			console.log("Writing to", destinationFile);
			return outputFile(
				destinationFile,

				template(
					rendered,
					jsFile,
					cssContent,
					componentModule.config?.skipTemplate
				)
			).catch(console.error);
		})
	);
}
