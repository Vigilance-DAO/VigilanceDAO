import { extendTheme, theme as base } from "@chakra-ui/react";

export const theme = extendTheme({
  fonts: {
    Jost: `Jost, ${base.fonts.body}`,
  },
});
