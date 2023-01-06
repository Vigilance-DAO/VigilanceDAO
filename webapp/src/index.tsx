import React from "react";
import ReactDOM from "react-dom/client";
// import "./index.css";
import reportWebVitals from "./reportWebVitals";
// import Navigation from './Navigation';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { configureChains, createClient, chain, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";
import PrivacyPolicy from "pages/privacyPolicy";
import { Box, ChakraProvider } from "@chakra-ui/react";
import App from "App";
import Cases from "pages/cases/Cases";
import Navbar from "Navbar";
import { theme } from "./theme/theme";
import Fonts from "theme/Fonts";

const { chains, provider } = configureChains(
  [chain.polygonMumbai],
  [
    alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_KEY }),
    publicProvider(),
  ]
);

const client = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  provider,
});
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <WagmiConfig client={client}>
    <React.StrictMode>
      <Router>
        <ChakraProvider theme={theme}>
          <Fonts />
          <Box bgColor="#04051C" fontFamily="Jost" position="relative">
            <Navbar />
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            </Routes>
          </Box>
        </ChakraProvider>
      </Router>
    </React.StrictMode>
  </WagmiConfig>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
