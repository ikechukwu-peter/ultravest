const { check, validationResult } = require('express-validator');

const validateUserProfile = [
    check('bankName')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Bank name cannot be empty')
        .bail(),
    check("accountNumber")
        .escape()
        .not()
        .isEmpty()
        .withMessage('Account number not be empty!')
        .bail()
        .isLength({ min: 10, max: 10 })
        .withMessage('Account number  be must be 10')
        .bail(),
    check('userBankName')
        .trim()
        .not()
        .isEmpty()
        .withMessage('User bank name cannot be empty')
        .bail(),
    check('gender')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Gender field cannot be empty')
        .isIn("male", "female")
        .withMessage('Gender is between male or female')
        .bail(),
    check('country')
        .trim()
        .not()
        .isEmpty()
        .withMessage('country field cannot be empty')
        .bail(),
    check('state')
        .trim()
        .not()
        .isEmpty()
        .withMessage('state field cannot be empty')
        .bail(),
    check('maritalStatus')
        .trim()
        .not()
        .isEmpty()
        .withMessage('marital status field cannot be empty')
        .bail(),
    check('telephone')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Bank name cannot be empty')
        .bail(),
    check("dateOfBirth")
        .not()
        .isEmpty()
        .withMessage('Please provide your date of birth')
        .bail(),
    check("accountType")
        .escape()
        .not()
        .isEmpty()
        .withMessage('Please select account type')
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

module.exports =  validateUserProfile
