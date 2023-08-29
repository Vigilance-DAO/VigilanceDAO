import React, { useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import Hero from "pages/landing/Hero";
import Features from "pages/landing/Features";
import Footer from "Footer";
import Testimonials from "pages/landing/Testimonials";
var mixpanel = require("mixpanel-browser");

function App() {
  useEffect(() => {
    mixpanel.init(process.env.REACT_APP_MIXPANEL, {
      track_pageview: true
    });
    mixpanel.track('Open Landing Page');
  }, [])

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      minHeight="100vh"
      position="relative"
      maxWidth="100%"
      overflowX="hidden"
    >
      <Hero />
      <Features />
      <Testimonials />
      <Footer />
    </Flex>
  );
}

export default App;
