const { Router } = require('express');
const passport = require('passport');
const { signup, login, resetPassword, forgotPassword, markVerified } = require('../controllers/authController');
const { validateUserLogin, validateUserSignUp, validateForgotPassword,  } = require('../validation/validateUser')
const router = Router();

router.post(
    '/register', validateUserSignUp, signup
)

router.post(
    '/login', validateUserLogin, login
)
router.patch(
    '/user/verification/weaver/:secret', markVerified
)
router.patch(
    '/resetpassword', passport.authenticate('jwt', { session: false }), resetPassword
)

router.patch(
    '/user/forgotpassword', validateForgotPassword, forgotPassword
)


module.exports = router;