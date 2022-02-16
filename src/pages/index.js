import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { io } from "socket.io-client";
import * as Tone from 'tone';
import unmuteAudio from 'unmute-ios-audio';
import { Button } from '@bomanimc/system';

import Layout from "../components/layout";
import Seo from "../components/seo";

const socket = io(process.env.GATSBY_SOCKET_SERVER_URL);

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

const randomBPM = getRandomIntInclusive(40, 200);

const IndexPage = () => {
  const baseChannel = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioContextStarted, setAudioContextStarted] = useState(false);

  socket.once("connect", () => {
    console.log("Connected!");
  });

  socket.on("isSilent", (data) => {
    const { isSilent } = data;

    console.log('isSilent', isSilent);
    setIsMuted(isSilent);
  });

  const onDisconnect = useCallback(() => () => {
    socket.off('newFrame');
    socket.disconnect();
  });

  const onStartAudioContext = () => {
    console.log("START AUDIO");
    Tone.context.resume();
    Tone.Transport.start();
    setAudioContextStarted(true);
  };

  useEffect(() => {
    console.log("Use effect", socket);
    window.addEventListener('beforeunload', onDisconnect);

    return () => {
      onDisconnect();
      window.removeEventListener('beforeunload', onDisconnect);
    };
  }, [onDisconnect]);

  useEffect(() => {
    console.log("isMuted", isMuted);
    Tone.Destination.mute = isMuted;
  }, [isMuted]);

  useEffect(() => {
    unmuteAudio();

    baseChannel.current = new Tone.Channel();

    // init the loop (to be called back every quarter note)
    const loop = new Tone.Loop((time) => {
      sampler.triggerAttackRelease("A1", "8n", time);  // 8n = duration of an 8th note
    }, "4n" );

    const sampler = new Tone.Sampler({
      urls: {
        A1: "snap.wav",
      },
      baseUrl: "/sounds/",
      onload: () => {
        loop.start(0);
      }
    }).connect(baseChannel.current);

		Tone.Transport.bpm.value = randomBPM;

    baseChannel.current.toDestination();

    return () => {
      sampler.stop().dispose();

      if (baseChannel.current) {
        baseChannel.current.dispose();
      }
    };
  }, []);

  return (
    <Layout>
      <Seo title="Home" />
      {!audioContextStarted && (
        <IndexPage.AudioContextButton
          onMouseDown={onStartAudioContext}
        >
          Activate Audio Context
        </IndexPage.AudioContextButton>
      )}
      <IndexPage.BPMDetails>{`${randomBPM}`}</IndexPage.BPMDetails>
    </Layout>
  );
}

IndexPage.BPMDetails = styled.div`
  color: white;
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
`;

IndexPage.AudioContextButton = styled(Button)``;

export default IndexPage;
