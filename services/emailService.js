const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    secure: true,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});


let sendMail = async (options) => {
    const mailOptions = {
        from: options.from, // sender address
        to: options.to,
        subject: options.subject, // Subject line
        html: options.html, // plain text body
    };
    try {
        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.log(error)
    }
}


module.exports = sendMail


