import { Divider, Typography, Button, Tooltip, Input, Statistic, Form, Radio, Card, Alert, Collapse, Space } from 'antd';
import { UploadFile } from 'antd/es/upload';
import React, { useEffect, useState } from 'react';
import Evidence from './Evidence';
import NetworkSelector from './Network';
import type { RadioChangeEvent } from 'antd';
import { MetaMask,  } from "@web3-react/metamask"
import { initializeConnector } from '@web3-react/core'

import AlertMessageType from '../interfaces/AlertMessageType';


export interface ReviewFormContext {
    account: string
}

// Web3 
export const [metamaskConnector, hooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))

export const Context = React.createContext<ReviewFormContext>({
    account: ''
});

export default function ReviewForm() {
    const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks
    const chainId = useChainId()
    const accounts = useAccounts()
    const isActivating = useIsActivating()

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

    
    const { TextArea } = Input;
    
    const onFraudChange = (e: RadioChangeEvent) => {
        console.log('radio checked', e.target.value);
        setIsFraud(e.target.value);
    };

    const [account, setAccount] = useState("")
    
    useEffect(() => {
        console.log('accounts', accounts)
        if(accounts?.length) {
            setAccount(accounts[0])
            setButtonTxt(">")
        } else {
            setAccount("")
        }
    }, [accounts])

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

    function handleButtonClick() {
        if(!isActive) {
            metamaskConnector.activate(chainId)
        }
    }

    return (
        <Context.Provider value={{account}}>
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
                        <TextArea rows={2}/>
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
        </Context.Provider>
    )
}