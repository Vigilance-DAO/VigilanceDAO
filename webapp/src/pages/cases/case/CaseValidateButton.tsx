import React, { useState } from "react";
import { abi, address } from "../../../constants/index";
import { ethers } from "ethers";
import { useSigner } from "wagmi";
import { Button } from "@chakra-ui/react";

export interface ValidateInput {
  id: number;
  validatorComments: string;
  action: "ACCEPT" | "REJECT";
}

const CaseValidateButton = (inputs: ValidateInput) => {
  const { id, validatorComments, action } = inputs;
  const [disabled, setDisabled] = useState(false);
  const { data: signer, isError, isLoading } = useSigner();
  const [buttonText, setButtonText] = useState<string>(action);
  const submit = async () => {
    try {
      setDisabled(true);
      setButtonText("Validating...");
      const contract = new ethers.Contract(address, abi, signer || undefined);
      console.log(contract);
      if (action === "ACCEPT") {
        const tx = await contract.validate(id, true, validatorComments);
        await tx.wait();
      } else {
        const tx = await contract.validate(id, false, validatorComments);
        await tx.wait();
      }
    } catch (e) {
      console.log(e);
      setDisabled(false);
      setButtonText(action);
    }
  };
  return (
    <Button
      colorScheme={action === "ACCEPT" ? "green" : "red"}
      variant="solid"
      onClick={submit}
      disabled={disabled}
      marginTop="1rem"
      marginRight="1rem"
    >
      {buttonText}
    </Button>
  );
};

export default CaseValidateButton;
