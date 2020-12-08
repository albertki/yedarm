const Student = require('../models/student');
const { Parent, statesArray, relationsArray } = require('../models/parent');
const ExpressError = require('../utils/ExpressError');

module.exports.renderNewParentForm = async (req, res) => {
    const studentId = req.params.id;
    const student = await Student.findById(studentId).populate('parents');
    
    const parents = student.parents;
    
    res.render('parents/new', { studentId, statesArray, relationsArray, parents });
}

module.exports.createParent = async (req, res) => {
    const studentId = req.params.id;
    const student = await Student.findById(studentId);
    console.log(req.body);
    if (req.body.otherParentId) {
        const otherParent = await Parent.findById(req.body.otherParentId);
        req.body.address = otherParent.address;
    }
    const newParent = new Parent(req.body);
    student.parents.push(newParent);
    await newParent.save();
    await student.save();
    
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
    res.render('parents/edit', { studentId, parents, statesArray, relationsArray });
}

module.exports.updateParent = async (req, res) => {
    const parentIds = Object.keys(req.body);
    console.log(req.body)
    for (let parentId of parentIds) {
        await Parent.findByIdAndUpdate(parentId, req.body[parentId], {runValidators: true, new: true});
    }
    req.flash('success', 'Successfully edited parent(s)!')
    res.redirect(`/students/${req.params.id}`);
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