import { Button, HStack, Text } from "@chakra-ui/react";
import React from "react";
import { redirect } from "react-router-dom";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  return (
    <HStack
      height="10vh"
      position="absolute"
      width="100%"
      color="white"
      paddingInline={{ base: "2rem", md: "3rem", lg: "4rem", xl: "6rem" }}
      paddingY={{ md: "1.5rem", lg: "2rem", xl: "3rem" }}
      justifyContent="space-between"
      zIndex={10}
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
      <HStack>
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
        >
          Cases
        </Button>
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
          fontSize="1.125rem"
          onClick={() => {
            if (isConnected) {
              disconnect();
            } else {
              connect();
            }
          }}
          _hover={{
            bgColor: "#3c0191",
          }}
          size={{ base: "xs", md: "md", lg: "lg" }}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </Button>
      </HStack>
    </HStack>
  );
}

export default Navbar;
