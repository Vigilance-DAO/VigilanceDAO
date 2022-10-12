import { Avatar, Button, List, Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';
import {subgraphQuery} from '../utils/index';
import {FETCH_REPORTS} from '../queries/index';
import {
    CheckCircleOutlined
  } from '@ant-design/icons';


const History : React.FC = () => {
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [list, setList] = useState<any[]>([]);
  const [reports, setReports] = useState([]);
    const getData = async () => {
        const data = await subgraphQuery(FETCH_REPORTS());
        setData(data.reports);
        setList(data.reports);
    }
    useEffect(() => {
        getData();
        setInitLoading(false);
    }, [])
    console.log(reports);

  const onLoadMore = () => {
    setLoading(false);
    // setList(
    //   data.concat([...new Array(count)].map(() => ({ loading: true, name: {}, picture: {} }))),
    // );
    // fetch(fakeDataUrl)
    //   .then(res => res.json())
    //   .then(res => {
    //     const newData = data.concat(res.results);
    //     setData(newData);
    //     setList(newData);
    //     setLoading(false);
    //     // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
    //     // In real scene, you can using public method of react-virtualized:
    //     // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
    //     window.dispatchEvent(new Event('resize'));
    //   });
  };

  const loadMore =
    !initLoading && !loading ? (
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
  return (
    <List
      className="demo-loadmore-list"
      loading={initLoading}
      itemLayout="horizontal"
      loadMore={loadMore}
      dataSource={list}
      renderItem={item => (
        <List.Item>
          <Skeleton avatar title={false} loading={false} active>
            <List.Item.Meta
              avatar={<CheckCircleOutlined />}
              title={item.domain}
              description="Ant Design, a design language for background applications, is refined by Ant UED Team"
            />
          </Skeleton>
        </List.Item>
      )}
    />
  );
};

export default History;




