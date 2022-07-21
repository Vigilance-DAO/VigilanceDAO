import React, { useEffect, useState } from 'react';
import { connect } from "@tableland/sdk";
import { FileUploader } from "react-drag-drop-files";
import { Paper, TextField, Grid, Button, Card, Box, Accordion, AccordionSummary, Typography, AccordionDetails } from '@mui/material';
import { create } from "ipfs-http-client";
import { useChain, useMoralis, useMoralisFile } from "react-moralis";
import { useLocation } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function Case(props: any) {
    console.log('props', props, process.env)
    const { error, isUploading, moralisFile, saveFile } = useMoralisFile();
    const { initialize, isInitialized, isAuthenticated } = useMoralis();
    const { account } = useChain();
    
    return (
        <div>
            <Card sx={{ display: 'flex' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
                    <Typography>Domain: google.com</Typography>
                    <Typography><p>Claim: Scam</p></Typography>
                    <Typography>
                        Comments: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                        malesuada lacus ex, sit amet blandit leo lobortis eget.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Button>Accept</Button>
                    <Button>Reject</Button>
                </Box>
            </Card>
            <Accordion>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                >
                <Typography>Evidences</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                        malesuada lacus ex, sit amet blandit leo lobortis eget.
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}

export default Case;
