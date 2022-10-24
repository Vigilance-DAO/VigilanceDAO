import { Divider, Typography, Button, Tooltip, Input, Statistic, Form, Radio, Card, Alert, Collapse, Space } from 'antd';
import { UploadFile } from 'antd/es/upload';
import React, { useContext, useEffect, useState } from 'react';
import Evidence from './Evidence';
import NetworkSelector from './Network';
import type { RadioChangeEvent } from 'antd';
import { ethers } from 'ethers';
import AlertMessageType from '../interfaces/AlertMessageType';
import { Web3Storage } from "web3.storage";
// const createMetaMaskProvider = require('metamask-extension-provider');

import { abi , address } from '../constants/index'
import { Context, hooks, metamaskConnector } from '../App';
import { chainInfo } from '../services/web3.hook';


declare const window: any;
declare const chrome: any;

export default function ReviewForm() {
    const { web3Hooks } = useContext(Context);
    const { connectWallet, submitReport, getStakeAmount, stakeETH, account, chainId, reportTxInfo } = web3Hooks

    const [isFraud, setIsFraud] = useState(true);
    const [buttonTxt, setButtonTxt] = useState("Connect Wallet")
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    
    const [comments, setComments] = useState<string>("");
    const web3storage_key = process.env.REACT_APP_WEB3_STORAGE_KEY;
    
    const [txMessage, setTxMessage] = useState<AlertMessageType>({
        message: '',
        type: 'info',
        description: ''
    })

    const { TextArea } = Input;
    
    const onFraudChange = (e: RadioChangeEvent) => {
        console.log('radio checked', e.target.value);
        setIsFraud(e.target.value);
    };

    const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComments(e.target.value);
    }
    
    const uploadToIPFS = async () => {
        setButtonDisabled(true)
        setButtonTxt("Uploading...")
        const client = new Web3Storage({ token: web3storage_key === undefined ? "" : web3storage_key });
        let imageUrls : string[] = []
        for(let i = 0; i < fileList.length; i++) {
            console.log('file', i, fileList[i])
            const file = fileList[i].originFileObj;
            if(file !== undefined) {
                const cid = await client.put([file]);
                const img_url = ("https://gateway.pinata.cloud/ipfs/"+cid+"/"+file.name);
                if(!imageUrls.includes(img_url)) {
                    imageUrls.push(img_url)
                }
            }
        }
        return imageUrls;
    }
    
    const reportDomain = async () => {
        try {
            setButtonDisabled(true)
            const imageUrls = await uploadToIPFS();
            console.log(imageUrls)
            submitReport(isFraud, imageUrls, comments, stakeETH.stakeETH) 
        } catch(e) {
            alert(e)
        }
    }
    
    useEffect(() => {
        console.log('connectingWallet triggered', account, stakeETH, account, stakeETH)
        if(account.loading) {
            setButtonTxt("Connecting...")
            setButtonDisabled(true)
        } else if(stakeETH.loading){
            setButtonTxt('loading...')
            setButtonDisabled(true)
        } else {
            setButtonDisabled(false)
            if(account.account && stakeETH.stakeETH == 0) {
                setButtonTxt('loading...')
                setButtonDisabled(true)
                getStakeAmount()
            } else if(account.account && stakeETH.stakeETH != 0) {
                setButtonTxt("Report")
                setButtonDisabled(false)
            }
        }

    }, [account, stakeETH])

    useEffect(() => {
        console.log('reportTxInfo', reportTxInfo)
        if(reportTxInfo.loading) {
            setButtonTxt("Submitting...")
            setButtonDisabled(true)
        } else if(account.account) {
            setButtonDisabled(false)
            setButtonTxt("Report")
        }
        function getSuccessMessage(txHash: string) {
            let network = chainInfo.find(item => item.chainId == chainId.chainId)
            let url = `${network?.explorer}/tx/${txHash}`
            return <p>Successful <a href={url}>transaction</a></p>
        }
        
        setTxMessage({
            type: reportTxInfo.isSuccess ? 'success' : 'error',
            message: reportTxInfo.isSuccess ? getSuccessMessage(reportTxInfo.txHash) : (reportTxInfo.error || ''),
            description: ''
        })
    }, [reportTxInfo])

    async function handleButtonClick() {
        if(!account.account) {
            connectWallet()
        } else if(buttonTxt == 'Report') {
            reportDomain()
        } else {
            alert(`Setting not available: ${buttonTxt}`)
        }
    }


    return (
        <div>
            <Form
                layout='vertical'
                name="reviewDomain"
                initialValues={{ remember: true }}
                // onFinish={onFinish}
                // onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <table style={{width: '100%'}}>
                <tbody>
                    <tr>
                        <td>
                            <Form.Item
                            label={<b>Is Fraud</b>}
                            name="isFraud"
                            rules={[{ required: true }]}
                            >
                                <Radio.Group onChange={onFraudChange} value={isFraud}>
                                    <Radio value={true}>Yes</Radio>
                                    <Radio value={false}>No</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </td>
                    </tr>
                </tbody>
                </table>

                <Form.Item
                label={<b>Justification for above selection</b>}
                name="remarks"
                rules={[{ required: true }]}
                >
                    <TextArea rows={2} id="remarks"  value={comments} onChange={handleCommentsChange}/>
                </Form.Item>
                
                <Evidence fileList={fileList} setFileList={setFileList}></Evidence>
                <div style={{display: 'flex'}}>
                    {account.account ? 
                        <Tooltip 
                            title="This is required to create a report. If deemed correct, you get your stake back along with additional rewards. If incorrect, entire stake is slashed."
                            style={{cursor: 'pointer'}}
                        >
                            <Button 
                                disabled={true}
                                style={{background: 'white', color: 'black', cursor: 'pointer !important'}}
                            >
                                <b style={{paddingRight: '5px'}}>STAKE:</b> {stakeETH.stakeETH} MATIC
                            </Button>
                        </Tooltip>
                        : <></>
                    }
                    <Button 
                        type="primary" 
                        onClick={handleButtonClick}
                        disabled={buttonDisabled}
                    >{buttonTxt}</Button>
                </div>
                {txMessage.message ? <Alert message={txMessage.message} 
                    type={txMessage.type}
                    description={txMessage.description}
                    showIcon
                    style={{marginTop: '10px'}}/> : <></>}
            </Form>
        </div>
    )
}