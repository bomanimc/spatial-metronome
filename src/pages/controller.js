import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { io } from "socket.io-client";
import { Button } from '@bomanimc/system';

import Layout from "../components/layout";
import Seo from "../components/seo";

const socket = io(process.env.GATSBY_SOCKET_SERVER_URL);

const ControllerPage = () => {

  
  const onMouseDown = () => {
    console.log('Setting Quiet');
    socket.emit("quiet");
  }

  const onMouseUp = () => {
    console.log('Setting Loud');
    socket.emit("loud");
  }

  return (
    <Layout>
      <Seo title="Home" />
      <ControllerPage.Button onMouseDown={onMouseDown} onMouseUp={onMouseUp}>Click to Silence</ControllerPage.Button>
    </Layout>
  );
}

ControllerPage.ColorBackground = styled.div`
  flex: 1;
  background: ${p => p.bgColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem;
`;

ControllerPage.Button = styled(Button)``;

export default ControllerPage;
