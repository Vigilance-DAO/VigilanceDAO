// import { Avatar, Button, List, Skeleton } from 'antd';
// import React, { useEffect, useState } from 'react';
// import {
//     CheckCircleOutlined
//   } from '@ant-design/icons';
// interface DataType {
//     id: string;
//     domain: string;
//     isScam : boolean;
//     comments: string;
//     evidences: string;
//     reporter: string;
//     status: string;
//     createdOn: string;
// }

// const count = 3;
// const fakeData = [
//     {
//       "createdon": "1665232512",
//       "domain": "www.google.com",
//       "id": "1",
//       "evidences": "Hi",
//       "isScam": true,
//       "reporter": "0x04c755e1574f33b6c0747be92dfe1f3277fcc0a9",
//       "status": "null"
//     },
//     {
//       "createdon": "1665232767",
//       "domain": "www.yahoo.com",
//       "id": "2",
//       "evidences": "yes",
//       "isScam": false,
//       "reporter": "0x04c755e1574f33b6c0747be92dfe1f3277fcc0a9",
//       "status": ""
//     },
//     {
//       "createdon": "1665468512",
//       "domain": "https://www.amazon.com",
//       "id": "3",
//       "evidences": "https://gateway.pinata.cloud/ipfs/bafybeidbgu5vgu2jpuktmoscn67zi4sv7df6vwvodqplchxfzbscynfwnu/Screenshot from 2022-10-11 10-53-27.png,https://gateway.pinata.cloud/ipfs/bafybeihy6nzexkjr6ilbcbps725hz2errs6i3fpenzhmsr3bote7mdtx24/Screenshot from 2022-10-07 13-07-16.png",
//       "isScam": false,
//       "reporter": "0x625b892f34aca436e1525e5405a8fb81ec5cc04d",
//       "status": ""
//     }
//   ]

// const History : React.FC = () => {
//   const [initLoading, setInitLoading] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState(fakeData);
//   const [list, setList] = useState(fakeData);

// //   useEffect(() => {
// //     fetch(fakeDataUrl)
// //       .then(res => res.json())
// //       .then(res => {
// //         setInitLoading(false);
// //         setData(res.results);
// //         setList(res.results);
// //       });
// //   }, []);

//   const onLoadMore = () => {
//     setLoading(false);
//     // setList(
//     //   data.concat([...new Array(count)].map(() => ({ loading: true, name: {}, picture: {} }))),
//     // );
//     // fetch(fakeDataUrl)
//     //   .then(res => res.json())
//     //   .then(res => {
//     //     const newData = data.concat(res.results);
//     //     setData(newData);
//     //     setList(newData);
//     //     setLoading(false);
//     //     // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
//     //     // In real scene, you can using public method of react-virtualized:
//     //     // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
//     //     window.dispatchEvent(new Event('resize'));
//     //   });
//   };

//   const loadMore =
//     !initLoading && !loading ? (
//       <div
//         style={{
//           textAlign: 'center',
//           marginTop: 12,
//           height: 32,
//           lineHeight: '32px',
//         }}
//       >
//         <Button onClick={onLoadMore}>loading more</Button>
//       </div>
//     ) : null;
//         console.log(list)
//   return (
//     <List
//       className="demo-loadmore-list"
//       loading={initLoading}
//       itemLayout="horizontal"
//       loadMore={loadMore}
//       dataSource={list}
//       renderItem={item => (
//         <List.Item>
//           <Skeleton avatar title={false} active>
//             <List.Item.Meta
//               avatar={<CheckCircleOutlined />}
//               title={<a href="">{item.domain}</a>}
//               description="Ant Design, a design language for background applications, is refined by Ant UED Team"
//             />
//           </Skeleton>
//         </List.Item>
//       )}
//     />
//   );
// };

// export default History;

import {subgraphQuery} from '../utils/index';
import {FETCH_REPORTS} from '../queries/index';
import { useEffect ,useState } from 'react';

export default function History() {
    const [reports, setReports] = useState([]);
    const getData = async () => {
        const data = await subgraphQuery(FETCH_REPORTS());
        setReports(data.reports);
    }
    useEffect(() => {
        getData();
    }, [])
    console.log(reports);
    return (
        <div>
            <h1>History</h1>
        </div>
    )
        
}