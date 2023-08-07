import {
  Box,
  Button,
  HStack,
  VStack,
  IconButton,
  Text,
  useDisclosure,
  CloseButton,
  Select,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import React, { useState } from "react";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useNavigate, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import { useScroll } from "framer-motion";
import { ExpandMore } from "@mui/icons-material";
import polygon_icon from "assets/polygon_logo_wo_text.svg";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { address, isConnected } = useAccount();
  const [selectedPolygonValue, setSelectedPolygonValue] =
    useState("Polygon Mumbai");
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  function getAddressShortString() {
    return `${address?.slice(0, 4)}...${address?.slice(-4)}`;
  }

  const mobileNav = useDisclosure();

  console.log("location", location);
  if (location.pathname == "/extension-installed") {
    return null;
  }
  
  const CasesButton: typeof Button = (props) => {
		return (
			<Button
				variant="link"
				colorScheme="white"
				_hover={{
					textDecoration: "none",
				}}
				onClick={() => {
					navigate("/cases");
				}}
				// colorScheme="red"
				size={{ base: "xs", md: "md", lg: "lg" }}
				{...props}
			>
				Cases
			</Button>
		);
	};
  
  const NavMenuButton: typeof MenuButton = (props) => {
		return (
			<MenuButton
				bg="whiteAlpha.300"
				_hover={{ bg: "whiteAlpha.200" }}
				_active={{ bg: "whiteAlpha.200" }}
				as={Button}
				rightIcon={<ExpandMore />}
        style={{ color: "inherit" }}
				{...props}
			>
				{selectedPolygonValue}
			</MenuButton>
		);
	};

  const MobileNavContent = (
    <VStack
      pos="absolute"
      top={0}
      left={0}
      right={0}
      display={mobileNav.isOpen ? "flex" : "none"}
      flexDirection="column"
      p={2}
      pb={4}
      // m={2}
      height="fit-content"
      spacing={3}
      bg="black"
      rounded="sm"
      shadow="sm"
    >
      <CloseButton
        aria-label="Close menu"
        justifySelf="self-start"
        onClick={mobileNav.onClose}
      />
      <CasesButton />
      <Menu>
        <NavMenuButton />
        <MenuList
          bg="#2c2d40"
          boxShadow="none"
          border="none"
          paddingInline="0.25rem"
        >
          <MenuItem
            onClick={() => setSelectedPolygonValue("Polygon Mainnet")}
            bg={
              selectedPolygonValue === "Polygon Mainnet" ? "#5400CD" : "#2c2d40"
            }
            borderRadius="0.25rem"
          >
            Polygon Mainnet
          </MenuItem>
          <MenuItem
            onClick={() => setSelectedPolygonValue("Polygon Mumbai")}
            bg={
              selectedPolygonValue === "Polygon Mumbai" ? "#5400CD" : "#2c2d40"
            }
            borderRadius="0.25rem"
          >
            Polygon Mumbai
          </MenuItem>
        </MenuList>
      </Menu>
    </VStack>
  );
  return (
    <HStack
      height="10vh"
      position="absolute"
      width="100%"
      color="white"
      paddingInline={{ base: "1rem", md: "3rem", lg: "4rem", xl: "6rem" }}
      paddingY={{ md: "1.5rem", lg: "2rem", xl: "3rem" }}
      justifyContent="space-between"
      zIndex={10}
      spacing="0rem"
    >
      <Text
        as="a"
        _hover={{
          cursor: "pointer",
        }}
        onClick={() => {
          navigate("/");
        }}
        fontSize={{ base: "1.3rem", md: "1.8rem", lg: "2rem", xl: "2rem" }}
      >
        VigilanceDAO
      </Text>
      <HStack spacing="1rem">
        <CasesButton display={{base:"none", md: "flex"}} />

        <Box display={{ base: "none", md: "flex" }}>
          <Menu>
            <NavMenuButton />
            <MenuList
              bg="#2c2d40"
              paddingInline="0.5rem"
              boxShadow="none"
              border="none"
            >
              <MenuItem
                onClick={() => setSelectedPolygonValue("Polygon Mainnet")}
                bg={
                  selectedPolygonValue === "Polygon Mainnet"
                    ? "#5400CD"
                    : "#2c2d40"
                }
                borderRadius="0.25rem"
              >
                Polygon Mainnet
              </MenuItem>
              <MenuItem
                onClick={() => setSelectedPolygonValue("Polygon Mumbai")}
                bg={
                  selectedPolygonValue === "Polygon Mumbai"
                    ? "#5400CD"
                    : "#2c2d40"
                }
                borderRadius="0.25rem"
              >
                Polygon Mumbai
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
        <Button
          variant="solid"
          // size="lg"
          bgColor="#5400CD"
          borderRadius="0.125rem"
          paddingInline={"1rem"}
          paddingY="0.75rem"
          color="white"
          lineHeight="120%"
          fontWeight={600}
          fontSize={{ base: "1.5rem", md: "1.125rem" }}
          onClick={() => {
            if (isConnected) {
              disconnect();
            } else {
              connect({
                chainId: parseInt(process.env.REACT_APP_CHAIN_ID || "80001"),
              });
            }
          }}
          _hover={{
            bgColor: "#3c0191",
          }}
          size={{ base: "sm", md: "md", lg: "lg" }}
        >
          {isConnected ? `${getAddressShortString()} | Disconnect` : "Connect"}
        </Button>
        <IconButton
          display={{
            base: "flex",
            md: "none",
          }}
          aria-label="Open menu"
          fontSize="20px"
          color="gray.800"
          _dark={{
            color: "inherit",
          }}
          variant="ghost"
          icon={<Icon as={MenuIcon} color="white" />}
          onClick={mobileNav.onOpen}
        />
      </HStack>
      {MobileNavContent}
    </HStack>
  );
}

export default Navbar;
