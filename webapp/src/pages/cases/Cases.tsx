import React, { useEffect, useState } from 'react';
import './Report.css';
import { connect } from "@tableland/sdk";
import { FileUploader } from "react-drag-drop-files";
import { Paper, TextField, Grid, Button } from '@mui/material';
import { create } from "ipfs-http-client";
import { useChain, useMoralis, useMoralisFile } from "react-moralis";
import { useLocation } from "react-router-dom";
import Case from './case/Case';

function Cases(props: any) {
    console.log('props', props, process.env)
    const { error, isUploading, moralisFile, saveFile } = useMoralisFile();
    const { initialize, isInitialized, isAuthenticated } = useMoralis();
    const { account } = useChain();
    
    return (
        <div className="cases">
            <Grid container md={3} key={'1'} sx={{float: 'left'}}>.</Grid>
            <Grid container md={6} key={'2'} sx={{float: 'left'}}>
                <Paper sx={{padding: '20px', backgroundColor: '#f7f7f7', width: '100%', border: '1px solid #ebebeb'}}>
                    <h1>Reported Domains</h1>
                    <p>Only Governance members can validate</p>
                    <Case></Case>
                </Paper>
            </Grid>
        </div>
    );
}

export default Cases;
