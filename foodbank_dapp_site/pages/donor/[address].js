import React, {useEffect, useState} from 'react';
import { Button, Form, Input, Radio, message, Space, Row, Col, Modal, Rate, Table, Tag } from 'antd';
import {fbContractAddr, ethEndpoint, fbAbi} from '../../constants/contract_addresses';
import { useRouter } from 'next/router'
import Link from "next/link";

const Web3 = require('web3');


const columns = [
  {
    title: 'Food Bank Name',
    dataIndex: 'fbank_name',
    key: 'fbank_name',
    render: (_, record) => {
      return(
          <Link href={`/foodbank/${record.food_bank_addr}`}>
            {record.fbank_name}
          </Link>
      )
    }
  },
  {
    title: 'Raised For',
    dataIndex: 'fbank_hist_name',
    key: 'fbank_hist_name',
    render: (_, record) => {
      return(
          <Link href={`/foodbank_history/${record.fb_hist_id}`}>
            {record.fbank_hist_name}
          </Link>
      )
    }
  },
  {
    title: 'Amount Donated',
    key: 'funded_amount',
    dataIndex: 'funded_amount',
    render: (_, record) => {
      return(
        <p> {`${record.funded_amount} ETH`}</p>
      )
    }
  },
  {
    title: 'Voted',
    dataIndex: 'voted',
    key: 'voted',
    render:  (_, record) => {
      let color = (record.voted == false) ? 'volcano' : 'green';
      let text = (record.voted == false) ? 'NO' : 'YES'; 
      return (
          <Tag color={color}>
              {text}
          </Tag>
      )
    }
  },
];


function ViewDonor() {
  const [donorData, setDonorData] = useState({data: []});
  const [donorActDetails, setDonorActDetails] = useState({data: []});
  const router = useRouter();
  const { address } = router.query;
  const web3 = new Web3(Web3.givenProvider || ethEndpoint);

  const fetch_donor_details = async() => {
    const accounts = await web3.eth.requestAccounts();
    const defaultAcc = accounts[0];
    web3.eth.defaultAccount = defaultAcc;
    let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
    const res = await contract.methods.viewDonorDetails(address).call();
    if(!res || Object.keys(res).length === 0 ) return;

    let data = [];

    data.push({name: res[0], total_amount_funded: res[1], activity_ids: res[2]});
    setDonorData({...donorData, data: data});
  }

  const fetch_donor_activities = async() => {
    const accounts = await web3.eth.requestAccounts();
    const defaultAcc = accounts[0];
    web3.eth.defaultAccount = defaultAcc;
    let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
    
    if( donorData.data.length < 1) return;
    let donor_act_ids = donorData.data[0].activity_ids;
    if(!donor_act_ids || donor_act_ids.length < 1) return;
    let data = [];

    for(let i = 0; i < donor_act_ids.length; i++){
      const res = await contract.methods.getDonorActivityDetails(donor_act_ids[i]).call();
      let obj = {};
      obj.food_bank_addr = res[0]; obj.fb_hist_id = res[1][0]; obj.funded_amount = web3.utils.fromWei(res[1][1] , 'ether') ; 
      obj.voted_for_plan_id = res[1][2]; obj.voted = res[2]; obj.donor_addr = res[3]; obj.donor_name = res[4][0];
      obj.fbank_hist_name = res[4][1]; obj.fbank_name = res[4][2];

      data.push(obj);
    }
    setDonorActDetails({...donorActDetails, data: data});
  }



  useEffect(() => {
    if(!router.isReady) return;
    
    fetch_donor_details();
  }, [router.isReady])

  useEffect(() => {
    fetch_donor_activities();
  }, [donorData])

  console.log("donorData is: ", donorData);
  console.log("donorActDetails: ", donorActDetails);

  return (
    <>
     { donorData.data.map((obj, index) =>
        <Row style = {{padding: "5%", margin: "0 20px"}} key = {index}>
          <Col xs = {5}  sm = {5} md = {8} >
            <p> <b> Name:  </b> {obj.name}</p>
          </Col>
          <Col xs = {5}  sm = {5} md = {8} >
            <p> <b> Donated Amount:  </b> { `${web3.utils.fromWei(obj.total_amount_funded , 'ether')} ETH` }</p>
          </Col>
        </Row>
     )}

     <Table columns={columns} dataSource={donorActDetails.data} style = {{padding: "5%", margin: "0 20px"}}/>
    </>
  )
}

export default ViewDonor