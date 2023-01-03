import React, {useEffect} from 'react';
import { Button, Form, Input, Radio, message, Space, Row, Col, Modal } from 'antd';
import { useRouter } from 'next/router';
import {fbContractAddr, ethEndpoint, fbAbi} from '../../constants/contract_addresses';
const Web3 = require('web3');

function StartFundCollectionModal(props) {
    const [form] = Form.useForm();
    const router = useRouter();
    const fb_addr = props.fbAddress;
    console.log("fb_addr", fb_addr);
  
    const onFinish = async (values) => {
  
      const name = values.name;
      const web3 = new Web3(Web3.givenProvider || ethEndpoint);
      const accounts = await web3.eth.requestAccounts();
      const defaultAcc = accounts[0];
      web3.eth.defaultAccount = defaultAcc;
      let contract = new web3.eth.Contract(fbAbi, fbContractAddr, web3.eth.defaultAccount);
      const res = await contract.methods.createFBHistory(name, fb_addr).send({from: defaultAcc});
      // TODO handle failure case... res is not getting updated
      console.log("res is: ", res);
      message.success('Created Successfully!');
      props.closeFundCollectionModal();
    };
  
    const onFinishFailed = (errorInfo) => {
      console.log('Failed:', errorInfo);
      message.error('Submit failed!');
    };

   
  
    return (
        <Modal title = "Start Fund Collection" visible={props.show}  onCancel={props.closeFundCollectionModal} footer={[ <Button key="back" onClick={props.closeFundCollectionModal}> Cancel </Button>]}>
            <Row justify="center" style = {{padding: "5%", margin: "20px"}}>
               <Col xs = {24}  sm = {11} md = {10} lg = {10}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item name="name" label="name" rules={[ { required: true } ]}>
                            <Input placeholder="Enter Fund collection name" />
                        </Form.Item>
    
                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Modal>
    )
}

export default StartFundCollectionModal