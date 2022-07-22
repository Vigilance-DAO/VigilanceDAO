import { Alert, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useChain, useMoralis, useMoralisFile, useWeb3ExecuteFunction } from "react-moralis";
import Web3Service from "services/web3Service";
import ReportArtifact from '../../contracts/ReportDomain.sol/ReportDomain.json';
import { ethers } from "ethers";

interface ReportInputs {
    domain: string,
    isScam: boolean,
    comments: string,
    files: any[]
}

const ReportSubmit = (inputs: ReportInputs) => {
    let {domain, files, isScam, comments} = inputs;
    const { initialize, isInitialized, isAuthenticated, isWeb3Enabled, enableWeb3 } = useMoralis();
    const { error: ipfsError, isUploading, moralisFile, saveFile } = useMoralisFile();
    const { account, chainId, switchNetwork } = useChain();
    let timeout: any;
    const validateInput = async () => {
        let isError = false
        if(!isAuthenticated) {
            alert('Please connect metamask before submitting')
            isError = true;
        }
        if(!stakeAmount) {
            alert('Could not load required staking amount value. Please refresh, connect metamask and try again.')
            isError = true;
        }
        if(!files.length) {
            alert('Upload at least one evidence file')   
            isError = true;
        }

        if(!isInitialized) {
            await initialize()
        }
        // if(!isWeb3Enabled)
        //     await enableWeb3()
        // if(chainId!=process.env.REACT_APP_CHAIN_ID) {
        //     await switchNetwork(process.env.REACT_APP_CHAIN_ID || '0x89')
        // }
        return isError
    }

    const [evidenceHashes, setEvidenceHashes] = useState<any[]>([])
    const [submitBtnTxt, setSubmitBtnTxt] = useState('Submit')
    const [submitDisabled, setSubmitDisabled] = useState(false)
    const [message, setMessage] = useState("")
    const [stakeAmount, setStakeAmount] = useState("")

    useEffect(()=>{
        if(isUploading) {
            setSubmitBtnTxt('uploading')
            setSubmitDisabled(true)
        } else {
            setSubmitBtnTxt('Submit')
            setSubmitDisabled(false)
        }
    }, [isUploading])

    useEffect(() => {
        if(ipfsError) {
            console.warn(ipfsError)
            alert('Error uploading document to IPFS. Check logs.')
        }
    }, [ipfsError])
    
    const getEvidenceHashes = async () => {
        let hashes: string[] = []
        for(let i=0; i<files.length; ++i) {
            const file: any = await saveFile(files[0].name, files[0], {
                type: files[0].type,
                metadata: {'createdBy': account || 'na'},
                tags: {},
                saveIPFS: true,
            });
            console.log('saved filed', i, file)
            hashes.push(file._hash)
        }
        return hashes;
    }

    const { fetch: fetchStakingAmount, isFetching: isFetching2, isLoading: isLoading2 } = useWeb3ExecuteFunction({
        abi: ReportArtifact.abi,
        contractAddress: Web3Service.reportContractAddress,
        functionName: 'stakingAmount'
    })

    useEffect(()=>{
        if(isWeb3Enabled)
            fetchStakingAmount({
                onSuccess: (result: any) => {
                    console.log('staking amount', result.toString())
                    setStakeAmount(result.toString())
                },
                onError: (error) => {
                    console.log('fetching staking amount', error)
                }
            })
    }, [isWeb3Enabled])

    useEffect(()=>{
        console.log({isFetching2, isLoading2, contract: Web3Service.reportContractAddress})
        if(isFetching2 || isLoading2) {
            setSubmitBtnTxt('Loading')
            setSubmitDisabled(true)
        } else {
            setSubmitBtnTxt('Submit')
            setSubmitDisabled(false)
        }
    }, [isFetching2, isLoading2])

    const { data, error, fetch, isFetching, isLoading } = useWeb3ExecuteFunction({
        abi: ReportArtifact.abi,
        contractAddress: Web3Service.reportContractAddress,
        functionName: 'report',
        params: {
            domain,
            isScam,
            evidenceHashes,
            comments
        }, 
        msgValue: stakeAmount
    })

    useEffect(()=>{
        console.log({data, error, isFetching, isLoading, contract: Web3Service.reportContractAddress})
        if(isFetching || isLoading) {
            setSubmitBtnTxt('Submitting transaction')
            setSubmitDisabled(true)
        } else {
            processTx(data, error)
        }
    }, [data, error, isFetching, isLoading])

    async function processTx(data: any, error: any) {
        clearTimeout(timeout)
        setMessage("")
        if(data) {
            await data.wait()
            setMessage("Successfully submitted")
        } else if(error) {
            setMessage(error.data.message)
        }

        timeout = setTimeout(()=>{
            setMessage("")
        }, 5000)
        setSubmitBtnTxt('Submit')
        setSubmitDisabled(false)
    }

    const submit = async () => {
        try {
            setEvidenceHashes([])
            let isError = await validateInput();
            if(isError)
                return;
            let _evidenceHashes = await getEvidenceHashes();
            setEvidenceHashes(_evidenceHashes)
            let count = 0
            let interval = setInterval(()=> {
                if(evidenceHashes.length) {
                    clearInterval(interval)
                    fetch()
                    return;
                }
                count += 1;
                if(count > 20) {
                    clearInterval(interval)
                }
                console.log('waiting')
            }, 500)
        } catch (error: any) {
            console.log(error.message);
        }
    }

    function getFormatedAmount() {
        return (ethers.utils.formatEther(stakeAmount)).toString()
    }
    return <div>
        <p>Required Staking: {stakeAmount ? getFormatedAmount() : 'loading'} MATIC </p>
        <Button
            variant="contained" 
            sx={{marginTop: '10px'}} 
            disabled={submitDisabled}
            onClick={submit}>{submitBtnTxt}
        </Button>
        {message && <Alert severity="info">{message}</Alert>}
    </div>
}

export default ReportSubmit;