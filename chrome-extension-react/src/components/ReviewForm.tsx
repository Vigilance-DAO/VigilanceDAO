import { Divider, Typography, Button, Tooltip, Input, Statistic, Form, Radio, Card, Alert, Collapse, Space } from 'antd';
import { UploadFile } from 'antd/es/upload';
import React, { useContext, useEffect, useState } from 'react';
import Evidence from './Evidence';
import NetworkSelector from './Network';
import type { RadioChangeEvent } from 'antd';
import { ethers } from 'ethers';
import AlertMessageType from '../interfaces/AlertMessageType';
import { Web3Storage } from "web3.storage";

import { abi , address } from '../constants/index'
import { Context, hooks, metamaskConnector } from '../App';



export default function ReviewForm() {
    const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames} = hooks
    const { account, domain } = useContext(Context);
    const chainId = useChainId()
    const accounts = useAccounts()
    const isActivating = useIsActivating()
    const provider = useProvider()

    const isActive = useIsActive()
    
    const [domainStatus, setDomainStatus] = useState<AlertMessageType>({
        message: '',
        type: 'info',
        description: ''
    })
    
    const [isFraud, setIsFraud] = useState(true);
    const [buttonTxt, setButtonTxt] = useState("Connect Wallet")
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    
    const [comments, setComments] = useState<string>();
    const web3storage_key = process.env.REACT_APP_WEB3_STORAGE_KEY;
    
    useEffect(() => {
        console.log('account', account)
        if(account) {
            setButtonTxt("Report")
        } else {
        }
    }, [account])
    
    const { TextArea } = Input;
    
    const onFraudChange = (e: RadioChangeEvent) => {
        console.log('radio checked', e.target.value);
        setIsFraud(e.target.value);
    };

    const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComments(e.target.value);
    }

    const uploadToIPFS = async () => {
        const client = new Web3Storage({ token: web3storage_key === undefined ? "" : web3storage_key });
        let imageUrls : string[] = []
        for(let i = 0; i < fileList.length; i++) {
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
            const signer = provider?.getSigner();
            const imageUrls = await uploadToIPFS();
            console.log(imageUrls)
            const contract = new ethers.Contract(address, abi, signer);
            const tx = await contract.report("https://www.amazon.com",isFraud, imageUrls,comments,{value : ethers.utils.parseEther("0.5")});
            await tx.wait();
            console.log(tx)
        }
        catch(e) {
            alert(e)
        }
    }
    


    useEffect(() => {
        if(isActivating) {
            setButtonTxt("Connecting...")
            setButtonDisabled(true)
        } else {
            setButtonDisabled(false)
        }

    }, [isActivating])

    useEffect(() => {
        if(!isActive) {
            setButtonTxt("Connect Wallet")
        }
    })

    async function handleButtonClick() {
        if(!isActive) {
            metamaskConnector.activate(chainId)
        }
        else{
            
            reportDomain()
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
                        <td style={{float: 'right'}}>
                            <NetworkSelector/>
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
                    {isActive ? 
                        <Tooltip 
                            title="This is required to create a report. If deemed correct, you get your stake back along with additional rewards. If incorrect, entire stake is slashed."
                            style={{cursor: 'pointer'}}
                        >
                            <Button 
                                disabled={true}
                                style={{background: 'white', color: 'black', cursor: 'pointer !important'}}
                            >
                                <b style={{paddingRight: '5px'}}>STAKE:</b> 5 MATIC
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
                {domainStatus.message ? <Alert message={domainStatus.message} 
                    type={domainStatus.type}
                    description={domainStatus.description}
                    showIcon
                    style={{marginTop: '10px'}}/> : <></>}
            </Form>
        </div>
    )
}