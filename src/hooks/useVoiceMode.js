import { useCallback, useEffect, useRef, useState } from 'react';
import { generateSpeech } from '../services/ttsService';
import { splitSpeechText } from '../utils/speechText';
import { getSharedAudio, playUnlocked, stopShared, unlockAudio } from '../utils/audioUnlock';

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
  const [isCloned, setIsCloned] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState('');
  const [speechSupported] = useState(() => 'speechSynthesis' in window || 'Audio' in window);
  const [recognitionSupported] = useState(() => Boolean(SpeechRecognition));

  
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);
  const currentProviderRef = useRef('browser-speech');
  const chunksRef = useRef([]);
  const chunkIndexRef = useRef(0);
  const elapsedRef = useRef(0);
  const durationRef = useRef(0);
  const timerRef = useRef(null);
  const activeTextRef = useRef('');
  const recognitionRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();

    // Detach handlers and rewind, but keep the unlocked element alive. Throwing
    // it away would mean re-unlocking on iOS before every single utterance.
    stopShared();
    audioRef.current = null;

    // Stop Browser speech
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    chunksRef.current = [];
    chunkIndexRef.current = 0;
    setActiveSpeech('');
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
    utterance.rate = speed * 0.90;
    utterance.pitch = 0.72; // Deep, reverent masculine pitch — never high-pitched woman
    utterance.volume = muted ? 0 : volume;

    try {
      const allVoices = window.speechSynthesis?.getVoices?.() || [];
      const maleVoice = allVoices.find(v => (v.lang.includes('hi') || v.lang.includes('IN')) && /(madhur|hemant|ravi|male|man)/i.test(v.name))
                     || allVoices.find(v => /(madhur|hemant|male|david|mark)/i.test(v.name))
                     || allVoices.find(v => (v.lang.includes('hi') || v.lang.includes('IN')) && !/(swara|kalpana|zira|female|woman)/i.test(v.name));
      if (maleVoice) {
        utterance.voice = maleVoice;
      }
    } catch (e) {}
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
    // iOS only allows playback to begin inside the synchronous turn of a user
    // gesture, and the TTS fetch below takes seconds. Prime the shared element
    // now, while we are still inside the tap that triggered this call.
    const unlocking = unlockAudio();

    stop();
    setError('');
    setActiveSpeech(answer);
    setState(VOICE_STATES.PREPARING);

    try {
      await unlocking;
      const speech = await generateSpeech(answer, { language, speed });
      activeTextRef.current = speech.text;
      currentProviderRef.current = speech.provider;
      setIsCloned(Boolean(speech.isCloned));

      if (speech.provider === 'backend-neural' && speech.audioUrl) {
        // High-Fidelity Guru Neural Speech Path — routed through the shared,
        // already-unlocked element rather than a fresh `new Audio()`, which iOS
        // would treat as a brand-new source needing its own gesture.
        const audio = getSharedAudio();
        audioRef.current = audio;

        const fallbackToBrowserSpeech = () => {
          chunksRef.current = splitSpeechText(speech.text);
          chunkIndexRef.current = 0;
          speakChunk(0);
        };

        const started = await playUnlocked(speech.audioUrl, {
          volume: muted ? 0 : volume,
          onLoadedMetadata: () => {
            const dur = Math.ceil(audio.duration) || 5;
            durationRef.current = dur;
            setDuration(dur);
          },
          onPlay: () => {
            setState(VOICE_STATES.SPEAKING);
            clearTimer();
            timerRef.current = window.setInterval(() => {
              if (audioRef.current) {
                const cur = audioRef.current.currentTime;
                elapsedRef.current = cur;
                setElapsed(cur);
                setSpeechTick((tick) => tick + 1);
              }
            }, 200);
          },
          onEnded: () => {
            clearTimer();
            setElapsed(durationRef.current);
            setActiveSpeech('');
            setState(VOICE_STATES.FINISHED);
          },
          onError: () => {
            console.warn('Backend audio failed during playback, falling back to browser speech...');
            fallbackToBrowserSpeech();
          },
        });

        if (!started) {
          // Refused outright — almost always iOS without a trusted gesture.
          // speechSynthesis has a laxer policy, so it is the better fallback
          // here than surfacing an error the user can do nothing about.
          console.warn('[voice] Neural audio blocked by autoplay policy, using browser speech.');
          fallbackToBrowserSpeech();
        }
      } else {
        // Browser Speech Fallback Path
        chunksRef.current = splitSpeechText(speech.text);
        chunkIndexRef.current = 0;
        elapsedRef.current = 0;
        setElapsed(0);
        const estimatedDuration = Math.max(1, Math.ceil((speech.text.trim().split(/\s+/).length / 145) * 60 / speed));
        durationRef.current = estimatedDuration;
        setDuration(estimatedDuration);
        speakChunk(0);
      }
    } catch (cause) {
      console.error('Speech synthesis error:', cause);
      setError('I couldn’t prepare the voice response. Please try again.');
      setState(VOICE_STATES.ERROR);
    }
  }, [clearTimer, language, muted, speakChunk, speed, stop, volume]);

  const togglePause = useCallback(() => {
    if (currentProviderRef.current === 'backend-neural' && audioRef.current) {
      if (state === VOICE_STATES.SPEAKING) {
        audioRef.current.pause();
        clearTimer();
        setState(VOICE_STATES.PAUSED);
      } else if (state === VOICE_STATES.PAUSED) {
        audioRef.current.play();
        setState(VOICE_STATES.SPEAKING);
      }
      return;
    }

    // Browser Speech Synthesis pause/resume
    if (state === VOICE_STATES.SPEAKING) {
      window.speechSynthesis?.pause();
      clearTimer();
      setState(VOICE_STATES.PAUSED);
    } else if (state === VOICE_STATES.PAUSED) {
      window.speechSynthesis?.resume();
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

  const playDefaultGreeting = useCallback(async () => {
    // Called from a tap, so prime inside the gesture turn before anything else.
    const unlocking = unlockAudio();
    stop();

    currentProviderRef.current = 'backend-neural';
    setIsCloned(true);
    setActiveSpeech('राधे राधे बच्चा...');
    setState(VOICE_STATES.SPEAKING);

    await unlocking;

    const audio = getSharedAudio();
    audioRef.current = audio;

    // BASE_URL keeps this correct when the app is served from a subpath — a
    // leading-slash path would 404 on GitHub Pages, which serves from /<repo>/.
    const greetingUrl = `${import.meta.env.BASE_URL}audio/radhe_radhe_baccha.mp3`;

    const started = await playUnlocked(greetingUrl, {
      volume: muted ? 0 : volume,
      onLoadedMetadata: () => {
        const dur = Math.ceil(audio.duration) || 2;
        durationRef.current = dur;
        setDuration(dur);
      },
      onPlay: () => {
        console.log('[Audio] Opening blessing playback started: राधे राधे बच्चा...');
        setState(VOICE_STATES.SPEAKING);
        clearTimer();
        timerRef.current = window.setInterval(() => {
          if (audioRef.current) {
            const cur = audioRef.current.currentTime;
            elapsedRef.current = cur;
            setElapsed(cur);
            setSpeechTick((tick) => tick + 1);
          }
        }, 200);
      },
      onEnded: () => {
        clearTimer();
        setElapsed(durationRef.current);
        setActiveSpeech('');
        setState(VOICE_STATES.IDLE);
      },
      onError: () => {
        setState(VOICE_STATES.IDLE);
      },
    });

    if (!started) {
      // The blessing is decorative — if the browser refuses it, fall quiet
      // rather than surfacing an error the user can do nothing about.
      setActiveSpeech('');
      setState(VOICE_STATES.IDLE);
    }
  }, [clearTimer, muted, stop, volume]);

  useEffect(() => () => {
    clearTimer();
    stopShared();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
    recognitionRef.current?.stop();
  }, [clearTimer]);

  return {
    state,
    error,
    language,
    setLanguage,
    speed,
    setSpeed,
    volume,
    setVolume,
    muted,
    setMuted,
    elapsed,
    duration,
    isListening,
    speechSupported,
    recognitionSupported,
    speechTick,
    isCloned,
    activeSpeech,
    // Expose the unlock so a component can prime audio on any early tap (the
    // Voice Mode button, the onboarding dismiss) rather than waiting for the
    // first speak() — the earlier this runs, the more reliable iOS is.
    primeAudio: unlockAudio,
    speak,
    stop,
    playDefaultGreeting,
    togglePause,
    replay,
    toggleListening,
  };
}
