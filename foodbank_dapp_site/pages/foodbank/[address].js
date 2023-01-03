import React, {useEffect, useState} from 'react';
import StartFundCollectionModal from './startFundCollectionModal';
import { Button, Form, Input, Radio, message, Space, Row, Col, Modal, Rate, Table, Tag } from 'antd';
import {fbContractAddr, ethEndpoint, fbAbi} from '../../constants/contract_addresses';
import { useRouter } from 'next/router'
import Link from "next/link";

const Web3 = require('web3');


const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (_, record) => {
      return(
          <Link href={`/foodbank_history/${record.id}`}>
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
    key: 'active',
    dataIndex: 'active',
    render:  (_, record) => {
      let color = (record.active == false) ? 'volcano' : 'green';
      let text = (record.active == false) ? 'inactive' : 'active'; 
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

function FoodBankHist() {
  const [showFundCollectionModal,setShowFundCollectionModal] = useState({ show: false });
  const [fbHist, setFbHist] = useState({data: []});
  const router = useRouter();
  const { address } = router.query;

  const closeFundCollectionModal = () => {
    setShowFundCollectionModal({...showFundCollectionModal,show: false});
    get_fb_hists();
  }

  const openFundCollectionModal = () => {
    setShowFundCollectionModal({...showFundCollectionModal,show: true})
  }

  async function get_fb_hists(){
    const web3 = new Web3(Web3.givenProvider || ethEndpoint);
    const accounts = await web3.eth.requestAccounts();
    const defaultAcc = accounts[0];
    web3.eth.defaultAccount = defaultAcc;
    let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
    const res = await contract.methods.getFBHistory(address).call();
    if(!res || Object.keys(res).length === 0 ) return;
    console.log(res);
    
    let length = res[0].length;
    let fb_hists = [];
    for(let i = 0; i < length; i++){
        let data = {};
        data.name = res[0][i]; data.rating = res[1][i]; data.key = i;
        data.active = res[2][i]; data.money_raised = web3.utils.fromWei(res[3][i] , 'ether'); data.id = res[4][i];
        fb_hists.push(data);
    }
    setFbHist({...fbHist, data: fb_hists});
  }

  useEffect(() => {
    if(!router.isReady) return;
    
    get_fb_hists();
  }, [router.isReady])

  return (
    <>
        <Row justify="end" style = {{padding: "5%", margin: "0 20px"}}>
            <Col xs = {5}  sm = {5} md = {5} lg = {5}>
              <Button type="primary" onClick={openFundCollectionModal}> 
                Start Fund Collection
              </Button>
            </Col>
        </Row>

        <Table columns={columns} dataSource={fbHist.data} style = {{padding: "5%", margin: "0 20px"}}/>

        < StartFundCollectionModal show = {showFundCollectionModal.show} fbAddress = {address} closeFundCollectionModal = {closeFundCollectionModal}/>
    </>
  )
}

export default FoodBankHist