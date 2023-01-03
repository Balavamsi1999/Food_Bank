import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space, Modal } from 'antd';
import React, {useEffect, useState} from 'react';


function CreateAPlanModal(props) {

    const onFinish = (values) => {
        console.log('Received values of form:', values);
        props.submitAPlan(values);
    };

    return (
        <Modal title = "Enter a new plan" visible={props.visible}  onCancel={props.closeCreateAplanModal} footer={[ <Button key="back" onClick={props.closeCreateAplanModal}> Cancel </Button>]}>
            <Form name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off">
            <Form.List name="plan_items">
                {(fields, { add, remove }) => (
                <>
                    {fields.map(({ key, name, ...restField }) => (
                    <Space
                        key={key}
                        style={{
                        display: 'flex',
                        marginBottom: 8,
                        }}
                        align="baseline"
                    >
                        <Form.Item
                        {...restField}
                        name={[name, 'item_name']}
                        rules={[
                            {
                            required: true,
                            message: 'Missing Food Item Name',
                            },
                        ]}
                        >
                        <Input placeholder= "Food Item Name" />
                        </Form.Item>
                        <Form.Item
                        {...restField}
                        name={[name, 'amount']}
                        rules={[
                            {
                                required: true,
                                message: 'Missing amount',
                            },() => ({
                                validator(rule, value) {
                                    console.log("value", value);
                                  if (Number.isInteger(Number(value)) == true && Number(value) > 0) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject("Not an Integer");
                                },
                              }),
                        ]}
                        >
                        <Input placeholder="Amount"/>
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                    ))}
                    <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add field
                    </Button>
                    </Form.Item>
                </>
                )}
            </Form.List>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                Submit
                </Button>
            </Form.Item>
            </Form>
        </Modal>
      );
}

export default CreateAPlanModal