import React, {useEffect, useState} from 'react';
import { Button, Form, Input, Space, Modal, Rate } from 'antd';

function SubmitRatingModal(props) {

  const [value, setValue] = useState(0);

  const handleOk = () => {
    props.submitRating(value);
  }

  return (
    <Modal title = "Submit Rating" visible={props.visible}  onCancel={props.closeSubmitRatingModal} onOk={handleOk} >
       <Rate onChange={setValue} value={value} />
    </Modal>
  )
}

export default SubmitRatingModal