import React from 'react';
import './App.css';

function App() {
  return (
    <div className="page-container">
      {/* Header */}
      <div className="header-section">
        <h1>Hello Student!</h1>
        <p className="subtitle">
          Kindly Allow the following Permissions to Start the test:
        </p>
      </div>

      {/* Permissions Card */}
      <div className="card-container">
        {/* Item 1: Camera Permission */}
        <div className="permission-item">
          <div className="permission-info">
            <div className="icon-box">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div className="permission-text">
              <h3>Configure Camera</h3>
              <p>Kindly configure Camera to attempt quiz/contests.</p>
            </div>
          </div>
          <button type="button" className="btn-dark">
            Get Camera Access
          </button>
        </div>

        <div className="divider" />

        {/* Item 2: Fullscreen Permission */}
        <div className="permission-item">
          <div className="permission-info">
            <div className="icon-box">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </div>
            <div className="permission-text">
              <h3>Switch to full screen</h3>
              <p>Kindly close all tabs and switch to full screen.</p>
            </div>
          </div>
          <button type="button" className="btn-dark">
            Switch to FullScreen
          </button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bottom-actions">
        <div className="action-row">
          <button type="button" className="btn-dark">
            Go To Test
          </button>
        </div>
        <div className="time-left">Time Left : HH:MM:SS</div>
      </div>
    </div>
  );
}

export default App;
