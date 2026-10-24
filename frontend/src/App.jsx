import React, { useState, useRef, useEffect } from "react";
import "./App.css";

const BASE_URL = "http://localhost:5002";

function formatTime(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

function App() {
  const [cameraReady, setCameraReady] = useState(false);
  const [fullscreenReady, setFullscreenReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [started, setStarted] = useState(false);

  // Exam State
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [timeDisplay, setTimeDisplay] = useState("01:00:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const imageCaptureRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Timer effect: polls Electron get-time every second once exam starts
  useEffect(() => {
    if (!started) return;

    timerIntervalRef.current = setInterval(async () => {
      if (window.electronAPI?.getRemainingTime) {
        const ms = await window.electronAPI.getRemainingTime();
        setTimeDisplay(formatTime(ms));
        if (ms <= 0) {
          clearInterval(timerIntervalRef.current);
          handleSubmit(true); // auto-submit on timeout
        }
      }
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [started, sessionId]);

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

  const startExam = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Start the Electron timer
      if (window.electronAPI?.startTest) {
        await window.electronAPI.startTest();
      }

      // 2. POST /exam/start -> get sessionId
      const startRes = await fetch(`${BASE_URL}/exam/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: "Test User",
          candidateId: "student-1",
          durationMinutes: 60,
        }),
      });
      const startData = await startRes.json();
      if (!startData.success) throw new Error("Failed to start session.");
      setSessionId(startData.sessionId);

      // 3. GET /exam/mcq -> get questions
      const mcqRes = await fetch(`${BASE_URL}/exam/mcq`);
      const mcqData = await mcqRes.json();
      if (!mcqData.success) throw new Error("Failed to fetch questions.");
      setQuestions(mcqData.questions);

      setStarted(true);
    } catch (err) {
      console.error("Start exam error:", err);
      setError("Could not connect to the exam server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToTest = async () => {
    if (window.electronAPI?.showRulesDialog) {
      const agreed = await window.electronAPI.showRulesDialog();
      if (agreed) await startExam();
    } else {
      setShowModal(true);
    }
  };

  const handleNext = async () => {
    if (!selectedOption) {
      alert("Please select an option before proceeding.");
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    setLoading(true);

    try {
      // POST /exam/answer
      await fetch(`${BASE_URL}/exam/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          selectedOption,
        }),
      });

      const isLastQuestion = currentQuestionIndex === questions.length - 1;

      if (!isLastQuestion) {
        // Move to next question
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        // Submit exam
        await handleSubmit(false);
      }
    } catch (err) {
      console.error("Answer submission error:", err);
      alert("Failed to save answer. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (isTimeout = false) => {
    clearInterval(timerIntervalRef.current);
    setLoading(true);
    try {
      const submitRes = await fetch(`${BASE_URL}/exam/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const submitData = await submitRes.json();
      if (submitData.success) {
        setResult(submitData.score);
        setStarted(false);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit exam. Please contact the exam administrator.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="page-container">
      {/* Video Preview: always visible once camera is ready */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cameraReady ? "video-preview" : "hidden-video"}
      />

      {/* ── RESULTS SCREEN ── */}
      {result && (
        <div className="card-container">
          <h2 className="result-title">Exam Submitted</h2>
          <div className="result-grid">
            <div className="result-item">
              <span className="result-label">Total Questions</span>
              <span className="result-value">{result.totalQuestions}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Attempted</span>
              <span className="result-value">{result.attemptedCount}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Correct</span>
              <span className="result-value result-correct">{result.correctCount}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Wrong</span>
              <span className="result-value result-wrong">{result.wrongCount}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Score</span>
              <span className="result-value">{result.percentage}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ── EXAM SCREEN ── */}
      {started && currentQuestion && (
        <div className="card-container">
          <div className="exam-header">
            <span className="question-badge">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="exam-timer">Time Left: {timeDisplay}</span>
          </div>

          <p className="question-text">{currentQuestion.question}</p>

          <div className="options-container">
            {currentQuestion.options.map((option, idx) => (
              <label
                key={idx}
                className={`option-label ${selectedOption === option ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name={`mcq-option-${currentQuestion.id}`}
                  value={option}
                  checked={selectedOption === option}
                  onChange={() => setSelectedOption(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <button
            type="button"
            className="btn-dark btn-full"
            onClick={handleNext}
            disabled={loading || !selectedOption}
          >
            {loading ? "Saving..." : isLastQuestion ? "Submit Exam" : "Next Question"}
          </button>
        </div>
      )}

      {/* ── PERMISSIONS SCREEN ── */}
      {!started && !result && (
        <>
          <div className="header-section">
            <h1>Hello Student!</h1>
            <p className="subtitle">
              Kindly Allow the following Permissions to Start the test:
            </p>
          </div>

          <div className="card-container">
            {/* Camera */}
            <div className="permission-item">
              <div className="permission-info">
                <div className="icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div className="permission-text">
                  <h3>Configure Camera</h3>
                  <p>Kindly configure Camera to attempt quiz/contests.</p>
                </div>
              </div>
              <button type="button" className="btn-dark" onClick={getCamera} disabled={cameraReady}>
                {cameraReady ? "Camera Configured" : "Get Camera Access"}
              </button>
            </div>

            <div className="divider" />

            {/* Fullscreen */}
            <div className="permission-item">
              <div className="permission-info">
                <div className="icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </div>
                <div className="permission-text">
                  <h3>Switch to full screen</h3>
                  <p>Kindly close all tabs and switch to full screen.</p>
                </div>
              </div>
              <button type="button" className="btn-dark" onClick={setFullScreen} disabled={fullscreenReady}>
                {fullscreenReady ? "Full Screen Active" : "Switch to FullScreen"}
              </button>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="bottom-actions">
            <div className="action-row">
              <button
                type="button"
                className="btn-dark"
                onClick={handleGoToTest}
                disabled={!cameraReady || !fullscreenReady || loading}
              >
                {loading ? "Starting..." : "Go To Test"}
              </button>
            </div>
            <div className="time-left">Time Left : 01:00:00</div>
          </div>
        </>
      )}

      {/* React Fallback Rules Modal */}
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
              <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-dark"
                onClick={async () => {
                  setShowModal(false);
                  await startExam();
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
