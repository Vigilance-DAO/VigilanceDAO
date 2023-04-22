import { join } from "path";
import { outputFile } from "fs-extra";
import { renderToString } from "react-dom/server";

import Alert from "./prebuild-components/alert";
import Index from "./App";

const components = [Alert, Index] as const;

components.forEach(async (component) => {
	let rendered = renderToString(component());
	if (rendered.startsWith("<html>")) {
		rendered = "<!DOCTYPE html>".concat(rendered);
	}

	outputFile(
		join("./build/static/", component.name.toLowerCase().concat(".html")),
		rendered
	);
});
