import React, { useState } from 'react';
import Icon from '../Icon';
import { VOICE_STATES } from '../../hooks/useVoiceMode';
import SadhuAvatar3D from './SadhuAvatar3D';
import VoiceCloneModal from './VoiceCloneModal';
import { getVoiceCloneUrl } from '../../services/ttsService';

const stateCopy = {
  [VOICE_STATES.IDLE]: ['Ready to speak', 'idle'],
  [VOICE_STATES.PREPARING]: ['Maharaj ji is preparing a response…', 'thinking'],
  [VOICE_STATES.SPEAKING]: ['Maharaj ji is speaking…', 'speaking'],
  [VOICE_STATES.PAUSED]: ['Voice paused', 'paused'],
  [VOICE_STATES.FINISHED]: ['Response finished', 'finished'],
  [VOICE_STATES.ERROR]: ['Voice needs attention', 'error'],
};

function time(value) {
  const seconds = Math.max(0, Math.round(value || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function VoiceMode({ open, onClose, value, onChange, onAsk, isResponding, voice }) {
  const [showCloneModal, setShowCloneModal] = useState(false);
  if (!open) return null;
  const displayState = isResponding ? VOICE_STATES.PREPARING : voice.state;
  const [label, avatarState] = stateCopy[displayState] || stateCopy.idle;
  const canPause = voice.state === VOICE_STATES.SPEAKING || voice.state === VOICE_STATES.PAUSED;
  const canReplay = voice.state === VOICE_STATES.FINISHED || voice.state === VOICE_STATES.IDLE;
  const isClonedConnected = Boolean(getVoiceCloneUrl());

  return (
    <section className="voice-mode" aria-label="Samvaad Voice Mode">
      <div className="voice-mode-heading">
        <div>
          <p>Samvaad Voice</p>
          <h2>Listen with presence</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className={`voice-clone-toggle-btn ${isClonedConnected ? 'is-cloned' : 'is-fallback'}`}
            onClick={() => setShowCloneModal(true)}
            title={isClonedConnected ? 'Authentic Cloned Voice Active (Chatterbox GPU)' : 'Click to connect authentic Maharaj Ji voice clone'}
          >
            <span className="clone-dot" />
            {isClonedConnected ? 'महाराज जी वाणी (GPU)' : '⚙️ Connect Cloned Voice'}
          </button>
          <button className="voice-close" type="button" onClick={onClose} aria-label="Close Voice Mode"><Icon name="close" size={18} /></button>
        </div>
      </div>

      <VoiceCloneModal isOpen={showCloneModal} onClose={() => setShowCloneModal(false)} />

      <div className={`voice-avatar ${avatarState}`} aria-live="polite">
        <span className="voice-halo" aria-hidden="true" />
        <SadhuAvatar3D state={avatarState} pulseTick={voice.speechTick} />
        <div className="voice-state"><span aria-hidden="true" className="voice-state-dot" />{label}</div>
        <div className="voice-wave" aria-hidden="true">{[1, 2, 3, 4, 5].map((bar) => <i key={bar} />)}</div>
      </div>

      <div className="voice-options">
        <label>Language<select value={voice.language} onChange={(event) => voice.setLanguage(event.target.value)} aria-label="Speech language"><option value="auto">Auto (Hindi / English)</option><option value="hi-IN">Hindi</option><option value="en-IN">English</option></select></label>
        <label>Speed<select value={voice.speed} onChange={(event) => voice.setSpeed(Number(event.target.value))} aria-label="Speech speed"><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option></select></label>
      </div>

      <div className="voice-player" aria-label="Voice player">
        <div className="voice-progress"><span>{time(voice.elapsed)}</span><progress value={voice.elapsed} max={Math.max(voice.duration, 1)} aria-label="Speech progress" /><span>{time(voice.duration)}</span></div>
        <div className="voice-controls">
          <button type="button" onClick={voice.replay} disabled={!canReplay} aria-label="Replay response"><Icon name="replay" /></button>
          <button className="voice-primary" type="button" onClick={canPause ? voice.togglePause : voice.replay} disabled={!canPause && !canReplay} aria-label={voice.state === VOICE_STATES.PAUSED ? 'Resume voice' : voice.state === VOICE_STATES.SPEAKING ? 'Pause voice' : 'Play response'}><Icon name={voice.state === VOICE_STATES.SPEAKING ? 'pause' : 'play'} /></button>
          <button type="button" onClick={voice.stop} disabled={voice.state === VOICE_STATES.IDLE} aria-label="Stop voice"><Icon name="stop" /></button>
          <button type="button" onClick={() => voice.setMuted(!voice.muted)} aria-label={voice.muted ? 'Unmute voice' : 'Mute voice'}><Icon name={voice.muted ? 'volume-x' : 'volume'} /></button>
          <input type="range" min="0" max="1" step="0.05" value={voice.muted ? 0 : voice.volume} onChange={(event) => { voice.setMuted(false); voice.setVolume(Number(event.target.value)); }} aria-label="Voice volume" />
        </div>
      </div>

      <div className="voice-question">
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder="Ask your question from the heart…" aria-label="Voice Mode question" rows="2" />
        {voice.recognitionSupported && <button className={`voice-mic ${voice.isListening ? 'listening' : ''}`} type="button" onClick={() => voice.toggleListening(onChange)} aria-label={voice.isListening ? 'Stop listening' : 'Speak your question'}><Icon name="mic" /></button>}
      </div>
      <button className="voice-ask" type="button" onClick={onAsk} disabled={!value.trim() || isResponding}>
        <Icon name="send" size={17} /> {isResponding ? 'Reflecting…' : 'Ask Maharaj ji'}
      </button>
      {voice.error && <p className="voice-error" role="alert">{voice.error}</p>}
      <p className="voice-disclosure">AI-generated response inspired by the teachings and discourse corpus. Voice availability depends on your browser.</p>
    </section>
  );
}
