/*global chrome*/
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
import NetworkSelector from './components/Network';
// import Web3Service from './services/web3.service';
import { Web3Hook } from './services/web3.hook';
import { DomainHistory } from './components/DomainHistory';


function getLibrary(provider: any) {
  return new Web3Provider(provider);
}


export interface AppContext {
  web3Hooks: ReturnType<typeof Web3Hook>
}


// Web3 
export const [metamaskConnector, hooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))

export const Context = React.createContext<AppContext>({
  web3Hooks: {
    account: {account: '', loading: false},
    chainId: {chainId: 0, loading: false},
    reportTxInfo: {isSuccess: false, error: null, txHash: '', loading: false},
    stakeETH: {stakeETH: 0, loading: false},
    domainInfo: {
      domain: '',
      registeredOn: 0,
      status: {
          message: 'Loading...',
          type: 'warning',
          description: ''
      },
      loading: true
    },

    switchNetwork: () => {},
    connectWallet: () => {},
    getStakeAmount: () => {},
    submitReport: () => {},
    activateListeners: () => {}
  }
});

function App() { 
  // const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames} = hooks
  // const accounts = useAccounts()
  // const isActive = useIsActive()
  const _web3hook = Web3Hook()
  const { activateListeners, account: _account, chainId: _chainId, domainInfo, connectWallet } = _web3hook
  useEffect(() => { activateListeners() })

  const { Panel } = Collapse
  const getStatus = async (domain: string) => {
    const data = await subgraphQuery(FETCH_REPORTS_BY_DOMAIN(domain));
    console.log('getStatus', data.isScam);
  }

  useEffect(() => {
    if(domainInfo.domain) {
      getStatus(domainInfo.domain);
    }
  }, [domainInfo])

  return (
    <Context.Provider value={{ web3Hooks: _web3hook }}>

      <div className="App">
        <div className='backdrop'></div>
        <header className="App-header">
          <Typography.Title  className="title" level={1} style={{color: 'white', marginTop: '15px', marginBottom: '5px'}}>
            Internet Vigilance
          </Typography.Title>
          <Typography.Paragraph style={{color: 'white', fontSize: '12px', textAlign: 'center'}}>Powered by Blockchain</Typography.Paragraph>
          <Divider style={{margin: '12px 0 24px', borderTop: '1px solid rgb(255 255 255 / 20%)'}} />

          <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
            <Card style={{ width: '100%', textAlign: 'left' }}>
              <table style={{width: '100%'}}>
                <tbody>
                  <tr>
                    <td style={{textAlign: 'right', paddingBottom: '10px'}}><NetworkSelector/></td>
                  </tr>
                  <tr>
                    <td><p><b>Domain:</b> {domainInfo.domain}</p></td>
                  </tr>
                </tbody>
              </table>
              <p><b>Registered on: </b>{domainInfo.registeredOn ? (new Date(domainInfo.registeredOn)).toLocaleDateString() : 'NA'}</p>
              <Alert message={<b>{domainInfo.status.message}</b>} 
                    type={domainInfo.status.type}
                    description={domainInfo.status.description}
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
                <b style={{fontSize: '15px'}}>Domain reports history</b>
                </div>} key="1" className="site-collapse-custom-panel">
                <DomainHistory/>
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
                {!_account.account ? <Button onClick={() => connectWallet()}>Connect Wallet</Button> : <History></History>}
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
            <Collapse
              bordered={true}
              defaultActiveKey={['0']}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              className="site-collapse-custom-collapse"
              style={{ width: '100%' }}
            >
              <Panel header={<div>
                <b style={{fontSize: '15px'}}>Contact us</b>
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
