const Student = require('../models/student');
const { Parent, statesArray } = require('../models/parent');
const ExpressError = require('../utils/ExpressError');
const { cloudinary } = require('../cloudinary')

const calculateAge = require('../utils/calculateAge');
const bulletify = require('../utils/bulletify');


module.exports.index = async (req, res) => {
    const students = await Student.find();
    res.render('students/index', { students, calculateAge });
}

module.exports.renderNewStudentForm = (req, res) => {
    res.render('students/new', { statesArray });
}

module.exports.createStudent = async (req, res) => {
    // TODO: Fix to allow multiple parents
    const parentInfo = req.body.parent;
    const parent = new Parent(parentInfo);
    delete req.body.parent;
    // console.log(req.body);
    if (req.body.kcpcMemberDate == '') delete req.body.kcpcMemberDate;  // null Date causes error...
    const newStudent = new Student(req.body);
    console.log(newStudent);
    if (req.file) {
        newStudent.image = { url: req.file.path, filename: req.file.filename }
    }
    newStudent.parents.push(parent);
    await newStudent.save();
    await parent.save();
    // console.log(newStudent);
    req.flash('success', 'Successfully added a new student!')
    res.redirect(`/students/${newStudent._id}`);
}

module.exports.renderStudent = async (req, res) => {
    const student = await Student.findById(req.params.id).populate('parents');
    if (!student) {
        req.flash('error', 'Cannot find the student!');
        return res.redirect('/students');
        // throw new ExpressError('Student Not Found', 404);
    }
    res.render('students/show', { student, calculateAge });
}

module.exports.renderEditForm = async (req, res) => {
    const student = await Student.findById(req.params.id).populate('parents');
    if (!student) {
        throw new ExpressError('Student Not Found', 404);
    }
    res.render('students/edit', { student, bulletify });
}
module.exports.updateStudent = async (req, res) => {
    const studentId = req.params.id;
    if (req.file) {
        req.body.image = { url: req.file.path, filename: req.file.filename }
    }
    const student = await Student.findByIdAndUpdate(studentId, req.body, {runValidators: true, new: true});
    if (req.body.deleteImage) {
        cloudinary.uploader.destroy(req.body.deleteImage);
        await student.updateOne({$unset: { image: ""}})
    }
    req.flash('success', 'Successfully edited a student!');
    res.redirect(`/students/${studentId}`);
}

module.exports.deleteStudent = async (req, res) => {
    // DELETES Parent(s) if the Student deleted
    // TODO: But what if a Parent has multiple Students?
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
        throw new ExpressError('Student Not Found', 404);
    }
    req.flash('warning', 'Deleted a student! ;(')
    res.redirect(`/students`);
}