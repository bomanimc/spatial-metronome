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

const BACKGROUND_COLOR_OPTIONS = [
  `#ff3838`,
  `#ff9f1a`,
  `#fff200`,
  `#32ff7e`,
  `#7efff5`,
  `#18dcff`,
  `#cd84f1`,
]

const IndexPage = () => {
  const baseChannel = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioContextStarted, setAudioContextStarted] = useState(false);
  // const [colorIndex, setColorIndex] = useState(0);
  const bgColorRef = useRef();
  const colorIndexRef = useRef(0);

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
      colorIndexRef.current = (colorIndexRef.current + 1) % BACKGROUND_COLOR_OPTIONS.length;
      bgColorRef.current.style.background = BACKGROUND_COLOR_OPTIONS[colorIndexRef.current];
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
      sampler.dispose();

      if (baseChannel.current) {
        baseChannel.current.dispose();
      }
    };
  }, []);

  return (
    <Layout>
      <Seo title="Home" />
      <IndexPage.ColorBackground ref={bgColorRef}>
      {audioContextStarted ? 
        <IndexPage.BPMDetails>{`${randomBPM}`}</IndexPage.BPMDetails>
        : (
          <IndexPage.AudioContextButton
            onMouseDown={onStartAudioContext}
          >
            Touch to Start
          </IndexPage.AudioContextButton>
        )
      }
      </IndexPage.ColorBackground>
    </Layout>
  );
}

IndexPage.BPMDetails = styled.div`
  color: white;
  font-size: 8rem;
  mix-blend-mode: exclusion;
`;

IndexPage.ColorBackground = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
`;

IndexPage.AudioContextButton = styled(Button)`
  width: 50%;
  border-radius: 1rem;
`;

export default IndexPage;
