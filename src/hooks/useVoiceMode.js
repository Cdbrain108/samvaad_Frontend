import { useCallback, useEffect, useRef, useState } from 'react';
import { generateSpeech } from '../services/ttsService';
import { splitSpeechText } from '../utils/speechText';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const VOICE_STATES = {
  IDLE: 'idle',
  PREPARING: 'preparing',
  SPEAKING: 'speaking',
  PAUSED: 'paused',
  FINISHED: 'finished',
  ERROR: 'error',
};

export default function useVoiceMode() {
  const [state, setState] = useState(VOICE_STATES.IDLE);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('auto');
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speechTick, setSpeechTick] = useState(0);
  const [speechSupported] = useState(() => 'speechSynthesis' in window);
  const [recognitionSupported] = useState(() => Boolean(SpeechRecognition));
  const utteranceRef = useRef(null);
  const chunksRef = useRef([]);
  const chunkIndexRef = useRef(0);
  const elapsedRef = useRef(0);
  const durationRef = useRef(0);
  const timerRef = useRef(null);
  const activeTextRef = useRef('');
  const recognitionRef = useRef(null);

  const clearTimer = useCallback(() => {
    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    chunksRef.current = [];
    chunkIndexRef.current = 0;
    setState(VOICE_STATES.IDLE);
    setElapsed(0);
  }, [clearTimer]);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = window.setInterval(() => {
      elapsedRef.current += 0.25;
      setElapsed(Math.min(elapsedRef.current, durationRef.current || elapsedRef.current));
      setSpeechTick((tick) => tick + 1);
    }, 250);
  }, [clearTimer]);

  const speakChunk = useCallback((index) => {
    const text = chunksRef.current[index];
    if (!text) {
      clearTimer();
      setElapsed(durationRef.current);
      setState(VOICE_STATES.FINISHED);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'auto' ? (/[^\u0000-\u007f]/.test(activeTextRef.current) ? 'hi-IN' : 'en-IN') : language;
    utterance.rate = speed;
    utterance.volume = muted ? 0 : volume;
    utterance.onstart = () => {
      setState(VOICE_STATES.SPEAKING);
      startTimer();
    };
    utterance.onend = () => {
      chunkIndexRef.current += 1;
      speakChunk(chunkIndexRef.current);
    };
    utterance.onerror = (event) => {
      if (event.error === 'canceled' || event.error === 'interrupted') return;
      clearTimer();
      setError('आवाज़ तैयार नहीं हो सकी। कृपया पुनः प्रयास करें।');
      setState(VOICE_STATES.ERROR);
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [clearTimer, language, muted, speed, startTimer, volume]);

  const speak = useCallback(async (answer) => {
    if (!speechSupported) {
      setError('Voice playback is not supported in this browser.');
      setState(VOICE_STATES.ERROR);
      return;
    }
    stop();
    setError('');
    setState(VOICE_STATES.PREPARING);
    try {
      const speech = await generateSpeech(answer, { language });
      activeTextRef.current = speech.text;
      chunksRef.current = splitSpeechText(speech.text);
      chunkIndexRef.current = 0;
      elapsedRef.current = 0;
      setElapsed(0);
      const estimatedDuration = Math.max(1, Math.ceil((speech.text.trim().split(/\s+/).length / 145) * 60 / speed));
      durationRef.current = estimatedDuration;
      setDuration(estimatedDuration);
      speakChunk(0);
    } catch (cause) {
      setError('I couldn’t prepare the voice response. Please try again.');
      setState(VOICE_STATES.ERROR);
    }
  }, [language, speakChunk, speechSupported, speed, stop]);

  const togglePause = useCallback(() => {
    if (state === VOICE_STATES.SPEAKING) {
      window.speechSynthesis.pause();
      clearTimer();
      setState(VOICE_STATES.PAUSED);
    } else if (state === VOICE_STATES.PAUSED) {
      window.speechSynthesis.resume();
      startTimer();
      setState(VOICE_STATES.SPEAKING);
    }
  }, [clearTimer, startTimer, state]);

  const replay = useCallback(() => {
    if (activeTextRef.current) speak(activeTextRef.current);
  }, [speak]);

  const toggleListening = useCallback((onTranscript) => {
    if (!SpeechRecognition) return;
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en-IN' ? 'en-IN' : 'hi-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join(' ');
      onTranscript(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setError('Microphone input is unavailable. You can type your question instead.');
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, language]);

  useEffect(() => () => {
    clearTimer();
    window.speechSynthesis?.cancel();
    recognitionRef.current?.stop();
  }, [clearTimer]);

  return { state, error, language, setLanguage, speed, setSpeed, volume, setVolume, muted, setMuted, elapsed, duration, isListening, speechSupported, recognitionSupported, speechTick, speak, stop, togglePause, replay, toggleListening };
}
