import React, { useState } from "react";

import {
  Card,
  CardHeader,
  CardBody,
  Box,
  Text,
  Stack,
  Tag,
  TagLabel,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Textarea,
  Accordion,
  Link,
  GridItem,
  Grid,
  TagRightIcon,
  HStack,
} from "@chakra-ui/react";
import { IpfsImage } from "react-ipfs-image";
import CheckIcon from "@mui/icons-material/Check";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";

import { ethers } from "ethers";
import CaseValidateButtonNew from "./CaseValidateButton";
import { useAccount } from "wagmi";
export interface CaseInputs {
  id: number;
  domain: string;
  isScam: boolean;
  stakeAmount: string;
  evidences: string[];
  comments: string;
  status: string;
  validator: boolean;
}

const Case = (inputs: CaseInputs) => {
  const {
    id,
    domain,
    isScam,
    stakeAmount,
    evidences,
    comments,
    status,
    validator,
  } = inputs;
  const [validatorComments, setValidatorComments] = useState("");
  const { address, isConnected } = useAccount();

  // const evidences: string[] = ['QmeHnVNb8XFggiX3Bs1GjPAZZfQET81bacX5i5KSmGLfSA']

  function getFormatedAmount() {
    return ethers.utils.formatEther(stakeAmount).toString();
  }

  return (
    <Card
      bgGradient="linear(to-br,#5400CD,#121442,#121442,#121442,#121442,#121442,#121442,#121442)"
      color="white"
      paddingY="1rem"
      paddingX={{ base: "0.5rem", md: "1rem" }}
    >
      <CardHeader>
        <HStack justifyContent="space-between" alignItems="baseline">
          <Text
            as="span"
            fontWeight="bold"
            opacity="60%"
            fontSize={{ base: "1rem", md: "1.2rem" }}
          >
            Domain
          </Text>{" "}
          <Text
            fontSize={{ base: "3rem", md: "4rem" }}
            opacity="70%"
            fontWeight="bold"
            lineHeight="100%"
          >
            <Text as="span" fontSize={{ md: "1.5rem", lg: "2rem" }}>
              #
            </Text>
            {id}
          </Text>
        </HStack>
        <Text
          as="span"
          fontSize={{ base: "1.5rem", md: "2rem" }}
          lineHeight="100%"
        >
          {domain}
        </Text>
        <Stack
          direction={{ base: "row", md: "row", lg: "row" }}
          spacing="0.5rem"
          marginTop="1rem"
        >
          <Tag
            variant="outline"
            width="fit-content"
            colorScheme="purple"
            paddingY="0.25rem"
            borderRadius="0.25rem"
            size={{ base: "sm", md: "md" }}
          >
            <TagLabel>
              <b>Stake:</b> {getFormatedAmount()} MATIC
            </TagLabel>
          </Tag>
          <Tag
            variant="outline"
            width="fit-content"
            opacity="90%"
            paddingY="0.25rem"
            borderRadius="0.25rem"
            size={{ base: "sm", md: "md" }}
            colorScheme={isScam ? "red" : "green"}
            bgColor={isScam ? "rgba(255,0,0,10%)" : "rgba(0,255,0,10%)"}
          >
            <TagLabel>
              <b>Claim:</b> {isScam ? "Scam" : "Legit"}{" "}
            </TagLabel>
            <TagRightIcon as={isScam ? GppMaybeIcon : CheckIcon} />
          </Tag>
        </Stack>
      </CardHeader>

      <CardBody>
        <Stack spacing="2rem">
          <Box>
            <Text
              fontSize={{ base: "0.9rem", md: "1rem" }}
              opacity="70%"
              lineHeight="120%"
              fontWeight="bold"
            >
              Case comments
            </Text>
            <Text
              pt={{ base: "0.2rem", md: "0.5rem" }}
              fontSize={{ base: "1.1rem", md: "1.2rem" }}
            >
              {comments}
            </Text>
          </Box>
          <Box>
            <Accordion allowMultiple>
              <AccordionItem
                border="0"
                bgColor="#1D2056"
                borderRadius="0.25rem"
              >
                <AccordionButton
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  padding="1rem"
                >
                  <Text
                    as="span"
                    flex="1"
                    textAlign="left"
                    fontSize="1rem"
                    opacity="70%"
                    lineHeight="120%"
                    fontWeight="bold"
                  >
                    Case Evidences
                  </Text>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <Grid
                    padding={{ base: "0.25rem", md: "0.5rem", lg: "1rem" }}
                    width="100%"
                    gap={{ base: "1.5rem", md: "1rem", lg: "1rem", xl: "1rem" }}
                    templateColumns="repeat(1,1fr)"
                  >
                    {evidences.map((item) => (
                      <GridItem colSpan={1} key={item}>
                        <Link href={item} target="_blank">
                          <IpfsImage
                            hash={item}
                            gatewayUrl="https://infura-ipfs.io/ipfs"
                            // style={{ width: "200px", height: "200px" }}
                          />
                        </Link>
                      </GridItem>
                    ))}
                  </Grid>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
          <Box>
            {status == null && (
              <>
                <Textarea
                  id="outlined-multiline-static"
                  placeholder="Your comments..."
                  rows={2}
                  value={validatorComments}
                  onChange={(
                    event: React.ChangeEvent<HTMLTextAreaElement>
                  ): void => {
                    setValidatorComments(event.target.value);
                  }}
                  width="100%"
                  bgColor="#1D2056"
                  border="none"
                  borderRadius="0.25rem"
                />
                {isConnected ? (
                  validator ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        marginTop: "10px",
                      }}
                    >
                      <CaseValidateButtonNew
                        id={id}
                        validatorComments={validatorComments}
                        action={"ACCEPT"}
                      />
                      <CaseValidateButtonNew
                        id={id}
                        validatorComments={validatorComments}
                        action={"REJECT"}
                      />
                    </Box>
                  ) : (
                    <Text
                      marginTop="1rem"
                      opacity="70%"
                      fontWeight="semibold"
                      fontSize={{ base: "0.7rem", md: "0.9rem" }}
                    >
                      You are not a validator
                    </Text>
                  )
                ) : (
                  <Text
                    marginTop="1rem"
                    opacity="70%"
                    fontWeight="semibold"
                    fontSize={{ base: "0.7rem", md: "0.9rem" }}
                  >
                    Please connect your wallet to validate this case
                  </Text>
                )}
              </>
            )}
          </Box>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default Case;
