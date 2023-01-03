import React, {useEffect, useState} from 'react';
import { Button, Form, Input, Radio, message, Space, Row, Col, Modal, Rate, Table, Tag, Card, Typography, message as msg } from 'antd';
import {fbContractAddr, ethEndpoint, fbAbi, planContractAddr, planAbi, fbTokenAbi, fbTokenContractAddr} from '../../constants/contract_addresses';
import CreateAPlanModal from './createAPlanModal';
import DonateFundsModal from './donateFundsModal';
import SubmitRatingModal from './submitRatingModal';
import { useRouter } from 'next/router'
import Link from "next/link";

const { Text } = Typography;
const Web3 = require('web3');

const columns = [
  {
    title: 'Name',
    dataIndex: 'donor_name',
    key: 'donor_name',
    render: (_, record) => {
      return(
          <Link href={`/donor/${record.donor_address}`}>
            {record.donor_name}
          </Link>
      )
    }
  },
  {
    title: 'Donated Amount',
    dataIndex: 'donated_amount',
    key: 'donated_amount',
    render: (_, record) => {
      return(
          <p> {`${record.donated_amount} ETH`}</p>
      )
    }
  },
  {
    title: 'Voted For Plan',
    key: 'voted_for_plan_id',
    dataIndex: 'voted_for_plan_id',
    render:  (_, record) => {
      let planned = record.voted_for_plan_id != 0;
      return(
        <>
          { planned ?
            <Link href={`/plan/${record.voted_for_plan_id}`}>
              {record.voted_for_plan_id}
            </Link>
          : 'NA'}
        </>
      )
    }
  },
];


function viewFbHistory() {

    const router = useRouter();
    const [fbHistId, setFbHistId] = useState(0);
    const [data, setData] = useState({}); // {fb_addr, name, is_active, curr_step, total_steps, money_raised, rating, donor_activity_ids, plan_ids, most_voted_plan_id }
    const [donorActData, setDonorActData] = useState({ data: [] });  // {donor_name, donated_amount, voted, voted_for_plan_id, donor_address}
    const [showCreateAPlanModal, setShowCreateAPlanModal] = useState({ show: false });
    const [showDonateFundsModal ,setShowDonateFundsModal] = useState({ show: false });
    const [showRatingModal, setShowRatingModal] = useState({show: false});
    const [showVoteModal, setShowVotingModal] = useState({show: false, plan_id: -1, entered_tokens: 0, available_tokens: 0});
    const [buttonText, setButtonText] = useState("");
    const [planData, setPlanData] = useState({ data: []});

    async function view_fb_hist(){
      console.log("called view_fb_hist !!!!");
      const { id } = router.query;  
      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
      const res = await contract.methods.viewFBHistory(id).call();
      if(!res || Object.keys(res).length === 0 ) return;
      console.log("view_fb_hist res: ", res);

      setData({...data, fb_addr: res[0], name: res[1], is_active: res[2], curr_step: res[3][0],
        total_steps: res[3][1], money_raised: web3.utils.fromWei(res[3][2], 'ether'), rating: res[3][3], donor_activity_ids: res[4], plan_ids: res[5], most_voted_plan_id: res[3][4]});
      setFbHistId(id);
    }

    useEffect(() => {
      if(!router.isReady) return;
 
      view_fb_hist();
    }, [router.isReady])


  async function fetch_donor_activities(){
    console.log("called fetch_donor_activities !!!!");
      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
      const donor_act_data = [];
      for(let i = 0; i < data.donor_activity_ids.length; i++){
        let donor_act_id = data.donor_activity_ids[i];

        const res = await contract.methods.getDonorActivityDetails(donor_act_id).call();
        if(!res || Object.keys(res).length === 0 ) return;
        console.log("fetch_donor_activities res: ", res);

        donor_act_data.push({ donor_name: res[4][0], donated_amount: web3.utils.fromWei(res[1][1], 'ether'), voted: res[2], voted_for_plan_id: res[1][2], donor_address: res[3] });
      }
      setDonorActData({...donorActData, data: donor_act_data});
      updateButtonText();
  }

  useEffect(() => {
    if(!("donor_activity_ids" in data)) return;

    fetch_donor_activities();
  }, [data])

    async function fetch_plan_details(){
        if(!("plan_ids" in data)) return;

        console.log("called fetch_plan_details !!!!")

        const web3 = new Web3(Web3.givenProvider || ethEndpoint);
        const accounts = await web3.eth.requestAccounts();
        const defaultAcc = accounts[0];
        web3.eth.defaultAccount = defaultAcc;
        let contract = new web3.eth.Contract(planAbi, planContractAddr, web3.eth.defaultAccount);
        let plan_data = [];
        for(let i = 0; i < data.plan_ids.length; i++){
          let plan_id = data.plan_ids[i];

          const res = await contract.methods.getPlanDetails(plan_id).call();
          if(!res || Object.keys(res).length === 0 ) return;
          console.log("fetch_plan_details", res);
          
          let plan_item_data = [];
          for(let j = 0; j < res[0].length; j++){
            plan_item_data.push({ name: res[0][j], amount: res[1][j], plan_id:  plan_id});
          }
          plan_data.push(plan_item_data);
        }
        setPlanData({...planData, data: plan_data});
    }


    useEffect(() => {
      fetch_plan_details();
    }, [data])

    const updateButtonText = () => {
      switch(data.curr_step) {
        case '0':
          setButtonText("Start Fund Collection");
          break;
        case '1':
          setButtonText("Start Voting");
          break;
        case '2':
          setButtonText("End Voting");
          break;
        case '3':
          setButtonText("Withdraw Funds");
          break;
        case '4':
          setButtonText("Submit Bills");
          break;
        case '5':
          setButtonText("");
          break;
        default:
          // code block
      }
    }

    const updateStep = async () => {
      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
      let res;
      if(data.curr_step == 0){
        res = await contract.methods.updateFbHistStateToStartFundCollection(fbHistId).send({from: defaultAcc});
      }else if(data.curr_step == 1){
        StartVoting();
      }else if(data.curr_step == 2){
        endVoting();
      }else if(data.curr_step == 3){
        withdrawFunds();
      }else if(data.curr_step == 4){
        submitBills();
      }
      
      if(!res || Object.keys(res).length === 0 ) return;
      console.log(res);
      view_fb_hist();
    }

    const openCreateAPlanModal = () => {
      setShowCreateAPlanModal({...showCreateAPlanModal, show: true});
    }

    const closeCreateAplanModal = () => {
      setShowCreateAPlanModal({...showCreateAPlanModal, show: false});
    }

    const submitAPlan = async (params) => {
      if(params.plan_items == undefined){
        msg.error("Plan cannot be empty");
        return;
      }

      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
      let item_names = params.plan_items.map((value) => value.item_name);
      let amounts = params.plan_items.map((value) => value.amount);

      const res = await contract.methods.createFbHistPlan(fbHistId, item_names, amounts).send({ from: defaultAcc});
      console.log("res for create a plan is: ", res);
      closeCreateAplanModal();
      fetch_plan_details();
      view_fb_hist();
    }


    const call_back = (error, receipt) => {
      if (error) console.error(error);
      else {
        console.log(receipt);
      }
    }

    const submitDonation = async (params) => {
      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);

      await contract.methods.donate_funds(fbHistId).send({ from: defaultAcc, value: web3.utils.toWei(params.amount, "ether")});
      view_fb_hist();
      closeDonateFundsModal();
    }

    const StartVoting = async () => {
      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
      const res = await contract.methods.startVoting(fbHistId).send({ from: defaultAcc});
      console.log("res for start voting is: ", res);
      view_fb_hist();
    }

    const endVoting = async() => {
      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
      const res = await contract.methods.endVotingAndFetchMostVotedPlan(fbHistId).send({ from: defaultAcc});
      console.log("res for start voting is: ", res);
      view_fb_hist();
    }

    const withdrawFunds = async() => {
      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
      const res = await contract.methods.withdraw_funds(fbHistId).send({ from: defaultAcc});
      console.log("res for withdraw funds is: ", res);
      view_fb_hist();
    }

    const submitBills = async() => {
      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
      const res = await contract.methods.submitBill(fbHistId).send({ from: defaultAcc});
      console.log("res for submitBills is: ", res);
      view_fb_hist();
    }

    const openDonateFundsModal = () => {
      setShowDonateFundsModal({...showDonateFundsModal, show: true});
    }

    const closeDonateFundsModal = () => {
      setShowDonateFundsModal({...showDonateFundsModal, show: false});
    }

    async function get_no_of_tokens(){
      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbTokenAbi, fbTokenContractAddr, web3.eth.defaultAccount);
      const res = await contract.methods.balanceOf(defaultAcc).call();
      return res;
    }

    const closeVoteModal = () => {
      setShowVotingModal({...showVoteModal, show: false, plan_id: -1, entered_tokens: 0});
    }

    const handleSubmitTokens = async () => {
      await registerVote(showVoteModal.plan_id, showVoteModal.entered_tokens);
      await deductTokens(showVoteModal.entered_tokens);
      setShowVotingModal({...showVoteModal, show: false, plan_id: -1, entered_tokens: 0});
    }

    // showVoteModal, setShowVotingModal
    const submitVote = async(plan_id) => {
      let no_of_tokens = await get_no_of_tokens();
      
      if(no_of_tokens == 0) registerVote(plan_id, 0);
      else{
        setShowVotingModal({...showVoteModal, show: true, plan_id: plan_id, available_tokens: no_of_tokens});
      }
    }

    const deductTokens = async(no_of_tokens) => {
      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbTokenAbi, fbTokenContractAddr, web3.eth.defaultAccount);
      await contract.methods.deduct_tokens(no_of_tokens).send({ from: defaultAcc});
    }

    const registerVote = async(plan_id, tokens) => {
      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
      console.log("params: ", plan_id, fbHistId, tokens)
      const res = await contract.methods.registerVote(plan_id, fbHistId, tokens).send({ from: defaultAcc});
      console.log("res for registerVote is: ", res);
      fetch_donor_activities();
    }

    const openRatingModal = () => {
      setShowRatingModal({...showRatingModal, show: true});
    }

    const closeSubmitRatingModal = () => {
      setShowRatingModal({...showRatingModal, show: false});
    }

    const submitRating = async(rating) => {
      console.log("rating is: ", rating);
      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
      const res = await contract.methods.submitRating(fbHistId, rating).send({ from: defaultAcc});
      closeSubmitRatingModal();
      fetch_donor_activities();
      view_fb_hist();
    }

    console.log("data: ", data);

  return (
    <div>
          <Row justify = "end" style = {{padding: "1%"}} gutter={16}>
            { parseInt(data.curr_step) != 1 || data.plan_ids.length >= 1 ?
              <Col xs = {7} md = {5}>
                  <Button type="primary" onClick = { updateStep }>
                    {buttonText}
                </Button>
              </Col>
            : ""}

          { parseInt(data.curr_step) == 1 && data.plan_ids.length == 0?
            <Col xs = {4} md = {7}>
                <Button type="primary" onClick = { openCreateAPlanModal }>
                  Stop Fund Collection & create a plan
              </Button>
            </Col> : 
            parseInt(data.curr_step) == 1 && data.plan_ids.length >= 1 ?
              <Col xs = {4}>
                  <Button type="primary" onClick = { openCreateAPlanModal }>
                    Create a new Plan
                </Button>
              </Col>
            : ""
          }

          { parseInt(data.curr_step) == 5 ?
            <Col xs = {4}>
                <Button type="primary" onClick = { openRatingModal }>
                  Rate
              </Button>
            </Col>
            : ""
          } 
          </Row>
         
        { data.curr_step == 1 ?
          <Row justify = "end" style = {{padding: "1%"}} gutter={16}>
             <Col xs = {4}>
                <Button type="primary" onClick = { openDonateFundsModal }>
                  Donate Funds
              </Button>
            </Col>
          </Row>
          : ""
        }

        <Row style = {{padding: "5%", margin: "0 20px"}}>
            <Col xs = {5}  sm = {5} md = {8} >
              <p> <b> Name:  </b> {data.name}</p>
            </Col>
            <Col xs = {5}  sm = {5} md = {8} >
              <p> <b> Current Step:  </b> {data.curr_step}</p>
            </Col>
            <Col xs = {5}  sm = {5} md = {8} >
              <p> <b> Total Steps:  </b> {data.total_steps}</p>
            </Col>
            <Col xs = {5}  sm = {5} md = {8} >
                <Tag color={(data.is_active == true) ? 'green' : 'volcano'}>
                    {(data.is_active == true) ? 'Active' : 'Inactive'}
                </Tag>
            </Col>
            <Col xs = {5}  sm = {5} md = {8} >
              <p> <b> Donations raised:  </b> {`${data.money_raised} ETH`}</p>
            </Col>
            <Col xs = {5}  sm = {5} md = {8} >
                <Rate disabled value={data.rating} />
            </Col>
        </Row>

        <Row justify = "center" style = {{padding: "2%"}} gutter = {16}>
          { planData.data.map((arr, index) =>
            <Col xs = {8} key = {index}>
              <Card title= {`Plan ${arr[0].plan_id}: `}  extra={data.curr_step == "2" ? <Button type = "primary" shape = "round" size = "small" onClick={() => submitVote(arr[0].plan_id)}> Vote </Button> : "" } 
               style={data.most_voted_plan_id == arr[0].plan_id ? { borderRadius: "20px", borderColor: "#00FF00" }: { borderRadius: "20px"}} headStyle = {{borderTopLeftRadius: "20px",borderTopRightRadius: "20px" }}>
                {arr.map((item, ind) =>
                <Row key = {index + ind}>
                  <Col xs = {12} md = {12}>
                    <p> {`Item Name: ${item.name}`} </p>
                  </Col>
                  <Col xs = {12} md = {12}>
                    <p> {`Item Amount: ${item.amount}`} </p>
                  </Col>
                </Row> 
                )}
              </Card>
            </Col>
          )}
        </Row>


        <Row justify = "center" style = {{padding: "5%"}}>
          <Col xs = {24} md = {20}>
              <Table columns={columns} dataSource={donorActData.data} key = {donorActData.data.donor_name}/>
          </Col>
        </Row>

        <CreateAPlanModal visible = { showCreateAPlanModal.show } submitAPlan = {submitAPlan}  closeCreateAplanModal = {closeCreateAplanModal}/>
        <DonateFundsModal visible = { showDonateFundsModal.show } submitDonation = {submitDonation} closeDonateFundsModal = {closeDonateFundsModal}/>
        <SubmitRatingModal visible = { showRatingModal.show } submitRating = {submitRating} closeSubmitRatingModal = {closeSubmitRatingModal} />
        <Modal title = "Using a token increases the weightage by 2 voting ETH" open={showVoteModal.show} onOk={handleSubmitTokens} onCancel={closeVoteModal}>
          <>
            <Row>
              <Col xs = {7} md = {5}>
                <Input defaultValue="0" onChange={ (e) => { setShowVotingModal({...showVoteModal, entered_tokens: e.target.value })}}/>
              </Col>
            </Row>
            <Row>
              <Col>
                <Text type="success"> {`You have ${showVoteModal.available_tokens} tokens`} </Text>
              </Col>
            </Row>
          </>
        </Modal>
    </div>
  )
}

export default viewFbHistory