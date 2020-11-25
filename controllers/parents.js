const Student = require('../models/student');
const Parent = require('../models/parent');
const ExpressError = require('../utils/ExpressError');

module.exports.renderNewParentForm = async (req, res) => {
    const studentId = req.params.id;
    await Student.findById(studentId);
    res.render('parents/new', { studentId });
}

module.exports.createParent = async (req, res) => {
    const studentId = req.params.id;
    const student = await Student.findById(studentId);
    const newParent = new Parent(req.body);
    console.log(newParent);
    student.parents.push(newParent);
    await newParent.save();
    await student.save();
    console.log(student);
    
    req.flash('success', "Successfully added student's parent!");
    res.redirect(`/students/${studentId}`);
}

module.exports.renderEditParentForm = async (req, res) => {
    const studentId = req.params.id;
    const student = await Student.findById(studentId).populate('parents');
    if (!student) {
        throw new ExpressError('Student Page Not Found', 404);
    }
    const parents = student.parents;
    if (parents.length == 0) {
        throw new ExpressError('Parent Information Not Found', 404);
    }
    res.render('parents/edit', { studentId, parents });
}

module.exports.updateParent = async (req, res) => {
    const studentId = req.params.id;
    const parentIds = Object.keys(req.body);
    console.log(req.body)
    for (let parentId of parentIds) {
        await Parent.findByIdAndUpdate(parentId, req.body[parentId], {runValidators: true, new: true});
    }
    req.flash('success', 'Successfully edited parent(s)!')
    res.redirect(`/students/${studentId}`);
}

module.exports.deleteParent = async (req, res) => {
    const { id, pId } = req.params;
    // remove the Parent._id from the Student
    await Student.findByIdAndUpdate(id, { $pull: { parents: pId } });
    await Parent.findByIdAndDelete(pId);
    // remove Parent from db
    req.flash('warning', 'Deleted a parent');
    res.redirect(`/students/${id}`);
}