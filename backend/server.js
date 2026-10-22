const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { get } = require('http');

const questionsFile = path.join(__dirname,"/data/questions.json");
const sessionFile = path.join(__dirname, "data/session.json");

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

function getQuestions(){
    try{
        const data = fs.readFileSync(questionsFile, 'utf-8');
        return JSON.parse(data);
    }catch(err){
        return [];
    };
};



app.listen(PORT, ()=>{
    console.log(`Athena backend running on http://localhost:${PORT}`);
});