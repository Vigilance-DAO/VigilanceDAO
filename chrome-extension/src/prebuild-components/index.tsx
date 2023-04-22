import { join } from "path";
import { outputFile } from "fs-extra";
import { renderToString } from "react-dom/server";

import Alert from "./alert";

const components = [Alert] as const;

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
