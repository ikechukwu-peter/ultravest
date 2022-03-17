const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const random = require('randity')
const userModel = require('../models/userModel');
const sendMail = require('./emailService');
const encryption = require('../utils/encryption')

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESIN,
    });
};

let registerService = async (userData) => {
    const { email, password, role, firstName, lastName } = userData;
    console.log(
        email, password,
        firstName, lastName
    )

    //This creates a random code to be sent along for verification
    const randomToken = crypto.randomBytes(32).toString("hex");

    console.log(randomToken)

    const verificationToken = encryption(randomToken);
    console.log(verificationToken)


    try {
        await userModel.create({
            email,
            password,
            role,
            firstName,
            lastName,
            verificationToken,
        })


        //create a link to verify user email with
        let link = `${process.env.WEB_URL}/auth/user/verification/weaver/${randomToken}`

        let html = `
        <h4> Hello ${firstName}, welcome to Weaverbuxx </h4> \n
        <p> Please click this link to verify
        your email \n<a href=${link}>${link} </a></p> \n\n\n\n\n\n          
        The link will expire in an hour.\n\n\n\n\n\n\n\n\n  
        <h6 style="text-align:"left";"> Admin </h6>`

        let emailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Weaverbuxx, confirm your email",
            html: html
        }

        console.log(emailOptions)

        //email sent here
        sendMail(emailOptions);
        return Promise.resolve("Please check your email")
    }
    catch (err) {
        return Promise.reject({
            err
        })
    }

}


let loginService = async (userData) => {

    const { email, password, } = userData;
    console.log(userData)
    try {

        // 1) Check if user exists && password is correct
        const user = await userModel.findOne({ email }).select("+password").select("+active");
        console.log(user)

        if (!user) {
            return Promise.reject("Please confirm your email")
        }

        if (user === null || !(await user.comparePassword(password, user.password))) {
            return Promise.reject('Incorrect email or password')
        }
        console.log(user)
        if (user.active) {
            const token = signToken(user._id)
            user.password = undefined;
            user.dateCreated = undefined;
            user.__v = undefined

            return Promise.resolve({ token, user })
        }

        else {
            return Promise.reject({ notActive: "Please verify your email" })
        }

    }
    catch (err) {
        console.log(err)
        return Promise.reject(err)
    }
}

let forgotPasswordService = async (email) => {

    try {
        const user = await userModel.findOne({ email: email }).populate("profile");
        console.log(user)
        if (!user) {
            return Promise.reject(
                "There is no user with this email address",
            )
        }
        else {

            const resetToken = user.createPasswordResetToken();
            await user.save({ validateBeforeSave: false });

            let link = `${process.env.WEB_URL}/auth/user/forgot/password/${resetToken}`

            let firstName = user.profile.user.firstName.charAt(0).toUpperCase() + user.profile.user.firstName.slice(1)

            const htmlString = `
            <strong> Hi ${firstName}, click the link below to change your password.</strong>\n
            <a href=${link}> ${link}> </a>\n

             <p> If you didn't request for a password change,\n 
              your account might be compromised, contact the admin.
              </p>
            `;

            //email sent here
            await sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Ultravest, Password change requested ",
                html: htmlString,
            });
            return Promise.resolve("Please check your email for further instructions")

        }
    }
    catch (err) {
        console.log(err)
        user.createPasswordResetToken = undefined;
        user.createPasswordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return Promise.reject({
            err
        })
    }

}

let resetPasswordService = async (password, email) => {
    // 2) Check if user exists && password is correct
    const user = await userModel.findOne({ email: email }).select("+password");

    if (user === null || !(await user.comparePassword(password, user.password))) {
        return Promise.reject('Incorrect  password')
    }

    user.password = password;
    await user.save()
    return Promise.resolve("Password changed successfully")
}



let changePasswordService = async (resetToken, password) => {
    // 2) Check if user exist and token has not expired
    const user = await userModel.findOne({ passwordResetToken: resetToken, passwordResetExpires: { $gt: Date.now() } });

    if (user) {
        user.password = password;
        await user.save();
        return Promise.resolve("Password changed successfully")
    }
    else {
        return Promise.reject("No user found")
    }


}

module.exports = {
    loginService,
    registerService,
    forgotPasswordService,
    resetPasswordService,
    changePasswordService
}
