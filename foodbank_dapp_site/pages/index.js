import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router';
import React, {useEffect, useState} from 'react';
import { Image as AntImage, Row, Col, Tag } from 'antd';
import {SyncOutlined} from '@ant-design/icons';




export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if(!router.isReady) return;
    
    window.setTimeout(() => {
      router.push(`homepage`)
    }, 5000);
    
  }, [router.isReady])
 
  
  return (
    <>
     <Row justify = "center" style = {{padding: "1%"}}>
        <Tag icon={<SyncOutlined spin />} color="purple">
           You will be redirected shortly.
        </Tag>
     </Row>

      <Row justify = "center">
        <Col xs = {10} md = {6} >
           <h1 style = {{fontFamily: "Cursive"}}> UB CSE 526 Project </h1>
        </Col>
      </Row>
      <Row justify = "center">
        <Col xs = {10}>
        </Col>
        <Col xs = {10}>
          <h3 style = {{fontFamily: "Cursive"}}> - By Vamsi and Sasidhar </h3>
        </Col>
      </Row>

      <Row justify = "space-around" style = {{padding: "1%"}}>
        <Col xs = {11}>
          <AntImage
            height = {500}
            // width = {500}
            src={'/images/ub_1.png'}
          />
        </Col>
     
        <Col xs = {11}>
          <AntImage
            height = {500}
            // width = {500}
            src={'/images/ub_2.png'}
          />
        </Col>
      </Row>
    </>
    
  )
}
