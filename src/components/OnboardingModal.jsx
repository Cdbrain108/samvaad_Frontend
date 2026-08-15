import { useState } from 'react';
import Icon from './Icon';

export default function OnboardingModal({ isOpen, onSubmit }) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!age || isNaN(age) || parseInt(age, 10) <= 0) {
      setError('Please enter a valid age');
      return;
    }
    setError('');
    onSubmit({ fullName: fullName.trim(), age: parseInt(age, 10) });
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <div className="om-seal" aria-hidden="true">ॐ</div>
          <h2>Welcome to Samvaad AI</h2>
          <p>Share your details so your spiritual companion can guide you personally.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-wrapper">
              <Icon name="chat" size={18} />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="age">Your Age</label>
            <div className="input-wrapper">
              <Icon name="book" size={18} />
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 28"
                min="5"
                max="120"
                required
              />
            </div>
          </div>

          <button type="submit" className="rust-button auth-button">
            Begin Spiritual Journey
          </button>
        </form>
      </div>
    </div>
  );
}
