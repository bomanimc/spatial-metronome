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

    const synth = new Tone.Synth().connect(baseChannel.current);
		Tone.Transport.bpm.value = 100;

    // callback for Tone.Loop
    function play_note(time) {
      synth.triggerAttackRelease("C3", "8n", time);  // 8n = duration of an 8th note
    }

    // init the loop (to be called back every quarter note)
    const loop = new Tone.Loop( play_note, "4n" );
    loop.start(0);

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
          isSelected={isMuted}
          onClick={onStartAudioContext}
        >
          Activate Audio Context
        </IndexPage.AudioContextButton>
      )}
    </Layout>
  );
}

IndexPage.AudioContextButton = styled.button`
  width: auto;
  height: auto;
`;

export default IndexPage;
