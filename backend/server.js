const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const questionsFile = path.join(__dirname,"/data/questions.json");
const sessionFile = path.join(__dirname, "data/session.json");

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

app.listen(PORT, ()=>{
    console.log(`Athena backend running on http://localhost:${PORT}`);
});