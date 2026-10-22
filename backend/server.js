const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const questionsFile = path.join(__dirname,"/data/questions.json");
const sessionFile = path.join(__dirname, "data/session.json");

const app = express();
const PORT = 5002;
app.use(cors());
app.use(express.json());

function getQuestions(){
    try{
        const questions = fs.readFileSync(questionsFile, 'utf-8');
        return JSON.parse(questions);
    }catch(err){
        return [];
    };
};

function getSessions(){
    try{
        const sessions = fs.readFileSync(sessionFile, "utf-8");
        return JSON.parse(sessions);
    }catch(err){
        return {};
    };
};

function saveSessions(sessions){
    fs.writeFileSync(sessionFile, JSON.stringify(sessions, null, 2));
};



app.post('/exam/start', (req,res)=>{
    const {candidateName = 'Candidate', candidateId = 'CAND-01', durationMinutes = 15} = req.body;
    const questions = getQuestions();
    const sessionId = `session_${Date.now()}`;
    const startTime = Date.now();
    const endTime = startTime + durationMinutes * 60 * 1000;

    const sessions = getSessions();
    sessions[sessionId] = {
        sessionId,
        candidateName,
        candidateId,
        durationMinutes,
        startTime,
        endTime,
        status: 'in-progress',
        answers: {},
        violations : [],
        score: null
    };
    saveSessions(sessions);

    res.json({
        success: true,
        sessionId,
        candidateName,
        candidateId,
        durationMinutes,
        startTime,
        endTime,
        totalQuestions: questions.length
    });
});

app.get('/exam/mcq', (req,res)=>{
    const questions = getQuestions();
    const questionsWithoutAnswers = questions.map(({id, question, options})=>({
        id,
        question,
        options
    }));
    res.json({success: true, questions : questionsWithoutAnswers});
});

app.post('/exam/answer', (req,res)=>{
    const {sessionId, questionId, selectedOption} = req.body;
    const sessions = getSessions();
    const session = sessions[sessionId];

    if(!session || session.status !== 'in-progress'){
        return res.status(400).json({success: false, message: 'Invalid or Clodes session.'});
    };

    const questions = getQuestions();
    const question = questions.find(q => q.id === Number(questionId));
    if(!question){
        return res.status(404).json({success: false, message: 'Question not found.'});
    };

    session.answers[questionId] = {
        selectedOption,
        isCorrect : question.correctAnswer === selectedOption,
        answeredAt: Date.now()
    };
    saveSessions(sessions);
    res.json({success: true, questionId});
});

app.post('/exam/submit', (req,res)=>{
    const {sessionId} = req.body;
    const sessions = getSessions();
    const session = sessions[sessionId];

    if(!session){
        return res.status(404).json({success: false, message: 'Session not found.'});
    };
    const question = getQuestions();
    const totalQuestions = questions.length;
    let correctCount = 0;
    let attemptedCount = 0;

    questions.forEach(q => {
        const ans = session.answers[q.id];
        if(ans && ans.selectedOption){
            attemptedCount++;
            if(ans.isCorrect){
                correctCount++;
            };
        };
    });
    const wrongCount = attemptedCount - correctCount;
    const percentage = totalQuestions > 0 ? Math.round((correctCount/totalQuestions)*100) : 0;

    session.status = 'submitted';
    session.submittedAt = Date.now();
    session.score = {
        totalQuestions,
        attemptedCount,
        correctCount,
        wrongCount,
        percentage
    };

    saveSessions(sessions);
    res.json({success: true, score: session.score});
});

app.listen(PORT, ()=>{
    console.log(`Athena backend running on http://localhost:${PORT}`);
});