const { Router } = require('express');
const passport = require('passport');
const {
    findUser,
    findUsers,
    removeUser,
    increaseWallet,
    decreaseWallet,
    uploadQuestion,
    fetchUserResponse,
    fetchUserResponses

} = require('../controllers/adminController');


const { checkAdmin } = require('../utils/checkUserRole')

const router = Router();

router.get(
    '/weaver/admin/users',
    passport.authenticate('jwt', { session: false }),
    checkAdmin,
    findUsers
)

router.get(
    '/weaver/admin/user/:userId',
    passport.authenticate('jwt', { session: false }),
    checkAdmin,
    findUser
)

router.put(
    '/weaver/admin/increase/wallet/:userId',
    passport.authenticate('jwt', { session: false }),
    checkAdmin,
    increaseWallet
)

router.put(
    '/weaver/admin/decrease/wallet/:userId',
    passport.authenticate('jwt', { session: false }),
    checkAdmin,
    decreaseWallet
)

router.delete(
    '/weaver/admin/exterminate/:userId',
    passport.authenticate('jwt', { session: false }),
    checkAdmin,
    removeUser
)

router.get(
    '/weaver/admin/user/answer/:userId',
    passport.authenticate('jwt', { session: false }),
    checkAdmin,
    fetchUserResponse,

)
router.get(
    '/weaver/admin/users/answers',
    passport.authenticate('jwt', { session: false }),
    checkAdmin,
    fetchUserResponses,

)
module.exports = router;