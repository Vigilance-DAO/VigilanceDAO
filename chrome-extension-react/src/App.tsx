import React, { useState } from 'react';
import './App.css';
import { CaretRightOutlined } from '@ant-design/icons';
import { Divider, Typography, Button, Input, Statistic, Form, Radio, Card, Alert, Collapse, Space } from 'antd';
import 'antd/dist/antd.css';
import { Web3Provider } from "@ethersproject/providers";
import ReviewForm from './components/ReviewForm';
import AlertMessageType from './interfaces/AlertMessageType';

function getLibrary(provider: any) {
  return new Web3Provider(provider);
}


function App() {  
  const [domainStatus, setDomainStatus] = useState<AlertMessageType>({
    message: 'Loading...',
    type: 'warning',
    description: ''
  })

  const { Panel } = Collapse

 

  return (
      <div className="App">
        <div className='backdrop'></div>
        <header className="App-header">
          <Typography.Title  className="title" level={1} style={{color: 'white', marginTop: '15px'}}>
            Internet Vigilance
          </Typography.Title>
          <Divider style={{margin: '12px 0 24px', borderTop: '1px solid rgb(255 255 255 / 20%)'}} />

          <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
            <Card style={{ width: '100%', textAlign: 'left' }}>
              <p><b>Domain:</b> www.google.com</p>
              <p><b>Registered on: </b>12/12/2021</p>
              <Alert message={domainStatus.message} 
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
                <b style={{fontSize: '15px'}}>Your rewards 🏆</b>
              </div>} key="1" className="site-collapse-custom-panel">
                <Statistic title="Active Users" value={112893} style={{color: 'white'}} />
              </Panel>
            </Collapse>

          </Space>
        </header>
      </div>
  );
}

export default App;
