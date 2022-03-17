const encryption = require('../utils/encryption')
const { loginService, registerService, resetPasswordService, forgotPasswordService } = require('../services/authService')
const userModel = require('../models/userModel')

let login = async (req, res) => {

    try {
        const userData = await loginService(req.body)
        res.status(200).json({
            userData
        })
    }
    catch (err) {
        console.log(err)
        if (err.notActive) {
            res.status(401).json({
                status: "fail",
                error: err.notActive
            })
        }
        else if (err.name == "CastError") {
            return res.status(400).json({
                status: "fail",
                error: 'invalid parameter'
            })
        }

        else {
            res.status(500).json({
                status: "fail",
                error: err
            })
        }
    }
}

let signup = async (req, res) => {
    try {
        const userData = await registerService(req.body)
        res.status(201).json({
            userData
        })
    }
    catch (err) {
        console.log(err.err)
        if (err.err.code === 11000) {
            res.status(400).json({
                status: "fail",
                error: "E-mail already used"
            })
        }
        else {
            res.status(500).json({
                status: "fail",
                error: "Something went wrong, try again."
            })
        }

    }
}
let forgotPassword = async (req, res) => {
    const { email, dateOfBirth, telephone } = req.body
    try {
        const changed = await forgotPasswordService(email, telephone, dateOfBirth)
        res.status(200).json({
            status: "succes",
            message: changed
        })
    } catch (e) {
        res.status(400).json({
            status: "fail",
            error: e
        })
    }
}
let resetPassword = async (req, res) => {
    try {
        const reset = await resetPasswordService(req.body.password, req.user.email)
        res.status(200).json(reset)
    } catch (e) {
        res.status(400).json({
            status: "fail",
            error: e
        })
    }
}

const markVerified = async (req, res) => {

    try {
        const { secret } = req.params;
        console.log(secret)

        const hashedToken = encryption(secret);
        console.log(hashedToken)

        const user = await userModel.findOne({
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: Date.now() },
        });

        //check if a user exist
        if (!user) {
            return res.status(404).json({
                status: "fail",
                error: "Token is invalid or has expired",
            });
        }

        //Activates user
        user.active = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save({ validateModifiedOnly: true });

        return res.status(200).json({
            status: "success",
            message: "Email verified.",
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: "fail",
            error: "An error occured while verifying your email, please try again!",
        });
    }
}

module.exports = {
    login,
    signup,
    forgotPassword,
    resetPassword,
    markVerified
}
