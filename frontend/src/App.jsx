import React, { useState, useRef } from "react";
import "./App.css";

const MOCK_QUESTIONS = [
  {
    id: 1,
    question: "What is the primary function of the CPU in a computer?",
    options: [
      "Storing persistent files and software",
      "Executing instructions and processing data",
      "Managing display output to monitors",
      "Powering internal cooling systems",
    ],
  },
  {
    id: 2,
    question: "Which of the following is a non-volatile memory type?",
    options: ["RAM", "Cache", "ROM", "Registers"],
  },
  {
    id: 3,
    question: "Which data structure operates on a First-In, First-Out (FIFO) basis?",
    options: ["Stack", "Queue", "Binary Tree", "Graph"],
  },
];

function App() {
  const [cameraReady, setCameraReady] = useState(false);
  const [fullscreenReady, setFullscreenReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [started, setStarted] = useState(false);

  // Exam MCQ State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});

  const videoRef = useRef(null);
  const imageCaptureRef = useRef(null);

  const getCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const track = stream.getVideoTracks()[0];
      if (window.ImageCapture && track) {
        imageCaptureRef.current = new ImageCapture(track);
      }

      setCameraReady(true);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Failed to get camera access. Please check device permissions.");
    }
  };

  const setFullScreen = async () => {
    try {
      if (window.electronAPI?.setFullScreen) {
        await window.electronAPI.setFullScreen();
      } else {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      }
      setFullscreenReady(true);
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const startExam = () => {
    setStarted(true);
  };

  const handleGoToTest = async () => {
    if (window.electronAPI?.showRulesDialog) {
      const agreed = await window.electronAPI.showRulesDialog();
      if (agreed) {
        startExam();
      }
    } else {
      setShowModal(true);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestionIndex]: option,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      alert("Exam completed! (Submission will connect in next step)");
    }
  };

  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === MOCK_QUESTIONS.length - 1;

  return (
    <div className="page-container">
      {/* Video Preview: remains visible top-right when active */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cameraReady ? "video-preview" : "hidden-video"}
      />

      {!started ? (
        <>
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
              <button
                type="button"
                className="btn-dark"
                onClick={getCamera}
                disabled={cameraReady}
              >
                {cameraReady ? "Camera Configured" : "Get Camera Access"}
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
              <button
                type="button"
                className="btn-dark"
                onClick={setFullScreen}
                disabled={fullscreenReady}
              >
                {fullscreenReady ? "Full Screen Active" : "Switch to FullScreen"}
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="bottom-actions">
            <div className="action-row">
              <button
                type="button"
                className="btn-dark"
                onClick={handleGoToTest}
                disabled={!cameraReady || !fullscreenReady}
              >
                Go To Test
              </button>
            </div>
            <div className="time-left">Time Left : HH:MM:SS</div>
          </div>
        </>
      ) : (
        /* Active MCQ Exam Card */
        <div className="card-container">
          <div className="exam-header">
            <span className="question-badge">
              Question {currentQuestionIndex + 1} of {MOCK_QUESTIONS.length}
            </span>
            <span className="exam-timer">Time Left: HH:MM:SS</span>
          </div>

          <p className="question-text">{currentQuestion.question}</p>

          <div className="options-container">
            {currentQuestion.options.map((option, idx) => {
              const isSelected =
                selectedOptions[currentQuestionIndex] === option;
              return (
                <label
                  key={idx}
                  className={`option-label ${isSelected ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={`mcq-option-${currentQuestion.id}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleOptionSelect(option)}
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>

          <button
            type="button"
            className="btn-dark btn-full"
            onClick={handleNextQuestion}
          >
            {isLastQuestion ? "Submit Exam" : "Next Question"}
          </button>
        </div>
      )}

      {/* React Fallback Modal */}
      {showModal && !started && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Exam Rules & Instructions</h2>
              <p>Exam Rules & Guidelines</p>
            </div>
            <ol className="rules-list">
              <li>Make sure your webcam remains on throughout the test.</li>
              <li>Stay in full-screen mode. Do not switch tabs or minimize the window.</li>
              <li>Do not leave your seat or look away from the screen for prolonged periods.</li>
              <li>No external help, electronic devices, or secondary monitors are permitted.</li>
              <li>Ensure a quiet, well-lit environment without background voices.</li>
            </ol>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-dark"
                onClick={() => {
                  setShowModal(false);
                  startExam();
                }}
              >
                I Agree & Start Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
