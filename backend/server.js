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

app.listen(PORT, ()=>{
    console.log(`Athena backend running on http://localhost:${PORT}`);
});