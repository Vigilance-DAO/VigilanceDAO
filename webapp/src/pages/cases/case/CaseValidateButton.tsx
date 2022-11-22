import React, { useEffect, useState } from 'react';
import ReportArtifact from '../../../contracts/ReportDomain.sol/ReportDomain.json';
import {Button} from '@mui/material';
import {abi,address} from "../../../constants/index"
import { ethers } from 'ethers';
import { useContract, useSigner } from 'wagmi'

export interface ValidateInput {
    id: number,
    validatorComments: string,
    action: 'ACCEPT' | 'REJECT'
}

const CaseValidateButton = (inputs: ValidateInput) => {
    const {id, validatorComments, action} = inputs;
    const [disabled, setDisabled] = useState(false)
    const { data: signer, isError, isLoading } = useSigner()
    const [buttonText, setButtonText] = useState<string>(action)
    let timeout: any;
    const submit = async () => {
        try{
            setDisabled(true)
            setButtonText('Validating...')
            const contract = new ethers.Contract(address, abi, signer || undefined);
            console.log(contract)
            if(action == 'ACCEPT'){
                const tx = await contract.validate(id,true, validatorComments)
                await tx.wait(); 
            }
            else{
                const tx = await contract.validate(id,false, validatorComments)
                await tx.wait(); 
            }
        }
        catch(e){
            console.log(e);
            setDisabled(false)
            setButtonText(action)
        }

    }
    return (
        <Button color={action == 'ACCEPT' ? "success" : "error"} onClick={submit} disabled={disabled} sx={{marginRight: '10px'}}>{buttonText}</Button>
    );
}

export default CaseValidateButton;
