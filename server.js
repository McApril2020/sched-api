// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require("dotenv").config();

const users = require('./data/users');
const faculty = require('./data/faculty');
const faculty_sched = require('./data/faculty_sched');
const students = require('./data/students');

const app = express();
const PORT = 5000;

const SECRET_KEY = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

// Middleware

app.use(cors({
    origin: ['http://localhost:3000', 'http://192.168.1.56:3000', 'https://april-attendance-miniapp.netlify.app'],
    credentials: true,
})) 
app.use(bodyParser.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  });
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign(
    { username: user.username, isFaculty: user.isFaculty },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  return res.status(200).json({
    message: "Login successful",
    user: user,
    token: token
  });
});

const crypto = require("crypto");

let activeSessions = {};

app.post('/faculty/:id/generate-qr', authenticateToken, (req, res) => {
  const facultyID = parseInt(req.params.id);
  const { subject, sched, timeStart, timeEnd } = req.body;

  const now = new Date();
  const classStart = new Date(`${sched}T${timeStart}`);
  const classEnd = new Date(`${sched}T${timeEnd}`);

  if (now < classStart || now > classEnd) {
    return res.status(400).json({ message: "Class is not active." });
  }

  const sessionId = crypto.randomBytes(8).toString("hex");

  activeSessions[sessionId] = {
    facultyID,
    subject,
    sched,
    timeStart,
    timeEnd,
    room: req.body.room,
    courseCode: req.body.courseCode,
    description: req.body.description,
    expiresAt: classEnd.getTime()
  };

  return res.status(200).json({
    sessionId,
    link: `https://april-attendance-miniapp.netlify.app/attendance/${sessionId}`
  });
});

app.get('/faculty/:id', authenticateToken, (req, res) => {
    const facultyID = parseInt(req.params.id);

    const facultyInfo = faculty.find(f => f.id == facultyID);

    if (!facultyInfo) {
        return res.status(404).json({ message: 'Faculty not found' });
    }

    const schedule = faculty_sched.filter(s => s.facultyID === facultyID);

    return res.status(200).json({ faculty: facultyInfo, schedule });
});

app.get('/student/:username', authenticateToken, (req, res) => {
  const studentNo = req.params.username;

  const studentInfo = students.find(f => f.username == studentNo)

  if (!studentInfo) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const stu = students.filter(s => s.username == studentNo);

  return res.status(200).json({ student: studentInfo, stu });
});

app.get('/session/:sessionId', authenticateToken, (req, res) => {
  const sessionId = req.params.sessionId;
  const session = activeSessions[sessionId];

  console.log(req.user)

  if (!session) return res.status(404).json({ message: "Session not found", type: 'notFound' });

  const now = new Date();
  if (now.getTime() > session.expiresAt) {
    return res.status(400).json({ message: "Session has expired", type: 'expired' });
  }

  const studentInfo = students.find(s => s.username === req.user.username);

  return res.status(200).json({
    session,
    student: studentInfo || null
  });
});

app.post('/attendance/:sessionId', authenticateToken, (req, res) => {
  const { studentUsername, sessionInfo } = req.body;
  const sessionId = req.params.sessionId;
  const session = activeSessions[sessionId];
 
  const student = students.find(s => s.username === studentUsername);
   
  if (
    student.subject != sessionInfo.subject ||
    student.sched !== sessionInfo.sched ||
    student.timeStart !== sessionInfo.timeStart ||
    student.timeEnd !== sessionInfo.timeEnd
  ) {
    return res.status(400).json({ message: "Session does not match student's schedule" });
  }

  if (!session) return res.status(404).json({ message: "Session not found" });
  if (!session.attendance) session.attendance = [];
  if (session.attendance.includes(studentUsername)) {
    return res.status(400).json({ message: "Attendance Already Submitted!" });
  }
 
  session.attendance.push(studentUsername);
  console.log(session.attendance);
  return res.status(200).json({ message: "Attendance marked" });
});

app.get('/session/:sessionId/attendance', authenticateToken, (req, res) => {
  const sessionId = req.params.sessionId;
  const session = activeSessions[sessionId];

  if (!session) return res.status(404).json({ message: "Session not found" });

  if (!session.attendance) session.attendance = [];

  const attendanceDetails = session.attendance.map(username => {
    return students.find(s => s.username === username);
  }).filter(Boolean); 

  return res.status(200).json({ attendance: attendanceDetails });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});