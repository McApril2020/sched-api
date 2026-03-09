// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const users = require('./data/users');
const faculty = require('./data/faculty');
const faculty_sched = require('./data/faculty_sched');
const students = require('./data/students');

const app = express();
const PORT = 5000;

// Middleware

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
})) 
app.use(bodyParser.json());

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // In real apps, you would generate a JWT token here
    return res.status(200).json({ message: 'Login successful', user: user });
  } else {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Faculty endpoint
app.get('/faculty/:id', (req, res) => {
    const facultyID = parseInt(req.params.id);

    // Find faculty info
    const facultyInfo = faculty.find(f => f.id == facultyID);

    if (!facultyInfo) {
        return res.status(404).json({ message: 'Faculty not found' });
    }

    // Get faculty schedule
    const schedule = faculty_sched.filter(s => s.facultyID === facultyID);

    return res.status(200).json({ faculty: facultyInfo, schedule });
});

// Student endpoint
app.get('/student/:username', (req, res) => {
  const studentNo = req.params.username;

  const studentInfo = students.find(f => f.username == studentNo)

  if (!studentInfo) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const stu = students.filter(s => s.username == studentNo);

  return res.status(200).json({ student: studentInfo, stu });
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});