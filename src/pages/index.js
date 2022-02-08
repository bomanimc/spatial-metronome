import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { io } from "socket.io-client";

import Layout from "../components/layout";
import Seo from "../components/seo";

const socket = io(process.env.GATSBY_SOCKET_SERVER_URL);

const IndexPage = () => {
  const [color, setColor] = useState(undefined);

  const onDisconnect = useCallback(() => () => {
    socket.off('newFrame');
    socket.disconnect();
  });

  useEffect(() => {
    console.log("Use effect", socket);
    window.addEventListener('beforeunload', onDisconnect);

    return () => {
      onDisconnect();
      window.removeEventListener('beforeunload', onDisconnect);
    };
  }, []);

  socket.once("connect", () => {
    console.log("Connected!");
  });

  socket.once("newFrame", (data) => {
    const { isSilent } = data;

    console.log('isSilent', isSilent);
  });

  return (
    <Layout>
      <Seo title="Home" />
      <IndexPage.ColorBackground bgColor={color} />
    </Layout>
  );
}

IndexPage.ColorBackground = styled.div`
  flex: 1;
  background: ${p => p.bgColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem;
`;

export default IndexPage;
