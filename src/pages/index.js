import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { io } from "socket.io-client";
import * as Tone from 'tone';
import unmuteAudio from 'unmute-ios-audio';
import { isMobile } from 'react-device-detect';
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

  const [oscillators, setOscillators] = useState([]);

  socket.once("connect", () => {
    console.log("Connected!");
  });

  socket.on("isSilent", (data) => {
    const { isSilent } = data;

    console.log('isSilent', isSilent);
    setIsMuted(isSilent);
  });

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

  const onStartAudioContext = () => {
    console.log("START AUDIO");
    // Tone.context.resume();
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
  }, []);

  useEffect(() => {
    console.log("isMuted", isMuted);
    Tone.Destination.mute = isMuted;
  }, [isMuted]);

  useEffect(() => {
    unmuteAudio();

    baseChannel.current = new Tone.Channel();

    // const synth = new Tone.Synth().connect(baseChannel.current);

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

    // // callback for Tone.Loop
    // function play_note(time) {
    //   sampler.triggerAttackRelease("A1", "8n", time);  // 8n = duration of an 8th note
    // }

    // // init the loop (to be called back every quarter note)
    // const loop = new Tone.Loop( play_note, "4n" );
    // loop.start(0);

    // //this will start the player on every quarter note
    // Tone.Transport.setInterval(function(time){
    //   player.start(time);
    //   console.log("PLAY NOTE");
    // }, "4n");
    // //start the Transport for the events to start
    // Tone.Transport.start();

		// Tone.Buffer.onload = function() {
    //   console.log("LOADED");
		// 	//this will start the player on every quarter note
		// 	Tone.Transport.setInterval(function(time){
		// 	  player.start(time);
    //     console.log("PLAY NOTE");
		// 	}, "4n");
		// 	//start the Transport for the events to start
		// 	Tone.Transport.start();
		// };
    
    oscillators.map((oscillator) => oscillator.dispose());
  
    // const oscillatorX = initializeOscillator();
    // const waveformX = new Tone.Waveform(2048);
    // oscillatorX.connect(waveformX);
    // oscillatorX.start().connect(baseChannel.current);

    baseChannel.current.toDestination();

    // setOscillators(...oscillators, oscillatorX);

    return () => {
      oscillators.map((oscillator) => oscillator.stop().dispose());

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
