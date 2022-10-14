import React, { useEffect, useState } from 'react';
import './Cases.css';
import { Paper, TextField, Grid, Button, CircularProgress, Select, MenuItem } from '@mui/material';
import Case, { CaseInputs } from './case/Case';
import { SelectChangeEvent } from '@mui/material';
import { FETCH_OPEN_REPORTS,FETCH_REPORTS} from '../../queries/index';
import { subgraphQuery } from '../../utils/index';
import {ethers} from "ethers";

interface CaseInputsTable extends Omit<CaseInputs, 'evidences'> {
    evidences: string
}

function Cases(props: any) {
    const [cases, setCases] = useState<CaseInputsTable[]>([])
    const [filterStatus, setFilterStatus] = useState<string>('OPEN')

    async function fetchCases() {
        let data;
        if(filterStatus === 'OPEN'){
            data  = await subgraphQuery(FETCH_OPEN_REPORTS());
        }
        else{
            data  = await subgraphQuery(FETCH_REPORTS(filterStatus));
        }
        let _cases: CaseInputsTable[] = []
        let rows: any[] =  data.reports || []
        for(let i=0; i<rows.length; ++i) {
            let row = rows[i]
            _cases.push(row)
        }
        setCases(_cases)
    }
    console.log(cases)

    useEffect(()=>{
        fetchCases()
    }, [filterStatus])

    // console.log(typeof filterStatus)

    function loadCases() {
        let rows: any[] = []
        for(let i=0; i<cases.length; ++i) {
            let _case = cases[i]
            console.log(_case)
            let _evidences = (_case.evidences as string).split(',')
            console.log(typeof _case.id)
            rows.push(<Case domain={_case.domain} isScam={_case.isScam} id={ethers.BigNumber.from(_case.id).toNumber()} stakeAmount={_case.stakeAmount} evidences={_evidences} comments={_case.comments} status={_case.status}></Case>)
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
                    {/* {!isWeb3Enabled && "Please connect metamask to load"}
                    {isWeb3Enabled && (isFetching || isLoading) && <CircularProgress />}
                    {cases.length!=0 && !isFetching && !isLoading &&
                        loadCases()
                    }
                    {!cases.length && !isFetching && !isLoading && "No cases."} */}
                    {loadCases()}
                </Paper>
            </Grid>
        </div>
    );
}

export default Cases;
