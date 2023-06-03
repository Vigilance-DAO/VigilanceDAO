import React, { useContext, useEffect, useState } from "react";
import { Context } from "../App";
import { FETCH_REPORTS_BY_DOMAIN } from "../queries";
import { subgraphQuery } from "../utils";
import { Steps, Empty, Spin } from 'antd';
import { ExclamationCircleOutlined, FormOutlined } from "@ant-design/icons";

interface HistoryData {
    title: React.ReactNode, subTitle: React.ReactNode, status: 'error' | 'process' | 'finish',
    icon: React.ReactNode,
    description: React.ReactNode
}

export function DomainHistory() {
    const { web3Hooks } = useContext(Context);
    const { domainInfo } = web3Hooks
    const { Step } = Steps;

    const [history, setHistory] = useState<HistoryData[]>([])
    const [loading, setLoading] = useState(true)

    const getStatus = async () => {
        const data = await subgraphQuery(FETCH_REPORTS_BY_DOMAIN(domainInfo.domain));
        let reports = data.reports
        let _history: HistoryData[] = []
        for(let i=0; i<reports.length; ++i) {
            let report = reports[i]
            let status: 'error' | 'process' | 'finish' = 'process'
            let title: React.ReactNode = <b style={{color: '#ff9900'}}>Awaiting validation</b>
            let description = <div>
                <b>Report ID:</b> {report.id} <br/>
                <b>Created on:</b> {(new Date(report.createdon * 1000)).toLocaleDateString()}
            </div>
            let icon = <ExclamationCircleOutlined style={{color: '#ff9900'}} />
            if(report.status == 'ACCEPTED') {
                status = 'finish'
                title = report.isScam ? 'Marked scam' : 'Marked legit'
            } else if(report.status == 'REJECTED') {
                status = 'error'
                title = report.isScam ? 'Scam report rejected' : 'Legit report rejected'
            }

            let _his: HistoryData = {
                title: title,
                subTitle: '',
                icon,
                status,
                description
            }
            _history.push(_his)
        }
        setHistory(_history)
        setLoading(false)
    }

    useEffect(() => {
        getStatus()
    }, [])

    function getHistoryElements() {
        return <Steps direction="vertical" current={0}>
            {history.map((_historyItem, index) => 
                <Step title={_historyItem.title} icon={_historyItem.icon} status={_historyItem.status} key={index}
                subTitle={_historyItem.subTitle} description={_historyItem.description} />
            )}
      </Steps>
    }

    function noHistoryElement() {
        return <Empty description="No history of reports"/>
    }

    return (
        loading ? <Spin/> : (
            history.length ? getHistoryElements() : noHistoryElement()
        )
    )
}