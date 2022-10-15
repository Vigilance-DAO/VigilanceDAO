import React, { useEffect, useState } from 'react';
import './App.css';
import { CaretRightOutlined } from '@ant-design/icons';
import { Divider, Typography, Button, Input, Statistic, Form, Radio, Card, Alert, Collapse, Space } from 'antd';
import 'antd/dist/antd.css';
import { Web3Provider } from "@ethersproject/providers";
import ReviewForm from './components/ReviewForm';
import AlertMessageType from './interfaces/AlertMessageType';
import History from './components/History';
import {subgraphQuery} from './utils/index';
import {FETCH_REPORTS_BY_DOMAIN} from './queries/index';
import { MetaMask,  } from "@web3-react/metamask"
import { initializeConnector } from '@web3-react/core'


function getLibrary(provider: any) {
  return new Web3Provider(provider);
}


export interface AppContext {
  account: string,
  domain: string
}

declare const chrome: any;

// Web3 
export const [metamaskConnector, hooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))

export const Context = React.createContext<AppContext>({
  account: '',
  domain: ''
});

function App() { 
  const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames} = hooks
  const accounts = useAccounts()
  const [account, setAccount] = useState("")
  const [domain, setDomain] = useState("")
  const [domainRegisteredOn, setDomainRegisteredOn] = useState(0)
  const [domainStatus, setDomainStatus] = useState<AlertMessageType>({
    message: 'Loading...',
    type: 'warning',
    description: ''
  })

  const { Panel } = Collapse
  const getStatus = async (domain: string) => {
    const data = await subgraphQuery(FETCH_REPORTS_BY_DOMAIN(domain));
    console.log(data.isScam);
  }
  useEffect(() => {
    getStatus('https://www.amazon.com');
  }, [])
 
  useEffect(() => {
    console.log('accounts', accounts)
    if(accounts?.length) {
        setAccount(accounts[0])
    } else {
        setAccount("")
    }
  }, [accounts])


  if(chrome && chrome.runtime) {
    chrome.runtime.onMessage.addListener((msg: any, sender: any, sendResponse: any) => {
        // console.log('on message', msg, sender)
        if(msg && msg.type == "domain"){
          setDomain(msg.data.domain)
          setDomainRegisteredOn(msg.data.createdOn)
          setDomainStatus({
            message: msg.data.msg,
            type: msg.data.type,
            description: msg.data.description
          })
        }
    });
}

  return (
    <Context.Provider value={{account, domain}}>

      <div className="App">
        <div className='backdrop'></div>
        <header className="App-header">
          <Typography.Title  className="title" level={1} style={{color: 'white', marginTop: '15px'}}>
            Internet Vigilance
          </Typography.Title>
          <Divider style={{margin: '12px 0 24px', borderTop: '1px solid rgb(255 255 255 / 20%)'}} />

          <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
            <Card style={{ width: '100%', textAlign: 'left' }}>
              <p><b>Domain:</b> {domain}</p>
              <p><b>Registered on: </b>{domainRegisteredOn ? (new Date(domainRegisteredOn)).toLocaleDateString() : 'NA'}</p>
              <Alert message={<b>{domainStatus.message}</b>} 
                    type={domainStatus.type}
                    description={domainStatus.description}
                    showIcon/>
            </Card>
          
            <Collapse
              bordered={true}
              defaultActiveKey={['0']}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              className="site-collapse-custom-collapse"
              style={{ width: '100%' }}
            >
              <Panel header={<div>
                <b style={{fontSize: '15px'}}>Review website</b>
                <p>Earn rewards 💰 by keeping the web safe</p>
              </div>} key="1" className="site-collapse-custom-panel">
                <ReviewForm></ReviewForm>
              </Panel>
            </Collapse>
            {/* <Collapse
              bordered={true}
              defaultActiveKey={['0']}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              className="site-collapse-custom-collapse"
              style={{ width: '100%' }}
            >
              <Panel header={<div>
                <b style={{fontSize: '15px'}}>Your rewards 🏆</b>
              </div>} key="1" className="site-collapse-custom-panel">
                <Statistic title="Active Users" value={112893} style={{color: 'white'}} />
              </Panel>
            </Collapse> */}
            <Collapse
              bordered={true}
              defaultActiveKey={['0']}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              className="site-collapse-custom-collapse"
              style={{ width: '100%' }}
            >
              <Panel header={<div>
                <b style={{fontSize: '15px'}}>My History</b>
              </div>} key="1" className="site-collapse-custom-panel">
                <History></History>
              </Panel>
            </Collapse>
            <Collapse
              bordered={true}
              defaultActiveKey={['0']}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              className="site-collapse-custom-collapse"
              style={{ width: '100%' }}
            >
              <Panel header={<div>
                <b style={{fontSize: '15px'}}>How does it work? 🤔</b>
              </div>} key="1" className="site-collapse-custom-panel">
                
              </Panel>
            </Collapse>

          </Space>
        </header>
      </div>
      </Context.Provider>
  );
}

export default App;
