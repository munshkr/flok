import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faPlay,
  faVolumeUp,
  faVolumeMute,
} from "@fortawesome/free-solid-svg-icons";
import SessionClient from "../lib/SessionClient";

type Props = {
  sessionClient: SessionClient;
  constraints?: MediaTrackConstraints;
};

const peers = new Map();
const consumers = new Set();

const Audio = (props: Props) => {
  const { sessionClient } = props;

  const [producing, setProducing] = useState(false);
  const [consuming, setConsuming] = useState(false);
  const [producers, setProducers] = useState([]);
  const [muted, setMuted] = useState(true);

  const canvasRef = useRef(null);
  // chrome needs an audio tag....
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const gainNodeRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  // fill buffer for initial canvas render, before having audiocontext
  const bufRef = useRef(new Uint8Array(2).fill(128));
  const analyserRef = useRef(null);

  useEffect(() => {
    const draw = (time) => {
      rafRef.current = requestAnimationFrame(draw);

      const canvas = canvasRef.current;
      const buffer = bufRef.current;
      const analyser = analyserRef.current;

      //update buffer with analyser
      if (analyser) analyser.getByteTimeDomainData(buffer);

      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "rgb(200, 200, 200)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgb(0, 0, 0)";
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / buffer.length;
      let x = 0;

      for (var i = 0; i < buffer.length; i++) {
        let v = buffer[i] / 128.0;
        let y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // Make sure the effect runs only once

  // hook on awareness changes
  useEffect(() => {
    const updatePeers = (clientID, prevStreaming, streaming) => {
      const pId = sessionClient._provider.room.peerId;
      peers.set(clientID, streaming);
      setProducers([...peers].filter((e) => e[1].producer).map((e) => e[0]));
      // remove unwanted streams
      if (
        prevStreaming &&
        prevStreaming.consumer &&
        prevStreaming.requestedPeerId === pId &&
        consumers.has(clientID) &&
        (!streaming.consumer || streaming.requestedPeerId !== pId)
      ) {
        consumers.delete(clientID);
        sessionClient._provider.room.webrtcConns.forEach((conn) => {
          if (conn.remotePeerId === prevStreaming.peerId) {
            conn.peer.removeTrack(
              streamRef.current.getTracks()[0],
              streamRef.current
            );
          }
        });
      }
      // add requested streams
      if (
        streaming.consumer &&
        streaming.requestedPeerId === pId &&
        !consumers.has(clientID)
      ) {
        sessionClient._provider.room.webrtcConns.forEach((conn) => {
          if (conn.remotePeerId === streaming.peerId) {
            // keep track of already added consumers
            consumers.add(clientID);
            conn.peer.addTrack(
              streamRef.current.getTracks()[0],
              streamRef.current
            );
          }
        });
      }
    };

    const awarenessListener = ({ added, removed, updated }) => {
      const awareness = sessionClient._provider.awareness;
      const pId = sessionClient._provider.room.peerId;
      const f = (clientID) => {
        const state = awareness.getStates().get(clientID);
        if (!state) {
          console.log(`no state for ${clientID}`, peers, consumers);
        } else {
          const { streaming } = state;
          if (streaming && streaming.peerId !== pId) {
            const prevStreaming = peers.get(clientID);
            if (JSON.stringify(prevStreaming) !== JSON.stringify(streaming))
              updatePeers(clientID, prevStreaming, streaming);
          }
        }
      };

      added.forEach(f);
      removed.forEach(f);
      updated.forEach(f);
    };

    if (!sessionClient) return;

    peers.clear();
    consumers.clear();
    const awareness = sessionClient._provider.awareness;
    awareness.on("change", awarenessListener);
    return () => {
      awareness.off("change", awarenessListener);
      peers.clear();
      consumers.clear();
    };
  }, [sessionClient]);

  const startAudioContext = () => {
    //run only once
    if (audioContextRef.current !== null) return;

    // start audio context and analyser
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const gain = audioContext.createGain();
    analyser.fftSize = 2048;
    gain.connect(audioContext.destination);
    if (muted) gain.gain.value = 0.0;
    // set up references
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    gainNodeRef.current = gain;
    bufRef.current = new Uint8Array(analyser.frequencyBinCount);
  };

  const onProduceClick = async () => {
    setProducing(true);
    startAudioContext();
    const awareness = sessionClient._provider.awareness;
    const peerId = sessionClient._provider.room.peerId;
    const constraints = {
      autoGainControl: false,
      echoCancellation: false,
      noiseSuppression: false,
      latency: 0,
      channelCount: 2, // stereo
      // sampleRate: 48000,
      // sampleSize: 16,
      volume: 1.0,
      ...props.constraints,
    };
    console.log("Audio constraints:", constraints);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: constraints,
    });
    streamRef.current = stream;
    awareness.setLocalStateField("streaming", {
      peerId,
      producer: true,
      consumer: false,
    });
    connectStream();
  };

  const connectStream = () => {
    const audioContext = audioContextRef.current;
    const analyser = analyserRef.current;
    const stream = streamRef.current;
    const gain = gainNodeRef.current;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    source.connect(gain);
    mediaSourceRef.current = source;
    //a chrome bug seems to need an audio object to
    // make a remote stream start working...
    audioRef.current.srcObject = stream;
  };

  const handleOnStream = (stream) => {
    streamRef.current = stream;
    connectStream();
  };

  const onConsumeClick = async (clientID) => {
    setConsuming(true);
    startAudioContext();
    const awareness = sessionClient._provider.awareness;
    const peerId = sessionClient._provider.room.peerId;
    const peer = peers.get(clientID);

    // make producer aware that we want his stream
    awareness.setLocalStateField("streaming", {
      peerId,
      consumer: true,
      producer: false,
      requestedPeerId: peer.peerId,
    });
    sessionClient._provider.room.webrtcConns.forEach((conn) => {
      if (conn.remotePeerId === peer.peerId)
        conn.peer.on("stream", handleOnStream);
    });
  };

  const onStopProducingClick = () => {
    setProducing(false);
    const awareness = sessionClient._provider.awareness;
    const peerId = sessionClient._provider.room.peerId;
    // make everyone aware that we dont stream anymore
    awareness.setLocalStateField("streaming", {
      peerId,
      producer: false,
      consumer: false,
    });
    removeStream();
  };

  const onStopConsumingClick = () => {
    setConsuming(false);
    const awareness = sessionClient._provider.awareness;
    const peerId = sessionClient._provider.room.peerId;
    // make producer aware that we dont want his stream anymore
    awareness.setLocalStateField("streaming", {
      peerId,
      producer: false,
      consumer: false,
    });
  };

  const onToggleMutedClick = () => {
    const m = !muted;
    if (audioContextRef.current)
      gainNodeRef.current.gain.setValueAtTime(
        m ? 0 : 1,
        audioContextRef.current.currentTime
      );
    setMuted(m);
  };

  const removeStream = () => {
    if (!streamRef.current) return;

    //audioRef.current.srcObject = null
    //mediaSourceRef.current.disconnect()
    //mediaSourceRef.current = null
    streamRef.current.getTracks().forEach((t) => {
      //t.stop()
      //streamRef.current.removeTrack(t)
      t.enabled = false;
    });
    //streamRef.current = null
  };
  /*
    since removing and adding back stream isnt properly solved, we just dont allow stopping a stream
    also, if we found an audio producer, we dont allow another one so only consuming is allowed
  */
  return (
    <div className="audio">
      {!producing &&
        !consuming &&
        producers.map((p) => (
          <FontAwesomeIcon
            key={p}
            onClick={() => onConsumeClick(p)}
            icon={faPlay}
            title={`Consume audio from ${p}`}
            size={"2x"}
          />
        ))}
      {
        // consuming && <FontAwesomeIcon onClick={onStopConsumingClick} icon={faStop} title={`Stop consuming  audio`} size={"2x"} />
      }
      {!producing && !consuming && producers.length === 0 && (
        <FontAwesomeIcon
          onClick={onProduceClick}
          icon={faCircle}
          title={`Produce  audio`}
          size={"2x"}
        />
      )}
      {
        //producing && <FontAwesomeIcon onClick={onStopProducingClick} icon={faStop} title={`Stop producing  audio`} size={"2x"} />
      }
      {(producing || consuming) && (
        <FontAwesomeIcon
          onClick={onToggleMutedClick}
          icon={muted ? faVolumeMute : faVolumeUp}
          size={"2x"}
        />
      )}
      <canvas ref={canvasRef} width={60} height={40} />
      <audio ref={audioRef}></audio>
      <style jsx>{`
        .audio {
          position: fixed;
          top: 0;
          z-index: 100;
          right: 0;
        }
        canvas {
          margin: 0.3em;
        }
        svg {
          margin: 0.3em;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Audio;
