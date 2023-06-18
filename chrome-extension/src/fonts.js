const FONT_NAME = "X_Roboto";
const FONT_WEIGHTS = {
	"400": "./fonts/Roboto-Regular.ttf",
	"700": "./fonts/Roboto-Bold.ttf",
};

function getFonts() {
	if (typeof chrome == "undefined") {
		return "";
	}
	const rules = [];
	const entries = Object.entries(FONT_WEIGHTS);

	for (let i = 0; i < entries.length; i++) {
		const [weight, value] = entries[i];
		rules.push(`@font-face {
  font-family: '${FONT_NAME}';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url(${chrome.runtime.getURL(value)}) format('ttf');
}`);
	}

	return rules.join("\n");
}

module.exports = {
	getFonts,
};
