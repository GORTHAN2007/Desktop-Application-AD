# Backend Server

Lightweight Express REST API service managing exam questions, session states, answers, and scoring.

## Endpoints

### 1. `POST /exam/start`
Starts a new exam session.
- **Request Body**:
  ```json
  {
    "candidateName": "Candidate Name",
    "candidateId": "CAND-101",
    "durationMinutes": 60
  }
  ```
- **Response**: `{ success: true, sessionId: "..." }`

### 2. `GET /exam/mcq`
Returns the list of multiple choice questions (with answer keys omitted for security).

### 3. `POST /exam/answer`
Records candidate choice for a specific question.
- **Request Body**:
  ```json
  {
    "sessionId": "...",
    "questionId": 1,
    "selectedOption": "Selected Answer"
  }
  ```

### 4. `POST /exam/submit`
Computes results and saves session scores.
- **Request Body**: `{ "sessionId": "..." }`
- **Response**:
  ```json
  {
    "success": true,
    "score": {
      "totalQuestions": 5,
      "attemptedCount": 5,
      "correctCount": 4,
      "wrongCount": 1,
      "percentage": 80
    }
  }
  ```

## Running the Server

```bash
# Start server on port 5002
node server.js
```
