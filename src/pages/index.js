import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { io } from "socket.io-client";
import * as Tone from 'tone';
import unmuteAudio from 'unmute-ios-audio';
import { isMobile } from 'react-device-detect';


import Layout from "../components/layout";
import Seo from "../components/seo";

const socket = io(process.env.GATSBY_SOCKET_SERVER_URL);

const IndexPage = () => {
  const baseChannel = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [oscillators, setOscillators] = useState([]);

  const initializeOscillator = () => {
    const oscillator = new Tone.Oscillator({
      type: 'sine',
      frequency: 261.6,
      phase: 0,
    });
    oscillator.volume.value = -30;

    return oscillator;
  };

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

  useEffect(() => {
    console.log("isMuted", isMuted);
    Tone.Destination.mute = isMuted;
  }, [isMuted]);

  useEffect(() => {
    unmuteAudio();

    baseChannel.current = new Tone.Channel();
    
    oscillators.map((oscillator) => oscillator.dispose());
  
    const oscillatorX = initializeOscillator();
    const waveformX = new Tone.Waveform(2048);
    oscillatorX.connect(waveformX);
    oscillatorX.start().connect(baseChannel.current);

    baseChannel.current.toDestination();

    setOscillators(...oscillators, oscillatorX);

    return () => {
      oscillators.map((oscillator) => oscillator.stop().dispose());

      if (baseChannel.current) {
        baseChannel.current.dispose();
      }
    };
  }, []);

  socket.once("connect", () => {
    console.log("Connected!");
  });

  socket.on("isSilent", (data) => {
    const { isSilent } = data;

    console.log('isSilent', isSilent);
    setIsMuted(isSilent);
  });

  return (
    <Layout>
      <Seo title="Home" />
    </Layout>
  );
}

export default IndexPage;
