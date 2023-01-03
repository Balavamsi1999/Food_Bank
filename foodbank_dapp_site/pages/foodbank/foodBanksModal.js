import React, {useEffect, useState} from 'react';
import { Space, Table, Tag, Card, Row, Col, Rate } from 'antd';
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
            <Link href={`/foodbank/${record.address}`}>
              {record.name}
            </Link>
        )
      }
    },
    {
      title: 'Money raised',
      dataIndex: 'money_raised',
      key: 'money_raised',
      render: (_, record) => {
        return(
            <p> {`${record.money_raised} ETH`}</p>
        )
      }
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render:  (tag) => {
        let color = (tag == true) ? 'green' : 'volcano';
        let text = (tag == false) ? 'inactive' : 'active'; 
        return (
            <Tag color={color}>
                {text}
            </Tag>
        )
      }
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (_, record) => {
        return(
          <Rate value={record.rating} disabled />
        )
      }
    },
  ];

function foodBanksModal() {
  
  const router = useRouter();
  const [foodBanks, setFoodBanks] = useState({data: []});
  const [myAddress, setMyAddress] = useState("");
  const [myFoodBank, setMyFoodBank] = useState({data: []});
  // {key, name, address, status, money_raised}


 
  useEffect(() => {
    async function get_fbs(){
        const web3 = new Web3(Web3.givenProvider || ethEndpoint);
        const accounts = await web3.eth.requestAccounts();
        const defaultAcc = accounts[0];
        web3.eth.defaultAccount = defaultAcc;
        let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
        const res = await contract.methods.getListOfFBS().call();
        if(!res || Object.keys(res).length === 0 ) return;
        console.log(res);
        
        let length = res[0].length;
        let fbs = [];
        for(let i = 0; i < length; i++){
            let data = {};
            data.address = res[0][i]; data.name = res[1][i]; data.key = i;
            data.status = res[2][i]; data.money_raised = web3.utils.fromWei(res[3][i] , 'ether');
            data.rating = res[4][i];
            fbs.push(data);
        }
        setFoodBanks({...foodBanks, data: fbs});
        setMyAddress(defaultAcc);
    }
    get_fbs();
  }, [])

  useEffect(() => {
    update_my_food_bank();
  }, [foodBanks])


  const update_my_food_bank = () => {
    let my_fb = []
    foodBanks.data.filter((obj) => obj.address == myAddress)
            .map((arr, index) => my_fb.push({...arr}))
    setMyFoodBank({...myFoodBank, data: my_fb});
  };

  console.log("my addr is: ", myAddress);
  console.log("myFoodBank is: ", myFoodBank);

  const handleCardClick = (obj) => {
    router.push(`foodbank/${obj.address}`)
  }
  

  return (
    <div>
        {myFoodBank.data.map((obj) => 
          <div key = {obj.key} style = {{marginBottom: "25px"}}>
             <Col xs={8} md = {7} lg = {5}>
                <Card title = {obj.name} type="inner" onClick = {() => handleCardClick(obj)} hoverable = {true}  style={{ borderRadius: "20px", boxShadow: " 2px 1px 2px -2px rgba(0,0,0,0.22) ,  0 3px 6px 0 rgba(0,0,0,0.22) ,   0 5px 12px 4px rgba(0,0,0,0.15)" }} headStyle = {{textAlign: "center",borderTopLeftRadius: "20px",borderTopRightRadius: "20px" }}>
                    <Row justify = "space-between" xs = {10}  md = {4}>
                        <Col xs = {12} md = {8}>
                            <h4 style = {{margin: "0",padding: "0"}}>{parseFloat(obj.money_raised).toFixed(2)}</h4>                         
                        </Col>
                        <Col xs = {12} md = {8} style = {{marginRight: "8px"}}>
                            <p style = {{margin: "0",padding: "0", textAlign: "right"}}> {obj.status ? <Tag color="green"> Active </Tag> : <Tag color="volcano"> InActive </Tag>} </p>
                        </Col>
                    </Row>
                </Card>
             </Col>
          </div>
        )}
        
        <Table columns={columns} dataSource={foodBanks.data} />
    </div>
   
  )
}

export default foodBanksModal