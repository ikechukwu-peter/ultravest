const { Router } = require('express');
const passport = require('passport');
const {
    getUser,
    createProfile,
    updateProfile,
    updateTier,
    userToWithdraw,
    questionResponse,
    userResponse
} = require('../controllers/userController');
const validateUserProfile = require('../validation/validateProfile')
const { checkUser, checkUserInfo } = require('../utils/checkUserRole')

const router = Router();

router.get(
    '/weaver/user/:userId',
    passport.authenticate('jwt', { session: false }),
    checkUser,
    checkUserInfo,
    getUser
)

router.post(
    '/weaver/user/create/profile/:userId',
    passport.authenticate('jwt', { session: false }),
    validateUserProfile,
    checkUser,
    checkUserInfo,
    createProfile
)

router.put(
    '/weaver/user/update/profile/:userId',
    passport.authenticate('jwt', { session: false }),
    checkUser,
    checkUserInfo,
    updateProfile
)

router.put(
    '/weaver/user/update/tier/:accountType/:userId',
    passport.authenticate('jwt', { session: false }),
    checkUser,
    checkUserInfo,
    updateTier
)

router.put(
    '/weaver/user/withdraw/:userId',
    passport.authenticate('jwt', { session: false }),
    checkUser,
    checkUserInfo,
    userToWithdraw
)

router.post(
    '/weaver/user/answer/question/:userId',
    passport.authenticate('jwt', { session: false }),
    checkUser,
    checkUserInfo,
    userResponse
)

module.exports = router;

