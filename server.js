// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
})) 
app.use(bodyParser.json());
 
const users = [
    { id: 1, username: 'admin', password: '123456', isFaculty: 1, isAdmin: 1 },
    { id: 2, username: '2026001', password: '123456', isFaculty: 1, isAdmin: 1 },
    { id: 3, username: '2026002', password: '123456', isFaculty: 0, isAdmin: 0 },
    { id: 4, username: '2026003', password: '123456', isFaculty: 0, isAdmin: 0 },
    { id: 5, username: '2026004', password: '123456', isFaculty: 0, isAdmin: 0 },
    { id: 6, username: '2026005', password: '123456', isFaculty: 0, isAdmin: 0 },
    { id: 7, username: '2026006', password: '123456', isFaculty: 0, isAdmin: 0 },
];

const faculty = [
    {id: 1, FirstName: 'John', LastName: 'Smith', position: 'Professor',},
    {id: 2, FirstName: 'Maria', LastName: 'Gonzalez', position: 'Lecturer',},
    {id: 3, FirstName: 'David', LastName: 'Lee', position: 'Lecturer',},
];

const faculty_sched = [
    {facultyID: 1, subject: 'Mathematics', sched: '2026-03-15', timeStart: '08:00', timeEnd: '09:00'},
    {facultyID: 1, subject: 'Science', sched: '2026-03-15', timeStart: '09:00', timeEnd: '10:00'},
    {facultyID: 1, subject: 'English', sched: '2026-03-15', timeStart: '10:00', timeEnd: '11:00'},
    {facultyID: 2, subject: 'History', sched: '2026-03-15', timeStart: '08:00', timeEnd: '09:00'},
    {facultyID: 2, subject: 'Physical Ed.', sched: '2026-03-15', timeStart: '09:00', timeEnd: '10:00'},
    {facultyID: 2, subject: 'Computer Science', sched: '2026-03-15', timeStart: '10:00', timeEnd: '11:00'},
    {facultyID: 3, subject: 'Art', sched: '2026-03-15', timeStart: '08:00', timeEnd: '09:00'},
    {facultyID: 3, subject: 'Music', sched: '2026-03-15', timeStart: '09:00', timeEnd: '10:00'},
];

const students = [

];

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
    const facultyInfo = faculty.find(f => f.id === facultyID);

    if (!facultyInfo) {
        return res.status(404).json({ message: 'Faculty not found' });
    }

    // Get faculty schedule
    const schedule = faculty_sched.filter(s => s.facultyID === facultyID);

    return res.status(200).json({ faculty: facultyInfo, schedule });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});