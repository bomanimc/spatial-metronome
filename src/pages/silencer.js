import React, { useState, useRef } from "react";
import styled from "styled-components";
import { io } from "socket.io-client";
import { Button } from '@bomanimc/system';

import Layout from "../components/layout";
import Seo from "../components/seo";

const socket = io(process.env.GATSBY_SOCKET_SERVER_URL);

const DEFAULT_TEXT_STATE = "They are allowed to pulse.";

const ControllerPage = () => {
  const [text, setText] = useState(DEFAULT_TEXT_STATE);
  
  const onMouseDown = () => {
    console.log('Setting Quiet');
    socket.emit("quiet");
    const buttonRef = document.getElementById('screenButton');
    buttonRef.style.background = 'white';
    buttonRef.style.color = 'black';
    setText("You've silenced them all.");
  }

  const onMouseUp = () => {
    console.log('Setting Loud');
    socket.emit("loud");
    const buttonRef = document.getElementById('screenButton');
    buttonRef.style.background = 'black';
    buttonRef.style.color = 'white';
    setText(DEFAULT_TEXT_STATE);
  }

  return (
    <Layout>
      <Seo title="Silencer | Whitened Noise" />
      <ControllerPage.Button id="screenButton" onPointerDown={onMouseDown} onPointerUp={onMouseUp}>{text}</ControllerPage.Button>
    </Layout>
  );
}

ControllerPage.Button = styled(Button)`
  border: none;
  font-size: 8vw;
  padding: 1rem;
  transition: color .25s ease-in-out, background .25s ease-in-out;
  user-select: none;
`;

export default ControllerPage;
