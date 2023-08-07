import { extendTheme, theme as base } from "@chakra-ui/react";

export const theme = extendTheme({
	fonts: {
		Jost: `Jost, ${base.fonts.body}`,
	},
	styles: {
		global: {
			body: {
				backgroundColor: "#04051C",
				color: "white"
			},
		},
	},
});
