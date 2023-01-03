import React, {useEffect, useState} from 'react'
import { Button, Col, Input, Row, message } from 'antd'
import {fbContractAddr, ethEndpoint, fbAbi, ratingAbi, ratingContractAddr as rContractAddr} from '../../constants/contract_addresses';
const Web3 = require('web3');


function updateContractAddresses() {

  const [planContractAddr, setPlanContractAddr] = useState("");
  const [ratingContractAddr, setRatingContractAddr] = useState("");
  const [votingContractAddr, setVotingContractAddr] = useState("");
  const [fbTokenContractAddr, setFbTokenContractAddr] = useState("");


  const submitPlanContractAddr = async () => {
    const web3 = new Web3(Web3.givenProvider || ethEndpoint);
    const accounts = await web3.eth.requestAccounts();
    const defaultAcc = accounts[0];
    web3.eth.defaultAccount = defaultAcc;
    let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
    await contract.methods.setPlanContractAddr(planContractAddr).send({from: defaultAcc});
    message.success('Created Successfully!');
  }

  const submitRatingContractAddr = async () => {
    const web3 = new Web3(Web3.givenProvider || ethEndpoint);
    const accounts = await web3.eth.requestAccounts();
    const defaultAcc = accounts[0];
    web3.eth.defaultAccount = defaultAcc;
    let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
    await contract.methods.setRatingContractAddr(ratingContractAddr).send({from: defaultAcc});
    message.success('Created Successfully!');
  }
  
  const submitVotingContractAddr = async() => {
    const web3 = new Web3(Web3.givenProvider || ethEndpoint);
    const accounts = await web3.eth.requestAccounts();
    const defaultAcc = accounts[0];
    web3.eth.defaultAccount = defaultAcc;
    let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
    await contract.methods.setVotingContractAddr(votingContractAddr).send({from: defaultAcc});
    message.success('Created Successfully!');
  }

  const submitFbTokenContractAddr = async() => {
    const web3 = new Web3(Web3.givenProvider || ethEndpoint);
    const accounts = await web3.eth.requestAccounts();
    const defaultAcc = accounts[0];
    web3.eth.defaultAccount = defaultAcc;
    let contract = new web3.eth.Contract(ratingAbi, rContractAddr, web3.eth.defaultAccount);
    await contract.methods.setFbTokenContractAddr(fbTokenContractAddr).send({from: defaultAcc});

    contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
    await contract.methods.setFbTokenContractAddr(fbTokenContractAddr).send({from: defaultAcc});
    message.success('Created Successfully!');
  }

  return (
   <div>
    <Row style = {{padding: "3%"}}>
        <Input.Group compact>
            <Input
                style={{
                width: 'calc(100% - 500px)',
                }}
                onChange = {(e) => {setPlanContractAddr(e.target.value)}}
                placeholder = "Enter PlanContract Address"
            />
            <Button type="primary" onClick = {submitPlanContractAddr}>Submit Plan Contract Addr</Button>
        </Input.Group>
    </Row>

    <Row style = {{padding: "3%"}}>
        <Input.Group compact>
        <Input
            style={{
            width: 'calc(100% - 500px)',
            }}
            onChange = {(e) => {setRatingContractAddr(e.target.value)}}
            placeholder = "Enter RatingContract Address"
        />
        <Button type="primary" onClick = {submitRatingContractAddr}>Submit Rating Contract Addr</Button>
        </Input.Group>
    </Row>

    <Row style = {{padding: "3%"}}>
        <Input.Group compact>
        <Input
            style={{
            width: 'calc(100% - 500px)',
            }}
            onChange = {(e) => {setVotingContractAddr(e.target.value)}}
            placeholder = "Enter VotingContract Address"
        />
        <Button type="primary" onClick= {submitVotingContractAddr}>Submit Voting Contract Addr</Button>
        </Input.Group>
    </Row>

    <Row style = {{padding: "3%"}}>
        <Input.Group compact>
        <Input
            style={{
            width: 'calc(100% - 500px)',
            }}
            onChange = {(e) => {setFbTokenContractAddr(e.target.value)}}
            placeholder = "Enter FbTokenContract Address"
        />
        <Button type="primary" onClick= {submitFbTokenContractAddr}>Submit Fb Token Contract Addr</Button>
        </Input.Group>
    </Row>
    
   </div>
  )
}

export default updateContractAddresses