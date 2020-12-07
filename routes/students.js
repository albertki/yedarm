const express = require('express');
const router = express.Router();
const multer  = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

const students = require('../controllers/students');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const { isLoggedIn, isAdmin } = require('../middleware');


router.route('/')
    // GET route to get index (list of current students)
    .get(isLoggedIn, catchAsync(students.index))
    // POST route for CREATE student
    .post(isLoggedIn, isAdmin, upload.single('image'), catchAsync(students.createStudent));

// GET route for CREATE student
router.get('/new', isLoggedIn, isAdmin, students.renderNewStudentForm)

router.route('/:id')
    // GET route to view specific student
    .get(isLoggedIn, isAdmin, catchAsync(students.renderStudent))
    // PUT route to UPDATE student
    .put(isLoggedIn, isAdmin, upload.single('image'), catchAsync(students.updateStudent))
    // DELETE route to DELETE student
    .delete(isLoggedIn, isAdmin, catchAsync(students.deleteStudent))

// GET route to UPDATE student
router.get('/:id/edit', isLoggedIn, isAdmin, catchAsync(students.renderEditForm))


// Error handlers
const handleCastError = (err) => {
    console.dir(err);
    // return new ExpressError('Student Not Found', 404);
    return err
}
const handleValidationError = (err) => {
    console.dir(err);
    return new ExpressError(`Invalid Student data...${err.message}`, 400);
}

router.use((err, req, res, next) => {
    console.log(err.name);
    if (err.name === 'CastError') {
        err = handleCastError(err);
    }
    else if (err.name === 'ValidationError') {
        err = handleValidationError(err);
    }
    next(err);
})

module.exports = router;
