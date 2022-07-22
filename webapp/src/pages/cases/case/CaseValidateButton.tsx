import React, { useEffect, useState } from 'react';
import { connect } from "@tableland/sdk";
import { FileUploader } from "react-drag-drop-files";
import { Paper, TextField, Grid, Button, Card, Box, Accordion, AccordionSummary, Typography, AccordionDetails, ImageList, ImageListItem, Link } from '@mui/material';
import { create } from "ipfs-http-client";
import { useChain, useMoralis, useMoralisFile, useWeb3ExecuteFunction } from "react-moralis";
import { useLocation } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ethers } from "ethers";
import { CaseInputs } from './Case';
import ReportArtifact from '../../../contracts/ReportDomain.sol/ReportDomain.json';
import Web3Service from 'services/web3Service';

export interface ValidateInput {
    id: number,
    validatorComments: string,
    action: 'ACCEPT' | 'REJECT'
}

const CaseValidateButton = (inputs: ValidateInput) => {
    const {id, validatorComments, action} = inputs;
    const [disabled, setDisabled] = useState(false)
    const [buttonText, setButtonText] = useState<string>(action)
    let timeout: any;
    const { data, error, fetch, isFetching, isLoading } = useWeb3ExecuteFunction({
        abi: ReportArtifact.abi,
        contractAddress: Web3Service.reportContractAddress,
        functionName: 'validate',
        params: {
            reportId: id,
            isAccepted: action == 'ACCEPT',
            comments: validatorComments
        }
    })
    
    async function processTx(data: any, error: any) {
        clearTimeout(timeout)
        if(data) {
            await data.wait()
            setButtonText("Successfully submitted")
        } else if(error) {
            setButtonText(error.data.message)
        }

        timeout = setTimeout(()=>{
            setButtonText(action)
        }, 5000)
        setDisabled(false)
    }

    async function submit() {
        fetch()
    }

    useEffect(()=>{
        if(isFetching || isLoading) {
            setDisabled(true)
            setButtonText('Submitting...')
        } else {
            processTx(data, error)
        }
    })
    return (
        <Button onClick={submit} disabled={disabled} variant='outlined' sx={{marginRight: '10px'}}>{buttonText}</Button>
    );
}

export default CaseValidateButton;
