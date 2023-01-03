import React, {useEffect, useState} from 'react';
import { Space, Table, Tag, Card, Row, Col } from 'antd';
import { useRouter } from 'next/router';
import {fbContractAddr, ethEndpoint, fbAbi} from '../../constants/contract_addresses';
import Link from "next/link";

const Web3 = require('web3');


const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        return(
            <Link href={`/donor/${record.address}`}>
              {record.name}
            </Link>
        )
      }
    },
    {
      title: 'Funds Donated',
      dataIndex: 'funds_donated',
      key: 'funds_donated',
      render: (_, record) => {
        return(
            <p> {`${record.funds_donated} ETH`}</p>
        )
      }
    },
  ];

function DonorIndex() {

    const router = useRouter();
    const [donors, setDonors] = useState({data: []});  // {address, name, key, funds_donated}
    const [myAddress, setMyAddress] = useState("");
    const [myDonor, setMyDonor] = useState({data: []});


    useEffect(() => {
        async function get_donors(){
            const web3 = new Web3(Web3.givenProvider || ethEndpoint);
            const accounts = await web3.eth.requestAccounts();
            const defaultAcc = accounts[0];
            web3.eth.defaultAccount = defaultAcc;
            let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
            const res = await contract.methods.getListOfDonors().call();
            if(!res || Object.keys(res).length === 0 ) return;
            console.log(res);
            
            let length = res[0].length;
            let donors = [];
            for(let i = 0; i < length; i++){
                let data = {};
                data.address = res[0][i]; data.name = res[1][i]; data.key = i;
                data.funds_donated = web3.utils.fromWei(res[2][i] , 'ether');
                donors.push(data);
            }
            setDonors({...donors, data: donors});
            setMyAddress(defaultAcc);
        }
        get_donors();
    }, [])

    useEffect(() => {
       update_my_donor();
    }, [donors])

    const update_my_donor = () => {
        let my_donor = [];
        donors.data.filter((obj) => obj.address == myAddress)
                   .map((arr, index) => my_donor.push({...arr}));
        setMyDonor({...myDonor, data: my_donor});
    };

    const handleCardClick = (obj) => {
        router.push(`donor/${obj.address}`)
    }


  return (
    <div>
        {myDonor.data.map((obj) => 
          <div key = {obj.key} style = {{marginBottom: "25px"}}>
             <Col xs={8} md = {7} lg = {5}>
                <Card title = {obj.name} type="inner" onClick = {() => handleCardClick(obj)} hoverable = {true}  style={{ borderRadius: "20px", boxShadow: " 2px 1px 2px -2px rgba(0,0,0,0.22) ,  0 3px 6px 0 rgba(0,0,0,0.22) ,   0 5px 12px 4px rgba(0,0,0,0.15)" }} headStyle = {{textAlign: "center",borderTopLeftRadius: "20px",borderTopRightRadius: "20px" }}>
                    <Row justify = "space-between" xs = {10}  sm = {11} md = {10} lg = {10}>
                        <Col span = {12}>
                            <h4 style = {{margin: "0",padding: "0"}}> <Tag color="purple"> {`${parseFloat(obj.funds_donated).toFixed(2)} ETH`} </Tag> </h4>                         
                        </Col>
                    </Row>
                </Card>
             </Col>
          </div>
        )}
        
        <Table columns={columns} dataSource={donors.data} />
    </div>
  )
}

export default DonorIndex