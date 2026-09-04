import React, { useState, useEffect } from 'react';
import Icon from '../Icon';
import { getVoiceCloneUrl, setVoiceCloneUrl, testVoiceCloneUrl } from '../../services/ttsService';

export default function VoiceCloneModal({ isOpen, onClose }) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'testing' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');
  const [currentActiveUrl, setCurrentActiveUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      const active = getVoiceCloneUrl();
      setUrl(active);
      setCurrentActiveUrl(active);
      if (active) {
        setStatus('success');
        setStatusMsg('Active GPU Clone Endpoint');
      } else {
        setStatus('idle');
        setStatusMsg('');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    const clean = url.trim();
    if (!clean) {
      setVoiceCloneUrl('');
      setCurrentActiveUrl('');
      setStatus('idle');
      setStatusMsg('Cleared GPU server. Using fallback audio.');
      return;
    }

    setStatus('testing');
    setStatusMsg('Connecting to GPU voice server...');

    const result = await testVoiceCloneUrl(clean);
    if (result.ok) {
      setVoiceCloneUrl(clean);
      setCurrentActiveUrl(clean);
      setStatus('success');
      const dev = result.data?.device ? ` (${result.data.device.toUpperCase()})` : '';
      setStatusMsg(`Connected successfully! Maharaj Ji's authentic cloned voice is active${dev}.`);
    } else {
      setStatus('error');
      setStatusMsg(`Connection failed: ${result.error || 'Server returned status ' + result.status}. Ensure Colab/tunnel is running.`);
    }
  };

  const handleDisconnect = () => {
    setVoiceCloneUrl('');
    setUrl('');
    setCurrentActiveUrl('');
    setStatus('idle');
    setStatusMsg('Disconnected. Now using fallback audio.');
  };

  return (
    <div className="clone-modal-overlay" onClick={onClose}>
      <div className="clone-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="clone-modal-header">
          <div className="clone-modal-title">
            <span className="clone-om-badge">ॐ</span>
            <div>
              <h3>पूज्य महाराज जी की प्रामाणिक आवाज़</h3>
              <p>Authentic Cloned Voice Setup · Chatterbox + <code>guru_voice_profile.pt</code></p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="clone-modal-body">
          {/* Current Status Banner */}
          <div className={`clone-status-banner ${currentActiveUrl ? 'is-active' : 'is-warning'}`}>
            <div className="status-indicator">
              <span className={`status-dot ${currentActiveUrl ? 'green' : 'amber'}`} />
              <strong>
                {currentActiveUrl
                  ? '🟢 पूज्य महाराज जी की क्लोन्ड आवाज़ एक्टिव है (Chatterbox GPU)'
                  : '⚠️ वर्तमान में साधारण रोबोटिक आवाज़ (Fallback) चल रही है'}
              </strong>
            </div>
            <p className="status-desc">
              {currentActiveUrl
                ? `Connected to GPU Server: ${currentActiveUrl}`
                : 'स्थानीय PC पर GPU न होने के कारण Chatterbox मॉडल लोड नहीं हो पाता। असली वाणी सुनने के लिए Google Colab GPU टनल जोड़ें।'}
            </p>
          </div>

          {/* Connection Form */}
          <div className="clone-form-section">
            <label htmlFor="clone-url-input">
              <strong>GPU Clone Server URL (Cloudflare / ngrok tunnel)</strong>
            </label>
            <div className="clone-input-row">
              <input
                id="clone-url-input"
                type="url"
                placeholder="https://xxxx.trycloudflare.com or ngrok URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                type="button"
                className="rust-button primary"
                onClick={handleTestAndSave}
                disabled={status === 'testing'}
              >
                {status === 'testing' ? 'परीक्षण जारी...' : 'Save & Connect'}
              </button>
              {currentActiveUrl && (
                <button type="button" className="rust-button secondary" onClick={handleDisconnect}>
                  Disconnect
                </button>
              )}
            </div>
            {statusMsg && (
              <p className={`clone-status-msg ${status}`}>
                {statusMsg}
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
                अपने Downloads फोल्डर में उपलब्ध <strong><code>guru_voice_cloning_chatterbox_with_samvaad_server.ipynb</code></strong> (या <code>Guru_Voice_Cloning_Live_Server.ipynb</code>) को{' '}
                <a href="https://colab.research.google.com/" target="_blank" rel="noreferrer">
                  Google Colab (Free T4 GPU)
                </a>{' '}
                पर खोलें।
              </li>
              <li>
                अपनी <strong><code>guru_voice_profile (1).pt</code></strong> फाइल अपलोड करें।
              </li>
              <li>
                <strong>Step 8 (Server Cell)</strong> चलाएं। नीचे जनरेट हुआ <strong><code>https://xxxx.trycloudflare.com</code></strong> लिंक कॉपी करके ऊपर पेस्ट करें!
              </li>
            </ol>
            <p style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: '#94a3b8' }}>
              💡 <em>Colab Note:</em> यह वही आपका हिंदी मल्टिलिंगुअल Chatterbox V3 मॉडल (Cell 4 + Cell 20) उपयोग करता है, जिसमें Cloudflare टनल जोड़ दिया गया है।
            </p>
          </div>
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
