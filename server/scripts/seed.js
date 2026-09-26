const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const Assignment = require('../models/Assignment');

dotenv.config();

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/academic';

async function run() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to Mongo for seeding');

  const pwd = await bcrypt.hash('password123', 10);
  const adminPwd = await bcrypt.hash('123456', 10);

  // Only create if doesn't exist
  let websiteAdmin = await User.findOne({ email: 'webmanagerarh@gmail.com' });
  if (!websiteAdmin) {
    websiteAdmin = await User.create({ name: 'Website Manager', email: 'webmanagerarh@gmail.com', password: adminPwd, role: 'admin' });
  }
  
  let hod = await User.findOne({ email: 'hod@example.com' });
  if (!hod) {
    hod = await User.create({ name: 'HOD Admin', email: 'hod@example.com', password: pwd, role: 'hod', department: 'ECE' });
  }
  
  let faculty = await User.findOne({ email: 'alice@example.com' });
  if (!faculty) {
    faculty = await User.create({ name: 'Prof Alice', email: 'alice@example.com', password: pwd, role: 'faculty', department: 'ECE' });
  }
  
  let student1 = await User.findOne({ email: 'bob@example.com' });
  if (!student1) {
    student1 = await User.create({ name: 'Bob Student', email: 'bob@example.com', password: pwd, role: 'student', department: 'ECE', year: 2, section: 'A' });
  }
  
  let student2 = await User.findOne({ email: 'eve@example.com' });
  if (!student2) {
    student2 = await User.create({ name: 'Eve Student', email: 'eve@example.com', password: pwd, role: 'student', department: 'ECE', year: 2, section: 'A' });
  }

  let dept = await Department.findOne({ name: 'ECE' });
  if (!dept) {
    dept = await Department.create({ name: 'ECE', subjects: ['DSA','OS'], sections: ['A','B'], materials: [] });
  }

  let asg = await Assignment.findOne({ title: 'Assignment 1', department: 'ECE' });
  if (!asg) {
    asg = await Assignment.create({ title: 'Assignment 1', description: 'Solve problems', department: 'ECE', year: 2, section: 'A', subject: 'DSA', dueDate: new Date(Date.now()+7*24*3600*1000), createdBy: faculty._id });
  }

  console.log('Seed complete:');
  console.log({
    admin: websiteAdmin.email,
    hod: hod.email,
    faculty: faculty.email,
    students: [student1.email, student2.email],
    assignmentId: asg._id
  });
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
