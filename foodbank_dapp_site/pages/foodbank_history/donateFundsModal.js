import React, {useEffect, useState} from 'react';
import { Button, Form, Input, Space, Modal } from 'antd';


function DonateFundsModal(props) {


    const onFinish = (values) => {
        console.log('Received values of form:', values);
        props.submitDonation(values);
    };

  return (
    <Modal title = "Donate Funds" visible={props.visible}  onCancel={props.closeDonateFundsModal} footer={[ <Button key="back" onClick={props.closeDonateFundsModal}> Cancel </Button>]}>
        <Form name="basic" onFinish={onFinish} autoComplete="off">
            <Form.Item
                label="Amount"
                name="amount"
                rules={[
                {
                    required: true,
                    message: 'please enter your Donation amount',
                },
                ]}
            >
                <Input placeholder = "Enter amount in ETH"/>
            </Form.Item>
            <Form.Item  wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
        </Modal>
  )
}

export default DonateFundsModal