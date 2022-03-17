const { check, validationResult } = require('express-validator');
const userModel = require('../models/userModel');


const validateForgotPassword = [
    check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .not()
        .isEmpty()
        .withMessage('Invalid email address!')
        .bail(),
    check('telephone')
        .trim()
        .not()
        .isEmpty()
        .withMessage('telephone field cannot be empty')
        .bail(),
    check("dateOfBirth")
        .not()
        .isEmpty()
        .withMessage('Please provide your date of birth')
        .bail(),
    (req, res, next) => {
        const error = validationResult(req).formatWith(({ msg }) => msg);

        const hasError = !error.isEmpty();

        if (hasError) {
            res.status(422).json({ error: error.mapped() });
        } else {
            next();
        }
    },
]

const validateUserLogin = [
    check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .not()
        .isEmpty()
        .withMessage('Invalid email address!')
        .bail(),
    check("password")
        .isLength({ min: 8 })
        .withMessage("your password should have a length of 8")
        .bail(),
    (req, res, next) => {
        const error = validationResult(req).formatWith(({ msg }) => msg);

        const hasError = !error.isEmpty();

        if (hasError) {
            res.status(422).json({ error: error.mapped() });
        } else {
            next();
        }
    },
];


const validateUserSignUp = [
    check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .not()
        .isEmpty()
        .withMessage('Invalid email address!')
        .custom(async (value) => {
            let user = await userModel.findOne({ email: value })
            console.log(user, value)
            if (user) {
                throw new Error('E-mail is already in use');
            }

            return false
        })
        .bail(),
    check("password")
        .isLength({ min: 8 })
        .withMessage("your password should have a length of 8")
        .bail(),
    check("passwordConfirm")
        .isLength({ min: 8 })
        .withMessage("your password should have a length of 8")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }

            // Indicates the success of this synchronous custom validator
            return true;
        })
        .bail(),
    check("firstName")
        .escape()
        .not()
        .isEmpty()
        .withMessage('firstname can not be empty!')
        .bail(),
    check("lastName")
        .escape()
        .not()
        .isEmpty()
        .withMessage('lastname can not be empty!')
        .bail(),
    (req, res, next) => {
        const error = validationResult(req).formatWith(({ msg }) => msg);

        const hasError = !error.isEmpty();

        if (hasError) {
            res.status(422).json({ error: error.mapped() });
        } else {
            next();
        }
    },
];

module.exports = {
    validateUserLogin,
    validateUserSignUp,
    validateForgotPassword
}