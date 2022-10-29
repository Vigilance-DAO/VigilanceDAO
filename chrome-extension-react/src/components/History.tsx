import { Avatar, Button, List, Skeleton ,Collapse, Divider } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import {subgraphQuery} from '../utils/index';
import {FETCH_REPORTS} from '../queries/index';

import {
    ClockCircleOutlined,
    CheckCircleFilled,
    CloseCircleFilled
  } from '@ant-design/icons';
import { Context, hooks } from '../App';
import { IpfsImage } from 'react-ipfs-image';

const count = 5;
const History : React.FC = () => {
  const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames} = hooks
  const { web3Hooks } = useContext(Context);
  const { account } = web3Hooks
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false)
  const [list, setList] = useState<any[]>([]);
  const [reports, setReports] = useState([]);
    const getData = async (count :number) => {
        setInitLoading(true)
        const data = await subgraphQuery(FETCH_REPORTS(count, account.account));
        setInitLoading(false);
        setList(data.reports);
        if(data.reports.length == 0) {
          setAllLoaded(true)
        }
    }
    useEffect(() => {
        getData(count);
    }, [account])
  console.log(account)

  const onLoadMore = async () => {
    setLoading(true);
    await getData(count+1);
    setLoading(false);
  };

  const loadMore =
    !initLoading && !loading && !allLoaded ? (
      <div
        style={{
          textAlign: 'center',
          marginTop: 12,
          height: 32,
          lineHeight: '32px',
        }}
      >
        <Button onClick={onLoadMore}>loading more</Button>
      </div>
    ) : null;
  const { Panel } = Collapse

  const renderStatus = (status: string) => {
    if (status === null) {
      return <ClockCircleOutlined style={{color:"orange"}}/>
    }
    else if(status === 'ACCEPTED') {
      return <CheckCircleFilled style={{color:"green"}}/>
    }
    else {
      return <CloseCircleFilled style={{color:"red"}}/>
    }
  }

  const statusText = (status: string,address: string) => {
    if (status === null) {
      return "OPEN"
    }
    else if(status === 'ACCEPTED') {
      return "Aproved by "+address.slice(0,6)+"..."+address.slice(-4)
    }
    else {
      return "Rejected by "+address.slice(0,6)+"..."+address.slice(-4)
    }
  }

  

  return (
    <List
      className="demo-loadmore-list"
      loading={initLoading}
      itemLayout="horizontal"
      loadMore={loadMore}
      dataSource={list}
      renderItem={item => (
        <Collapse
              bordered={true}
              defaultActiveKey={['0']}
              // expandIcon={({ isActive }) => < rotate={isActive ? 90 : 0} />}
              className="site-collapse-custom-collapse"
              
              style={{ width: '100%' }}
            >
              <Panel header={<div>
                <b style={{fontSize: '15px'}}>{renderStatus(item.status)} {item.domain} - {item.isScam ? "scam" : "legit"}</b>
                
              </div>} key="1" className="site-collapse-custom-panel" showArrow={false}>
                <div>
                  <div>
                    <b>Status : </b>
                    {
                      statusText(item.status,item.validator)
                    }
                  </div>
                   
                  <div style={{display:"flex", justifyContent: "space-between"}}>
                    {
                      item.status === null ? <div style={{color:"orange"}}>Stake : {Number(item.stakeAmount)/1e18} MATIC</div> : item.status === 'ACCEPTED' ? <div style={{color:"green"}}>Stake : {Number(item.stakeAmount)/1e18} MATIC</div> : <div style={{color:"red"}}>Stake : {Number(item.stakeAmount)/1e18} MATIC</div>
                    }
                    {
                      item.rewardAmount === null ? <div style={{color:"gray"}}>Reward 0 VIGI</div> : <div style={{color:"orange"}}>Reward : {Number(item.rewardAmount)/1e18} VIGI</div>
                    }
                  </div>
                  {item.validatorComments ? <p>Comments : {item.validatorComments}</p> : <span></span>}
                  <Divider style={{margin: '12px 0', borderTop: '1px solid rgb(94 94 94 / 20%)'}} />
                  <b>My Report</b>
                  <div>Comments : {item.comments}</div>
                  <div>
                    {
                      item.evidences.split(",").map((evidence: string) => {
                        return <IpfsImage hash={evidence} gatewayUrl='https://ipfs.io/ipfs' style={{width:"100px",height:"100px"}}/>
                      }
                      )
                    }
                    
                  </div>
                </div>
              </Panel>
            </Collapse>
      )}
    />
  );
};

export default History;




