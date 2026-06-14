"use client";

import { Clipboard, Mic, Sparkles, Trophy, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type InterfaceState = "idle" | "connecting" | "active" | "unlocked";
type TranscriptMessage = { id: string; role: "kid" | "ai"; text: string };
type CopyKey = "web" | "sandbox" | "future" | null;

const childProfile = { age: 13, interests: "Gaming and Minecraft", location: "India" };
const sessionEndpoint = "http://localhost:4000/api/session";
const realtimeSdpEndpoint = "https://openai.com";

function readClientSecret(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  const directSecret = record.client_secret;
  if (typeof directSecret === "string") return directSecret;
  if (directSecret && typeof directSecret === "object") {
    const value = (directSecret as Record<string, unknown>).value;
    if (typeof value === "string") return value;
  }
  const token = record.token ?? record.ephemeralToken ?? record.clientToken;
  return typeof token === "string" ? token : "";
}

function transcriptFromRealtimeEvent(event: Record<string, unknown>): TranscriptMessage | null {
  const eventType = typeof event.type === "string" ? event.type : "";
  const item = event.item && typeof event.item === "object" ? (event.item as Record<string, unknown>) : null;
  const role = item?.role === "user" ? "kid" : item?.role === "assistant" ? "ai" : null;
  const content = Array.isArray(item?.content) ? (item.content as Record<string, unknown>[]) : [];
  const textPart = content.find((part) => typeof part.text === "string" || typeof part.transcript === "string");
  const itemText = typeof textPart?.text === "string" ? textPart.text : typeof textPart?.transcript === "string" ? textPart.transcript : "";

  if (eventType === "conversation.item.create" && role && itemText) {
    return { id: crypto.randomUUID(), role, text: itemText };
  }

  const delta = event.delta ?? event.text ?? event.transcript;
  if (typeof delta === "string" && delta.trim()) {
    return { id: crypto.randomUUID(), role: eventType.includes("input") ? "kid" : "ai", text: delta };
  }

  return null;
}

export default function CuriosityWalletPage() {
  const [interfaceState, setInterfaceState] = useState<InterfaceState>("idle");
  const [orbScale, setOrbScale] = useState(1);
  const [conceptName, setConceptName] = useState("Curiosity Wallet");
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
  const [copiedKey, setCopiedKey] = useState<CopyKey>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const localAnalyserRef = useRef<AnalyserNode | null>(null);
  const remoteAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const stopVisualizer = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
  }, []);

  const startVisualizer = useCallback(() => {
    stopVisualizer();
    const localBins = new Uint8Array(128);
    const remoteBins = new Uint8Array(128);

    const tick = () => {
      let energy = 0;
      if (localAnalyserRef.current) {
        localAnalyserRef.current.getByteFrequencyData(localBins);
        energy += localBins.reduce((sum, value) => sum + value, 0) / localBins.length / 255;
      }
      if (remoteAnalyserRef.current) {
        remoteAnalyserRef.current.getByteFrequencyData(remoteBins);
        energy += remoteBins.reduce((sum, value) => sum + value, 0) / remoteBins.length / 255;
      }
      setOrbScale(1 + Math.min(0.34, energy * 0.55));
      animationRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, [stopVisualizer]);

  const handleRealtimeEvent = useCallback((rawData: MessageEvent["data"]) => {
    const event = JSON.parse(typeof rawData === "string" ? rawData : new TextDecoder().decode(rawData)) as Record<string, unknown>;
    const transcript = transcriptFromRealtimeEvent(event);
    if (transcript) setTranscripts((current) => [...current.slice(-20), transcript]);

    if (event.type === "response.done") {
      const response = event.response && typeof event.response === "object" ? (event.response as Record<string, unknown>) : null;
      const output = Array.isArray(response?.output) ? (response.output as Record<string, unknown>[]) : [];
      const toolCall = output.find((item) => item.name === "unlockCuriosityWallet");
      if (toolCall) {
        const argumentsText = typeof toolCall.arguments === "string" ? toolCall.arguments : "{}";
        const parsedArguments = JSON.parse(argumentsText) as { conceptName?: string };
        setConceptName(parsedArguments.conceptName ?? "Curiosity Wallet");
        setInterfaceState("unlocked");
        stopVisualizer();
      }
    }
  }, [stopVisualizer]);

  useEffect(() => {
    return () => {
      stopVisualizer();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      peerConnectionRef.current?.close();
      void audioContextRef.current?.close();
    };
  }, [stopVisualizer]);

  const startThinking = useCallback(async () => {
    setInterfaceState("connecting");
    const sessionResponse = await fetch(sessionEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: childProfile.interests, profile: childProfile }),
    });
    const token = readClientSecret(await sessionResponse.json());
    if (!token) throw new Error("No ephemeral Realtime client token returned by backend.");

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    const dataChannel = peerConnection.createDataChannel("oai-events");
    dataChannel.addEventListener("message", (event) => handleRealtimeEvent(event.data));

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (!remoteStream) return;
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
      const remoteSource = audioContext.createMediaStreamSource(remoteStream);
      const remoteAnalyser = audioContext.createAnalyser();
      remoteAnalyser.fftSize = 256;
      remoteSource.connect(remoteAnalyser);
      remoteAnalyserRef.current = remoteAnalyser;
      startVisualizer();
    };

    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = localStream;
    localStream.getAudioTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    const localSource = audioContext.createMediaStreamSource(localStream);
    const localAnalyser = audioContext.createAnalyser();
    localAnalyser.fftSize = 256;
    localSource.connect(localAnalyser);
    localAnalyserRef.current = localAnalyser;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    const sdpResponse = await fetch(realtimeSdpEndpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/sdp" },
      body: offer.sdp,
    });
    const answer = await sdpResponse.text();
    await peerConnection.setRemoteDescription({ type: "answer", sdp: answer });
    setInterfaceState("active");
    startVisualizer();
  }, [handleRealtimeEvent, startVisualizer]);

  const copyPrompt = async (key: Exclude<CopyKey, null>, prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1400);
  };

  const promptOne = `THE WEB KEY: I am ${childProfile.age}, I live in ${childProfile.location}, and I love ${childProfile.interests}. Explain the unlocked concept '${conceptName}' using one website-sized quest, one surprising fact from India, and one Minecraft-style challenge I can try today.`;
  const promptTwo = `THE SANDBOX KEY: Turn '${conceptName}' into a Minecraft build plan for a ${childProfile.age}-year-old who enjoys ${childProfile.interests}. Give me blocks, rules, redstone-like logic, and a 20-minute experiment.`;
  const promptThree = `THE FUTURE KEY: Imagine I am building a future career from ${childProfile.interests} in ${childProfile.location}. Show how '${conceptName}' becomes a superpower, with three missions and one invention idea.`;

  const statusText = interfaceState === "idle" ? "🎙️ Start Thinking" : interfaceState === "connecting" ? "Opening voice tunnel..." : interfaceState === "active" ? "Voice tunnel active" : `${conceptName} unlocked`;
  const orbColor = interfaceState === "connecting" ? "from-violet-950 to-fuchsia-700" : interfaceState === "active" ? "from-cyan-400 to-blue-500" : interfaceState === "unlocked" ? "from-emerald-500 to-teal-400" : "from-slate-950 to-slate-800";

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#10213f_0%,#020617_44%,#000_100%)] px-6 py-8 text-white">
      <audio ref={remoteAudioRef} autoPlay playsInline hidden />
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-8">
        <div className="text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100"><Sparkles size={16} /> Curiosity Wallet</p>
          <h1 className="text-4xl font-black tracking-tight md:text-7xl">Unlock ideas by talking.</h1>
          <p className="mt-4 max-w-2xl text-slate-300">A gamified WebRTC voice portal that listens, responds, and drops prompt loot when a concept clicks.</p>
        </div>

        <button
          type="button"
          onClick={startThinking}
          disabled={interfaceState !== "idle"}
          className="group relative grid h-64 w-64 place-items-center rounded-full outline-none transition duration-700 disabled:cursor-default"
          style={{ transform: interfaceState === "active" ? `scale(${orbScale})` : interfaceState === "unlocked" ? "scale(0.72)" : "scale(1)" }}
        >
          <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${orbColor} opacity-90 shadow-[0_0_80px_rgba(34,211,238,0.24)]`} />
          <span className={`absolute -inset-5 rounded-full border border-cyan-200/20 ${interfaceState === "connecting" ? "animate-spin border-t-violet-300" : ""}`} />
          <span className="relative flex flex-col items-center gap-3 text-center text-lg font-bold"><Mic />{statusText}</span>
        </button>

        {interfaceState === "active" && (
          <section className="h-72 w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur">
            {transcripts.length === 0 && <p className="text-center text-slate-400">Listening for the first thought...</p>}
            {transcripts.map((message) => (
              <div key={message.id} className={`mb-4 rounded-2xl p-4 ${message.role === "kid" ? "ml-auto bg-cyan-400/10 text-cyan-50" : "mr-auto bg-violet-400/10 text-violet-50"}`}>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{message.role === "kid" ? "Kid" : "AI"}</p>
                <p className="mt-1 text-sm leading-6">{message.text}</p>
              </div>
            ))}
          </section>
        )}

        {interfaceState === "unlocked" && (
          <section className="animate-in slide-in-from-bottom-8 w-full max-w-5xl rounded-[2rem] border border-emerald-300/30 bg-emerald-950/40 p-6 shadow-[0_30px_120px_rgba(16,185,129,0.25)] backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3"><Trophy className="text-emerald-300" /><div><p className="text-sm uppercase tracking-[0.4em] text-emerald-200">Prompt loot drop</p><h2 className="text-3xl font-black">{conceptName}</h2></div></div>
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-sm"><h3 className="mb-3 flex items-center gap-2 font-sans text-lg font-bold"><Zap size={18} /> Prompt 1 · The Web</h3><p className="min-h-40 whitespace-pre-wrap text-emerald-50">{promptOne}</p><button onClick={() => copyPrompt("web", promptOne)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 font-sans text-sm font-bold text-emerald-950"><Clipboard size={16} />{copiedKey === "web" ? "✓ Copied" : "Copy key"}</button></article>
              <article className="rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-sm"><h3 className="mb-3 flex items-center gap-2 font-sans text-lg font-bold"><Zap size={18} /> Prompt 2 · The Sandbox</h3><p className="min-h-40 whitespace-pre-wrap text-emerald-50">{promptTwo}</p><button onClick={() => copyPrompt("sandbox", promptTwo)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 font-sans text-sm font-bold text-emerald-950"><Clipboard size={16} />{copiedKey === "sandbox" ? "✓ Copied" : "Copy key"}</button></article>
              <article className="rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-sm"><h3 className="mb-3 flex items-center gap-2 font-sans text-lg font-bold"><Zap size={18} /> Prompt 3 · The Future</h3><p className="min-h-40 whitespace-pre-wrap text-emerald-50">{promptThree}</p><button onClick={() => copyPrompt("future", promptThree)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 font-sans text-sm font-bold text-emerald-950"><Clipboard size={16} />{copiedKey === "future" ? "✓ Copied" : "Copy key"}</button></article>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
