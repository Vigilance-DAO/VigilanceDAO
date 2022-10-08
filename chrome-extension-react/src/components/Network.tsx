import { Button, Dropdown, Menu, Space } from "antd"
import { DownOutlined } from '@ant-design/icons';
import { useContext, useEffect, useState } from "react";
import { Connector } from '@web3-react/types';
import { Context, hooks, metamaskConnector } from "./ReviewForm";

const chainInfo = [{
    chainId: 137,
    fullName: 'Polygon Mainnet',
    shortName: 'Mainnet'
}, {
    chainId: 80001,
    fullName: 'Polygon Mumbai',
    shortName: 'Mumbai'
}]

function NetworkSelector() {
    
    const { account } = useContext(Context);
    const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks
    const chainId = useChainId()
    const [network, setNetwork] = useState('Mumbai')
    let defaultChainId = parseInt(process.env.REACT_APP_DEFAULT_NETWORK)
    const [selectedChainId, setSelectedChainId] = useState(chainId || defaultChainId)

    function onNetworkChange(_network: string) {
        let _chainInfo = chainInfo.find(item => {
            return item.fullName == _network
        })
        if(_chainInfo) {
            metamaskConnector.activate(_chainInfo.chainId)
            setSelectedChainId(_chainInfo.chainId)
        } else {
            alert("Chain not found")
        }
    }

    let supportedChains = process.env.REACT_APP_SUPPORTED_NETWORKS.split(',').map(i => parseInt(i))

    let items: any[] = chainInfo.filter(item => supportedChains.includes(item.chainId)).map(item => {
        return {
                key: item.shortName,
                label: (
                    <span onClick={() => onNetworkChange(item.fullName)}>{item.fullName}</span>
                ),
            }
    })
    const [menuItems, setMenuItems] = useState<any[]>(items)

    function disconnect() {
        if(metamaskConnector.deactivate)
            metamaskConnector.deactivate()
        else
            metamaskConnector.resetState()
    }

    useEffect(() => {
        console.log('network selector', account, chainId)
        if(account) {
            let len = account.length
            let network = chainInfo.find(item => item.chainId == chainId)
            setNetwork(`${account.substring(0, 3)}...${account.substring(len-3, len)} | ${network?.shortName}`)
            if(items.length == 2) {
                items.push({
                    type: 'divider',
                })
                items.push({
                    key: 'disconnect',
                    label: (
                        <span onClick={disconnect}>Disconnect</span>
                    )
                })
                setMenuItems(items)
            }
        } else {
            if(items.length == 4) {
                items.splice(2, 2)
                setMenuItems(items)
            }
            let network = chainInfo.find(item => item.chainId == selectedChainId)
            setNetwork(`${network?.shortName}`)
        }
    }, [account, chainId])

    const menu = <Menu
            items={menuItems}
        />
    return (
        <Dropdown overlay={menu}>
            <Button type="primary"
                value="small"
                shape="round"
                onClick={e => e.preventDefault()}
            >
                <Space>
                    {network}
                    <DownOutlined />
                </Space>
            </Button>
        </Dropdown>
    )
}

export default NetworkSelector