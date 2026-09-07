import React, { useState, useEffect } from 'react';
import Icon from '../Icon';
import { getVoiceCloneUrl, setVoiceCloneUrl, testVoiceCloneUrl } from '../../services/ttsService';
import { getOracleUrl, setOracleUrl, testOracleModelUrl } from '../../services/guruService';

export default function VoiceCloneModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('model'); // 'model' | 'voice'

  // Deep Model States
  const [oracleUrl, setOracleUrlInput] = useState('');
  const [oracleStatus, setOracleStatus] = useState('idle'); // 'idle' | 'testing' | 'success' | 'error'
  const [oracleStatusMsg, setOracleStatusMsg] = useState('');
  const [currentOracleUrl, setCurrentOracleUrl] = useState('');
  const [oracleModelName, setOracleModelName] = useState('');

  // Voice Clone States
  const [voiceUrl, setVoiceUrl] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('idle');
  const [voiceStatusMsg, setVoiceStatusMsg] = useState('');
  const [currentVoiceUrl, setCurrentVoiceUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Load Voice Clone
      const activeVoice = getVoiceCloneUrl();
      setVoiceUrl(activeVoice);
      setCurrentVoiceUrl(activeVoice);
      if (activeVoice) {
        setVoiceStatus('success');
        setVoiceStatusMsg('Active GPU Clone Endpoint');
      } else {
        setVoiceStatus('idle');
        setVoiceStatusMsg('');
      }

      // Load Deep Model (Oracle / ngrok)
      const activeOracle = getOracleUrl();
      setOracleUrlInput(activeOracle);
      setCurrentOracleUrl(activeOracle);
      if (activeOracle) {
        setOracleStatus('success');
        setOracleStatusMsg('Active Deep Model Server (Q8_0 GGUF)');
      } else {
        setOracleStatus('idle');
        setOracleStatusMsg('');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSaveOracle = async () => {
    const clean = oracleUrl.trim();
    if (!clean) {
      setOracleUrl('');
      setCurrentOracleUrl('');
      setOracleStatus('idle');
      setOracleStatusMsg('Cleared custom Oracle URL. Will use default tunnel.');
      return;
    }

    setOracleStatus('testing');
    setOracleStatusMsg('Testing connection to Deep Model Q8_0 server...');

    const result = await testOracleModelUrl(clean);
    if (result.ok) {
      setOracleUrl(clean);
      setCurrentOracleUrl(clean);
      setOracleModelName(result.model || '');
      setOracleStatus('success');
      setOracleStatusMsg(`Connected successfully! Model: ${result.model || 'ai-guru-v10-4-Q8_0.gguf'}`);
    } else {
      setOracleStatus('error');
      setOracleStatusMsg(`Connection failed: ${result.error || 'Server returned HTTP ' + result.status}. Ensure your tunnel/llama.cpp server is running.`);
    }
  };

  const handleResetOracle = () => {
    const defaultUrl = 'https://immature-zen-earthen.ngrok-free.dev';
    setOracleUrl(defaultUrl);
    setOracleUrlInput(defaultUrl);
    setCurrentOracleUrl(defaultUrl);
    setOracleStatus('idle');
    setOracleStatusMsg('Reset to default active ngrok tunnel.');
  };

  const handleTestAndSaveVoice = async () => {
    const clean = voiceUrl.trim();
    if (!clean) {
      setVoiceCloneUrl('');
      setCurrentVoiceUrl('');
      setVoiceStatus('idle');
      setVoiceStatusMsg('Cleared GPU server. Using fallback audio.');
      return;
    }

    setVoiceStatus('testing');
    setVoiceStatusMsg('Connecting to GPU voice server...');

    const result = await testVoiceCloneUrl(clean);
    if (result.ok) {
      setVoiceCloneUrl(clean);
      setCurrentVoiceUrl(clean);
      setVoiceStatus('success');
      const dev = result.data?.device ? ` (${result.data.device.toUpperCase()})` : '';
      setVoiceStatusMsg(`Connected successfully! Maharaj Ji's authentic cloned voice is active${dev}.`);
    } else {
      setVoiceStatus('error');
      setVoiceStatusMsg(`Connection failed: ${result.error || 'Server returned status ' + result.status}. Ensure Colab/tunnel is running.`);
    }
  };

  const handleDisconnectVoice = () => {
    setVoiceCloneUrl('');
    setVoiceUrl('');
    setCurrentVoiceUrl('');
    setVoiceStatus('idle');
    setVoiceStatusMsg('Disconnected. Now using fallback audio.');
  };

  return (
    <div className="clone-modal-overlay" onClick={onClose}>
      <div className="clone-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="clone-modal-header">
          <div className="clone-modal-title">
            <span className="clone-om-badge">ॐ</span>
            <div>
              <h3>AI Guru सर्वर व मॉडल सेटिंग्स</h3>
              <p>Fine-Tuned Q8_0 Model & Cloned Voice Architecture</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(0, 0, 0, 0.25)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('model')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: activeTab === 'model' ? 'rgba(217, 119, 6, 0.18)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'model' ? '2px solid #f59e0b' : '2px solid transparent',
              color: activeTab === 'model' ? '#f59e0b' : '#9ca3af',
              fontWeight: activeTab === 'model' ? '700' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.86rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span>🧘</span> Deep Model (LLM Q8_0)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: activeTab === 'voice' ? 'rgba(217, 119, 6, 0.18)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'voice' ? '2px solid #f59e0b' : '2px solid transparent',
              color: activeTab === 'voice' ? '#f59e0b' : '#9ca3af',
              fontWeight: activeTab === 'voice' ? '700' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.86rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span>🎙️</span> महाराज जी Voice (TTS)
          </button>
        </div>

        <div className="clone-modal-body">
          {activeTab === 'model' ? (
            <>
              {/* Deep Model Status Banner */}
              <div className={`clone-status-banner ${currentOracleUrl ? 'is-active' : 'is-warning'}`}>
                <div className="status-indicator">
                  <span className={`status-dot ${currentOracleUrl ? 'green' : 'amber'}`} />
                  <strong>
                    {currentOracleUrl
                      ? '🟢 Deep Mode: Dedicated Fine-Tuned Q8_0 Server Active'
                      : '⚠️ कोई समर्पित मॉडल टनल सेट नहीं है (Groq फ़ालबैक चलेगा)'}
                  </strong>
                </div>
                <p className="status-desc">
                  {currentOracleUrl
                    ? `Connected Server: ${currentOracleUrl} (${oracleModelName || 'ai-guru-v10-4-Q8_0.gguf'})`
                    : 'Deep Mode का उत्तर सीधे आपके फाइन-ट्यून्ड मॉडल (Q8_0) से प्राप्त करने के लिए टनल URL जोड़ें।'}
                </p>
              </div>

              {/* Connection Form for Deep Model */}
              <div className="clone-form-section">
                <label htmlFor="oracle-url-input">
                  <strong>Deep Model Server URL (ngrok / Cloudflare Tunnel / Localhost)</strong>
                </label>
                <div className="clone-input-row">
                  <input
                    id="oracle-url-input"
                    type="url"
                    placeholder="https://xxxx.ngrok-free.dev or tunnel URL"
                    value={oracleUrl}
                    onChange={(e) => setOracleUrlInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="rust-button primary"
                    onClick={handleTestAndSaveOracle}
                    disabled={oracleStatus === 'testing'}
                  >
                    {oracleStatus === 'testing' ? 'जाँच जारी...' : 'Save & Test'}
                  </button>
                  <button
                    type="button"
                    className="rust-button secondary"
                    onClick={handleResetOracle}
                    title="Reset to default ngrok tunnel"
                  >
                    Reset
                  </button>
                </div>
                {oracleStatusMsg && (
                  <p className={`clone-status-msg ${oracleStatus}`}>
                    {oracleStatusMsg}
                  </p>
                )}
              </div>

              {/* Deep Model Info Box */}
              <div className="clone-guide-box">
                <h4>🧘 Deep Mode और Fine-Tuned Model की विशेषताएँ</h4>
                <ul style={{ margin: '0.4rem 0 0 1.2rem', padding: 0, fontSize: '0.84rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                  <li>
                    <strong>आध्यात्मिक प्रामाणिकता:</strong> पूज्य श्री प्रेमानंद जी महाराज के संपूर्ण वृंदावन सत्संग वचनों और एकांतिक वार्तालाप पर विशेष रूप से फाइन-ट्यून किया गया <code>ai-guru-v10-4-Q8_0.gguf</code> मॉडल।
                  </li>
                  <li>
                    <strong>चिंतन विंडो (Deliberation Window):</strong> उत्तर आने से पूर्व शास्त्रीय मंथन व सिद्धांत विचार का सजीव दर्शन।
                  </li>
                  <li>
                    <strong>सजीव स्ट्रीमिंग (Live Streaming):</strong> जैसे-जैसे मॉडल टोकन उत्पन्न करता है, वह वास्तविक समय में स्क्रीन पर प्रकट होता है।
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Voice Clone Status Banner */}
              <div className={`clone-status-banner ${currentVoiceUrl ? 'is-active' : 'is-warning'}`}>
                <div className="status-indicator">
                  <span className={`status-dot ${currentVoiceUrl ? 'green' : 'amber'}`} />
                  <strong>
                    {currentVoiceUrl
                      ? '🟢 पूज्य महाराज जी की क्लोन्ड आवाज़ एक्टिव है (Chatterbox GPU)'
                      : '⚠️ वर्तमान में साधारण रोबोटिक आवाज़ (Fallback) चल रही है'}
                  </strong>
                </div>
                <p className="status-desc">
                  {currentVoiceUrl
                    ? `Connected to GPU Server: ${currentVoiceUrl}`
                    : 'स्थानीय PC पर GPU न होने के कारण Chatterbox मॉडल लोड नहीं हो पाता। असली वाणी सुनने के लिए Google Colab GPU टनल जोड़ें।'}
                </p>
              </div>

              {/* Connection Form for Voice Clone */}
              <div className="clone-form-section">
                <label htmlFor="clone-url-input">
                  <strong>GPU Clone Server URL (Cloudflare / ngrok tunnel)</strong>
                </label>
                <div className="clone-input-row">
                  <input
                    id="clone-url-input"
                    type="url"
                    placeholder="https://xxxx.trycloudflare.com or ngrok URL"
                    value={voiceUrl}
                    onChange={(e) => setVoiceUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    className="rust-button primary"
                    onClick={handleTestAndSaveVoice}
                    disabled={voiceStatus === 'testing'}
                  >
                    {voiceStatus === 'testing' ? 'परीक्षण जारी...' : 'Save & Connect'}
                  </button>
                  {currentVoiceUrl && (
                    <button type="button" className="rust-button secondary" onClick={handleDisconnectVoice}>
                      Disconnect
                    </button>
                  )}
                </div>
                {voiceStatusMsg && (
                  <p className={`clone-status-msg ${voiceStatus}`}>
                    {voiceStatusMsg}
                  </p>
                )}
              </div>

              {/* Audio Comparison Previews */}
              <div className="clone-audio-previews">
                <h4>🎧 वाणी की प्रामाणिकता की तुलना करें (Audio Comparison)</h4>
                <div className="preview-grid">
                  <div className="preview-card">
                    <div className="preview-info">
                      <strong>🪷 क्लोन्ड वॉइस सैंपल (Chatterbox Cloned)</strong>
                      <small>Generated via <code>guru_voice_profile (1).pt</code></small>
                    </div>
                    <audio controls src="/audio/guru_cloned_profile_sample.wav" preload="metadata" />
                  </div>
                  <div className="preview-card">
                    <div className="preview-info">
                      <strong>📜 मूल सत्संग रिकॉर्डिंग (Reference Audio)</strong>
                      <small>Authentic Vrindavan Satsang recording of Maharaj Ji</small>
                    </div>
                    <audio controls src="/audio/guru_authentic_reference.wav" preload="metadata" />
                  </div>
                </div>
              </div>

              {/* 1-Minute Colab Guide */}
              <div className="clone-guide-box">
                <h4>⚡ 1 मिनट में Google Colab पर अपना Voice Server कैसे चलाएं?</h4>
                <ol>
                  <li>
                    अपने Downloads फोल्डर में उपलब्ध <strong><code>guru_voice_cloning_chatterbox_with_samvaad_server.ipynb</code></strong> को{' '}
                    <a href="https://colab.research.google.com/" target="_blank" rel="noreferrer">
                      Google Colab (Free T4 GPU)
                    </a>{' '}
                    पर खोलें।
                  </li>
                  <li>
                    अपनी <strong><code>guru_voice_profile (1).pt</code></strong> फाइल अपलोड करें।
                  </li>
                  <li>
                    <strong>Step 8 (Server Cell)</strong> चलाएं और जनरेट हुआ <strong><code>https://xxxx.trycloudflare.com</code></strong> लिंक यहाँ पेस्ट करें!
                  </li>
                </ol>
              </div>
            </>
          )}
        </div>

        <div className="clone-modal-footer">
          <button type="button" className="rust-button secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
