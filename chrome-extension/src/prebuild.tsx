import { join } from "path";
import { outputFile } from "fs-extra";
import { renderToStaticMarkup } from "react-dom/server";

import Alert from "./prebuild-components/alert";
import Index from "./prebuild-components/index";

const components = [Alert, Index] as const;

const template = (content: string) => `
<!DOCTYPE html>
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
	<script defer="defer" src="index.js"></script>
</head>
<body>
	${content}
</body>
</html>
`;

components.forEach(async (component) => {
	const rendered = renderToStaticMarkup(component());

	outputFile(
		join("./build/static/", component.name.toLowerCase().concat(".html")),
		template(rendered)
	);
});
