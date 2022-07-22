import React, { useEffect, useState } from 'react';
import './Cases.css';
import { connect, ChainName, Connection } from "@tableland/sdk";
import { FileUploader } from "react-drag-drop-files";
import { Paper, TextField, Grid, Button, CircularProgress, Select, MenuItem } from '@mui/material';
import { create } from "ipfs-http-client";
import { useChain, useMoralis, useMoralisFile, useWeb3ExecuteFunction } from "react-moralis";
import { useLocation } from "react-router-dom";
import Case, { CaseInputs } from './case/Case';
import ReportArtifact from '../../contracts/ReportDomain.sol/ReportDomain.json';
import Web3Service from 'services/web3Service';
import { SelectChangeEvent } from '@mui/material';

interface CaseInputsTable extends Omit<CaseInputs, 'evidenceHashes'> {
    evidenceHashes: string
}

function Cases(props: any) {
    console.log('props', props, process.env)
    const { error, isUploading, moralisFile, saveFile } = useMoralisFile();
    const { initialize, isInitialized, isAuthenticated, isWeb3Enabled} = useMoralis();
    const { account } = useChain();
    
    const [tableName, setTableName] = useState('')
    const [tablelandConnection, setTablelandConnection] = useState<Connection | null>(null);
    const [cases, setCases] = useState<CaseInputsTable[]>([])
    const [filterStatus, setFilterStatus] = useState<string>('OPEN')

    const { fetch: fetchTableName, isFetching, isLoading } = useWeb3ExecuteFunction({
        abi: ReportArtifact.abi,
        contractAddress: Web3Service.reportContractAddress,
        functionName: 'metadataTable'
    })

    useEffect(()=>{
        let chain: ChainName = (process.env.REACT_APP_TABLELAND_CHAIN as ChainName) || "polygon-mumbai"
        if(isWeb3Enabled)
            fetchTableName({
                onSuccess: async (result: any) => {
                    console.log('tableland table', result.toString())
                    setTableName(result.toString())
                    try {
                        let _tablelandConnection = await connect({ network: "testnet", chain });
                        console.log('tablelandConnection', _tablelandConnection)
                        setTablelandConnection(_tablelandConnection)
                    } catch(err) {
                        console.warn('error connecting tableland', err)
                    }
                },
                onError: (error: any) => {
                    console.log('fetch tableland table error', error)
                }
            })
    }, [isWeb3Enabled])

    function searchColumnIndex(columns: any[], column: string) {
        return columns.findIndex((item, i)=>{
            return item.name == column
        })
    }

    async function fetchCases() {
        const query = await tablelandConnection?.read(`SELECT * FROM ${tableName} WHERE status='${filterStatus}'`);
        console.log('fetchCases', query);
        let _cases: CaseInputsTable[] = []
        let rows: any[] = query?.rows || []
        for(let i=0; i<rows.length; ++i) {
            let row = rows[i]
            _cases.push({
                id: row[searchColumnIndex(query?.columns || [], 'id')],
                domain: row[searchColumnIndex(query?.columns || [], 'domain')],
                comments: row[searchColumnIndex(query?.columns || [], 'comments')],
                evidenceHashes: row[searchColumnIndex(query?.columns || [], 'evidences')],
                isScam: row[searchColumnIndex(query?.columns || [], 'isScam')],
                stake: row[searchColumnIndex(query?.columns || [], 'stake')],
                status: row[searchColumnIndex(query?.columns || [], 'status')]
                
            })
        }
        setCases(_cases)
    }

    useEffect(()=>{
        console.log('tableName', tableName, tablelandConnection)
        if(tableName && tablelandConnection) {
            fetchCases()
        }
    }, [tableName, tablelandConnection, filterStatus])

    function loadCases() {
        let rows: any[] = []
        for(let i=0; i<cases.length; ++i) {
            let _case = cases[i]
            console.log(_case)
            let _evidences = (_case.evidenceHashes as string).split(',')
            rows.push(<Case domain={_case.domain} isScam={_case.isScam} id={_case.id} stake={_case.stake} evidenceHashes={_evidences} comments={_case.comments} status={_case.status}></Case>)
        }
        return rows;
    }
    return (
        <div className="cases">
            <Grid container md={3} key={'1'} sx={{float: 'left'}}>.</Grid>
            <Grid container md={6} key={'2'} sx={{float: 'left'}}>
                <Paper sx={{padding: '20px', backgroundColor: '#f7f7f7', width: '100%', border: '1px solid #ebebeb'}}>
                    <h1>Reported Domains</h1>
                    <p>Only Governance members can validate</p>
                    <div style={{width: '100%', marginBottom: '10px'}}>
                        Filter Status: <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={filterStatus}
                            label="Fetch Status"
                            onChange={(event: SelectChangeEvent) => {
                                setFilterStatus(event.target.value as string);
                            }}
                        >
                            <MenuItem value={'OPEN'}>OPEN</MenuItem>
                            <MenuItem value={'ACCEPTED'}>ACCEPTED</MenuItem>
                            <MenuItem value={'REJECTED'}>REJECTED</MenuItem>
                        </Select>
                    </div>
                    {!isWeb3Enabled && "Please connect metamask to load"}
                    {isWeb3Enabled && (isFetching || isLoading) && <CircularProgress />}
                    {cases.length!=0 && !isFetching && !isLoading &&
                        loadCases()
                    }
                    {!cases.length && !isFetching && !isLoading && "No cases."}
                    
                </Paper>
            </Grid>
        </div>
    );
}

export default Cases;
