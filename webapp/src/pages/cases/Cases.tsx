import React, { useEffect, useState } from "react";

import { FETCH_OPEN_REPORTS, FETCH_REPORTS } from "../../queries/index";
import { subgraphQuery } from "../../utils/index";
import { ethers } from "ethers";
import { useSigner, useAccount } from "wagmi";
import {
  governanceBadgeAbi,
  governanceBadgeAddress,
} from "../../constants/index";
// import { ValidatorInfo } from "@solana/web3.js";
import Case, { CaseInputs } from "./case/Case";
import {
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Select,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
interface CaseInputsTable extends Omit<CaseInputs, "evidences"> {
  evidences: string;
}

function Cases(props: any) {
  const [cases, setCases] = useState<CaseInputsTable[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("OPEN");
  const { address, isConnected } = useAccount();
  const { data: signer, isError, isLoading } = useSigner();
  const [validator, setValidator] = useState<boolean>(false);
  const [validationRequest, setValidationRequest] = useState<boolean>(false);
  const [stake, setStake] = useState<string>("0");

  async function fetchCases() {
    let data;
    if (filterStatus === "OPEN") {
      data = await subgraphQuery(FETCH_OPEN_REPORTS());
    } else {
      data = await subgraphQuery(FETCH_REPORTS(filterStatus));
    }
    let _cases: CaseInputsTable[] = [];
    let rows: any[] = data.reports || [];
    for (let i = 0; i < rows.length; ++i) {
      let row = rows[i];
      _cases.push(row);
    }
    setCases(_cases);
  }

  async function checkValidator() {
    try {
      const governanceBadgeContract = new ethers.Contract(
        governanceBadgeAddress,
        governanceBadgeAbi,
        signer as ethers.Signer
      );
      const bal = await governanceBadgeContract.balanceOf(address, 1);
      console.log("bal", ethers.BigNumber.from(bal).toNumber());
      if (ethers.BigNumber.from(bal).toNumber() > 0) {
        setValidator(true);
      } else {
        const requests = await governanceBadgeContract.validationRequests(
          address
        );
        if (!requests.isZero()) {
          setValidationRequest(true);
        }
      }
    } catch (e) {
      alert(e);
    }
  }

  async function getStake() {
    try {
      const governanceBadgeContract = new ethers.Contract(
        governanceBadgeAddress,
        governanceBadgeAbi,
        signer as ethers.Signer
      );
      const stakeAmount = await governanceBadgeContract.stakingAmount();
      setStake(ethers.utils.formatEther(stakeAmount).toString());
    } catch (e) {
      alert(e);
    }
  }

  async function requestValidatorRole() {
    try {
      const governanceBadgeContract = new ethers.Contract(
        governanceBadgeAddress,
        governanceBadgeAbi,
        signer as ethers.Signer
      );
      const stakeAmount = await governanceBadgeContract.stakingAmount();
      const tx = await governanceBadgeContract.requestValidatorRole({
        value: stakeAmount,
      });
      await tx.wait();
      setValidationRequest(true);
    } catch (e) {
      alert(e);
    }
  }

  async function revokeRequest() {
    try {
      const governanceBadgeContract = new ethers.Contract(
        governanceBadgeAddress,
        governanceBadgeAbi,
        signer as ethers.Signer
      );
      const tx = await governanceBadgeContract.revokeValidationRequest();
      await tx.wait();
      setValidationRequest(false);
    } catch (e) {
      alert(e);
    }
  }

  useEffect(() => {
    fetchCases();
  }, [filterStatus]);

  useEffect(() => {
    if (isConnected && signer) {
      checkValidator();
      getStake();
    }
  }, [isConnected, signer]);

  console.log(validator, address);

  function loadCases() {
    let rows: any[] = [];
    if (cases.length)
      for (let i = 0; i < cases.length; ++i) {
        let _case = cases[i];
        let _evidences = (_case.evidences as string).split(",");
        rows.push(
          <GridItem colSpan={{ base: 12, md: 6, xl: 4 }} key={i}>
            <Case
              domain={_case.domain}
              isScam={_case.isScam}
              id={ethers.BigNumber.from(_case.id).toNumber()}
              stakeAmount={_case.stakeAmount}
              evidences={_evidences}
              comments={_case.comments}
              status={_case.status}
              validator={validator}
            ></Case>
          </GridItem>
        );
      }
    return rows;
  }
  return (
    <>
      <Box height="10vh" width="100%" />
      <Box
        display="flex"
        justifyContent="center"
        //   alignItems="center"
        width={"100%"}
        minHeight="100vh"
      >
        <VStack
          backgroundColor=""
          padding={{ base: "2rem", md: "2rem", lg: "4rem", xl: "4rem" }}
          width={{
            base: "100%",
            md: "100%",
            lg: "100%",
            xl: "100%",
            "2xl": "90%",
          }}
          borderRadius="0.25rem"
          alignItems="start"
          color="white"
          spacing="2rem"
        >
          <Text fontSize={{ base: "2rem", md: "3rem" }} fontWeight="semibold">
            Reported Domains
          </Text>
          <Stack direction={{ base: "column", md: "row" }} spacing="1rem">
            {isConnected && !validator && (
              <>
                {!validationRequest ? (
                  <Button
                    leftIcon={<AssignmentIcon />}
                    variant="solid"
                    bgColor="#5400CD"
                    _hover={{
                      bgColor: "#3c0191",
                    }}
                    size={{ base: "sm", md: "md" }}
                    onClick={requestValidatorRole}
                    borderRadius="0.125rem"
                  >
                    Request Validator Role
                  </Button>
                ) : (
                  <Button
                    leftIcon={<DoDisturbAltIcon />}
                    variant="solid"
                    colorScheme="red"
                    onClick={revokeRequest}
                    borderRadius="0.125rem"
                  >
                    Revoke Request
                  </Button>
                )}
              </>
            )}
            <Text fontSize={{ base: "1rem", md: "1.5rem" }} opacity="60%">
              Only Validators can validate
            </Text>
          </Stack>
          <Stack
            direction={{ base: "column", md: "row" }}
            justifyContent="space-between"
            width="100%"
            marginBottom="0.75rem"
          >
            <Text
              textAlign="left"
              fontSize={{ base: "1rem", md: "1.5rem" }}
              marginTop="0.5rem"
            >
              <b>Stake:</b> {stake} MATIC
            </Text>
            <HStack>
              <Text whiteSpace="nowrap">Filter Status: </Text>
              <Select
                borderRadius="0.125rem"
                variant="filled"
                width="fit-content"
                size={{ base: "sm", md: "md" }}
                bgColor="blue.400"
                _hover={{
                  bgColor: "blue.500",
                }}
                id="demo-simple-select"
                value={filterStatus}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                  setFilterStatus(event.target.value as string);
                }}
              >
                <option style={{ backgroundColor: "black" }} value={"OPEN"}>
                  Open
                </option>
                <option style={{ backgroundColor: "black" }} value={"ACCEPTED"}>
                  Accepted
                </option>
                <option style={{ backgroundColor: "black" }} value={"REJECTED"}>
                  Rejected
                </option>
              </Select>
            </HStack>
          </Stack>
          <Grid
            templateColumns="repeat(12,1fr)"
            rowGap={{ base: "2rem", md: "2rem" }}
            columnGap={{ base: "0rem", md: "2rem" }}
            width="100%"
          >
            {loadCases()}
          </Grid>
        </VStack>
      </Box>
    </>
  );
}

export default Cases;
