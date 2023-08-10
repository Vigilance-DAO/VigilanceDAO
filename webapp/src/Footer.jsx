import React from "react";
import logo from "./assets/icon128.png";
import {
  Box,
  Divider,
  Grid,
  GridItem,
  HStack,
  Image,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { DiscordIcon, TwitterIcon } from "Icons";
import { urls } from "utils/urls";

function Footer() {
  return (
    <Box
      width="100%"
      bgGradient="linear(to-br,#5400CD,#121442,#121442,#121442,#121442,#121442,#121442)"
      paddingTop={{ base: "3rem", xl: "3rem" }}
      paddingBottom={{ base: "1rem", xl: "2rem" }}
    >
      <VStack
        spacing="2rem"
        alignItems="flex-start"
        width={{ base: "90%", xl: "80%" }}
        marginInline="auto"
      >
        <Grid
          width="100%"
          gap="2rem"
          templateColumns={{
            base: "repeat(6,1fr)",
            md: "repeat(7,1fr)",
            xl: "repeat(5,1fr)",
          }}
        >
          <GridItem colSpan={{ base: 6, md: 2, xl: 2, "2xl": 1 }}>
            <HStack alignItems="center" marginBottom="1rem">
              <Image
                boxSize={{
                  base: "3rem",
                  md: "2.5rem",
                  lg: "3rem",
                }}
                src={logo}
                alt="Company Logo"
              />
              <Link href="/ " target="_blank" title="Vigilance Dao Homepage">
                <Text
                  fontSize={{
                    base: "3xl",
                    md: "xl",
                    lg: "2xl",
                    xl: "3xl",
                  }}
                  fontWeight="medium"
                  color="white"
                >
                  Vigilance Dao
                </Text>
              </Link>
            </HStack>
            <Text color="white" align="left" fontSize="0.8rem">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
            </Text>
          </GridItem>
          <GridItem colSpan={{ base: 6, md: 1, xl: 1, "2xl": 2 }}></GridItem>
          <GridItem colSpan={{ base: 3, md: 2, xl: 1 }}>
            <VStack color="white" spacing="1rem" alignItems="flex-start">
              <Text fontSize="lg">Documentation</Text>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                as="a"
                _hover={{ fontWeight: "600", cursor: "pointer" }}
                transition="0.1s"
                target="_blank"
                href={urls.Testnet}
                opacity="60%"
              >
                Docs
              </Text>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                as="a"
                _hover={{ fontWeight: "600", cursor: "pointer" }}
                transition="0.1s"
                target="_blank"
                href={urls["Integrate dApp"]}
                opacity="60%"
              >
                How it works?
              </Text>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                as="a"
                _hover={{ fontWeight: "600", cursor: "pointer" }}
                transition="0.1s"
                target="_blank"
                href={urls["Vigilance Dao 101"]}
                opacity="60%"
              >
                How to report?
              </Text>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                as="a"
                _hover={{ fontWeight: "600", cursor: "pointer" }}
                transition="0.1s"
                target="_blank"
                href={urls.Docs}
                opacity="60%"
              >
                How to identify scams?
              </Text>
            </VStack>
          </GridItem>
          <GridItem colSpan={{ base: 3, md: 2, xl: 1 }}>
            <VStack color="white" spacing="1rem" alignItems="flex-start">
              <Text fontSize="lg">Socials</Text>
              <Stack
                direction={{ base: "column", md: "row" }}
                width="100%"
                alignItems="start"
              >
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  as="a"
                  target="_blank"
                  href={urls.Discord}
                  opacity="60%"
                  marginRight="1rem"
                >
                  <DiscordIcon
                    fontSize="1.5rem"
                    color="footer-icon"
                    marginRight="0.5rem"
                    _hover={{ color: "white" }}
                  />
                  Discord
                </Text>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  as="a"
                  target="_blank"
                  href={urls["Twitter"]}
                  opacity="60%"
                  marginRight="1rem"
                >
                  <TwitterIcon
                    fontSize="1.5rem"
                    color="footer-icon"
                    marginRight="0.5rem"
                    _hover={{ color: "white" }}
                  />
                  Twitter
                </Text>
              </Stack>
            </VStack>
          </GridItem>
        </Grid>
        <Box width="100%">
          <Divider
            orientation="horizontal"
            opacity="20%"
            borderBottomWidth="0.1rem"
          />
          <Stack
            direction="row"
            width="100%"
            spacing="0.75rem"
            color={"white"}
            justifyContent="space-between"
            marginTop="1.5rem"
          >
            <HStack spacing={{ base: "1rem", md: "2rem" }}>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                as="a"
                _hover={{ fontWeight: "600", cursor: "pointer" }}
                transition="0.1s"
                target="_blank"
                href={urls["Terms Of Service"]}
                opacity="60%"
              >
                Terms of Service
              </Text>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                as="a"
                _hover={{ fontWeight: "600", cursor: "pointer" }}
                transition="0.1s"
                target="_blank"
                href={urls["Privacy Policy"]}
                opacity="60%"
              >
                Privacy Policy
              </Text>
            </HStack>
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              as="a"
              _hover={{ fontWeight: "600", cursor: "pointer" }}
              transition="0.1s"
              target="_blank"
              href="/"
              opacity="60%"
            >
              © 2022 Vigilance Dao
            </Text>
          </Stack>
        </Box>
      </VStack>
    </Box>
  );
}

export default Footer;
