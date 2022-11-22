import React, { useEffect, useState } from 'react';
import './Cases.css';
import { Paper, TextField, Grid, Button, CircularProgress, Select, MenuItem , Typography} from '@mui/material';
import Case, { CaseInputs } from './case/Case';
import { SelectChangeEvent } from '@mui/material';
import { FETCH_OPEN_REPORTS,FETCH_REPORTS} from '../../queries/index';
import { subgraphQuery } from '../../utils/index';
import {ethers} from "ethers";
import {useSigner,useAccount} from 'wagmi'
import { governanceBadgeAbi, governanceBadgeAddress } from '../../constants/index';
import { ValidatorInfo } from '@solana/web3.js';
interface CaseInputsTable extends Omit<CaseInputs, 'evidences'> {
    evidences: string
}

function Cases(props: any) {
    const [cases, setCases] = useState<CaseInputsTable[]>([])
    const [filterStatus, setFilterStatus] = useState<string>('OPEN')
    const {address,isConnected} = useAccount()
    const { data: signer, isError, isLoading } = useSigner()
    const [ validator,setValidator] = useState<boolean>(false)
    const [ validationRequest , setValidationRequest] = useState<boolean>(false)
    const [stake,setStake] = useState<string>("0")

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

    async function checkValidator() {
        try{
            const governanceBadgeContract = new ethers.Contract(governanceBadgeAddress, governanceBadgeAbi, signer as ethers.Signer);
            const bal = await governanceBadgeContract.balanceOf(address,1);
            console.log('bal', ethers.BigNumber.from(bal).toNumber())
            if(ethers.BigNumber.from(bal).toNumber() > 0){
                setValidator(true)
            }
            else{
                const requests = await governanceBadgeContract.validationRequests(address);
                if(!requests.isZero()){
                    setValidationRequest(true)
                }
            }
        }
        catch(e){
            alert(e)
        }
    }

    async function getStake(){
        try{
            const governanceBadgeContract = new ethers.Contract(governanceBadgeAddress, governanceBadgeAbi, signer as ethers.Signer);
            const stakeAmount = await governanceBadgeContract.stakingAmount();
            setStake((ethers.utils.formatEther(stakeAmount)).toString())
        }
        catch(e){
            alert(e)
        }
    }

    async function requestValidatorRole() {
        try{
            const governanceBadgeContract = new ethers.Contract(governanceBadgeAddress, governanceBadgeAbi, signer as ethers.Signer);
            const stakeAmount = await governanceBadgeContract.stakingAmount();
            const tx = await governanceBadgeContract.requestValidatorRole({value: stakeAmount});
            await tx.wait()
            setValidationRequest(true)
        }
        catch(e){
            alert(e)
        }
    }

    async function revokeRequest() {
        try{
            const governanceBadgeContract = new ethers.Contract(governanceBadgeAddress, governanceBadgeAbi, signer as ethers.Signer);
            const tx = await governanceBadgeContract.revokeValidationRequest();
            await tx.wait()
            setValidationRequest(false)
        }
        catch(e){
            alert(e)
        }
    }


        
    

    useEffect(()=>{
        fetchCases()
    }, [filterStatus])

    useEffect(()=>{
        if(isConnected && signer){
            checkValidator()
            getStake()
        }
    }, [isConnected,signer])


    console.log(validator,address)

    function loadCases() {
        let rows: any[] = []
        if(cases.length)
            for(let i=0; i<cases.length; ++i) {
                let _case = cases[i]
                let _evidences = (_case.evidences as string).split(',')
                rows.push(<Grid item xs={12} md={6} lg={4} key={i} sx={{float: 'left', padding: '10px'}}>
                    <Case domain={_case.domain} isScam={_case.isScam} id={ethers.BigNumber.from(_case.id).toNumber()} stakeAmount={_case.stakeAmount} evidences={_evidences} comments={_case.comments} status={_case.status} validator={validator}></Case>
                </Grid>)
            }
        return rows;
    }
    return (
        <div className="cases">
            <Grid container md={1} key={'1'} sx={{float: 'left'}}>.</Grid>
            <Grid container md={10} key={'2'} sx={{float: 'left'}}>
                <Paper sx={{padding: '20px', backgroundColor: '#f7f7f7', width: '100%', border: '1px solid #ebebeb'}} elevation={0}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div>
                            <h1>Reported Domains</h1>
                            <p>Only Validators can validate</p>
                        </div>
                        {
                            isConnected && !validator && 
                            <div style={{}}>
                                {
                                    !validationRequest ?<Button variant="outlined" onClick={requestValidatorRole}>Request Validator Role</Button> : <Button onClick={revokeRequest} variant="outlined">Revoke Request</Button>
                                }
                                <Typography sx={{textAlign: 'right', marginTop: '5px'}} variant='body2'><b>Stake:</b> {stake} MATIC</Typography>

                            </div>
                        }
                        
                        
                    </div>
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
