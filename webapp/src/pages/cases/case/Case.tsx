import React, { useEffect, useState } from 'react';
import { connect } from "@tableland/sdk";
import { FileUploader } from "react-drag-drop-files";
import { Paper, TextField, Grid, Button, Card, Box, Accordion, AccordionSummary, Typography, AccordionDetails, ImageList, ImageListItem, Link } from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ethers } from "ethers";
import CaseValidateButton from './CaseValidateButton';
import { useAccount } from 'wagmi';
export interface CaseInputs {
    id: number,
    domain: string,
    isScam: boolean,
    stakeAmount: string,
    evidences: string[],
    comments: string,
    status: string
}

const Case = (inputs: CaseInputs) => {
    const {id, domain, isScam, stakeAmount, evidences, comments, status} = inputs;
    const [validatorComments, setValidatorComments] = useState('')
    const { address, isConnected } = useAccount()

    // const evidences: string[] = ['QmeHnVNb8XFggiX3Bs1GjPAZZfQET81bacX5i5KSmGLfSA']

    function getFormatedAmount() {
        return (ethers.utils.formatEther(stakeAmount)).toString()
    }
    console.log(typeof id)

    return (
        <div>
            <Card sx={{ padding: '10px', marginBottom: '10px' }}>
                <Typography><b>ID:</b> #{id} | <b>Domain:</b> {domain} | <b>Claim:</b> {isScam ? 'Scam' : 'Legit'} | <b>Stake:</b> {getFormatedAmount()} MATIC</Typography>
                <Typography><b>Status:</b> {status}</Typography>
                <Typography>
                    <b>Comments:</b> {comments}
                </Typography>
                <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                    <Typography>Evidences</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <ImageList sx={{ width: '100%' }} cols={3} rowHeight={164}>
                        {evidences.map((item) => (
                            <Link href={item} target="_blank" underline="hover">
                                <ImageListItem key={item}>
                                    <img
                                        src={item}
                                        srcSet={item}
                                        
                                        loading="lazy"
                                    />
                            </ImageListItem>
                            </Link>
                        ))}
                    </ImageList>
                    </AccordionDetails>
                </Accordion>
                
                {status==null && <div><TextField
                    id="outlined-multiline-static"
                    label="Validator Comments"
                    multiline
                    rows={2}
                    defaultValue=""
                    value={validatorComments}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setValidatorComments(event.target.value);
                    }}
                    sx={{width: '100%', marginTop: '10px'}}
                />
                {
                    isConnected ? <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '10px' }}>
                    <CaseValidateButton id={id} validatorComments={validatorComments} action={'ACCEPT'}></CaseValidateButton>
                    <CaseValidateButton id={id} validatorComments={validatorComments} action={'REJECT'}></CaseValidateButton>
                    </Box>
                    :
                    <Typography sx={{marginTop: '10px'}}>Please connect your wallet to validate this case</Typography>
                }
                </div>
                }
                
            </Card>
        </div>
    );
}

export default Case;
