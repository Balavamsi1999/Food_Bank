import { Button,  Steps, Tabs, Col, Divider, Row, Tag } from 'antd';
import axios from "axios";
import { ethers } from "ethers";
import { LoadingOutlined } from '@ant-design/icons';
import React, {useEffect, useState} from 'react';
import FoodBanksModal from './foodbank/foodBanksModal';
import DonorIndex from './donor/index';
import {fbTokenContractAddr, fbTokenAbi} from '../constants/contract_addresses';


import { useRouter } from 'next/router'

const Web3 = require('web3');

function homepage(){
    const router = useRouter();
    const [defaultKey, setDefaultKey] = useState("1");
    const [activeToken, setActiveTokens] = useState(0);

   

    const redirectToDonorRegistration = () => {
        router.push('/donor/create')
    };

    const redirectToFoodBankRegistration = () => {
        router.push('/foodbank/create')
    };

    useEffect(() => {
      async function get_no_of_tokens(){
        const web3 = new Web3(Web3.givenProvider || ethEndpoint);
        const accounts = await web3.eth.requestAccounts();
        const defaultAcc = accounts[0];
        web3.eth.defaultAccount = defaultAcc;
        let contract = new web3.eth.Contract(fbTokenAbi, fbTokenContractAddr, web3.eth.defaultAccount);
        const res = await contract.methods.balanceOf(defaultAcc).call();
        if(!res) return;
        console.log("no:of tokens is", res);
      
        setActiveTokens(res);
      }
      get_no_of_tokens();
    }, [])
 
    useEffect(() => {
      if(!router.isReady) return;

      const { tabKey } = router.query;
      if(tabKey) setDefaultKey(tabKey.toString());
    }, [router.isReady])

    const updateTabKey = (key) => {
      setDefaultKey(key.toString());
    }
 
    return (
        <div>
            <Row style = {{padding: "5%", margin: "0 20px"}}>
              <Col xs = {4}>
                <Row justify = "start" >
                  <Col xs = {5}  sm = {5} md = {5} lg = {5}>
                    <Tag color="green">
                        {`Active Tokens: ${activeToken}`}
                    </Tag>
                  </Col>
              </Row>
              </Col>
              <Col xs = {20}>
                <Row justify="end">
                  <Col xs = {8}  md = {5}>
                    <Button type="primary" onClick={redirectToDonorRegistration}> 
                      Register as Donor
                    </Button>
                  </Col>
                  <Col xs = {8} md = {5}>
                    <Button type="primary" onClick={redirectToFoodBankRegistration}>
                      Register as FoodBank
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
            
            
            <Row gutter= {{xs: 8, sm: 16, md: 24, lg: 32}} justify="center">
              <Col className="gutter-row" span={20}>
                <Tabs activeKey= {defaultKey} onChange = {updateTabKey} >
                    <Tabs.TabPane tab="FoodBanks" key="1">
                        <FoodBanksModal />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Donors" key="2">
                       <DonorIndex/>
                    </Tabs.TabPane>
                </Tabs>
              </Col>
            </Row>            
            
        </div>
      )
}
export default homepage
