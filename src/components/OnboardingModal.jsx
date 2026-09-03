import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

const fieldStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const fieldItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
};

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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) return;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="onboarding-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="onboarding-card"
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          >
            <div className="onboarding-header">
              <div className="om-seal" aria-hidden="true">ॐ</div>
              <h2>Welcome to Samvaad AI</h2>
              <p>Share your details so your spiritual companion can guide you personally.</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="auth-error"
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="auth-form">
              <motion.div
                className="form-group"
                variants={fieldStagger}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={fieldItem}>
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
                </motion.div>

                <motion.div variants={fieldItem}>
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
                </motion.div>
              </motion.div>

              <motion.button
                type="submit"
                className="rust-button auth-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Begin Spiritual Journey
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
