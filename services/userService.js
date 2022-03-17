const moment = require('dayjs')
const userModel = require('../models/userModel');
const profileModel = require('../models/profileModel')
const answerModel = require('../models/answerModel')
const { getOne, updateOne } = require('../utils/factory');
const sendMail = require('./emailService');
const { tier, interest } = require('../utils/tier');

const createProfile = async (req, res) => {
    let investmentReturn;

    let {
        accountNumber,
        bankName,
        gender,
        userBankName,
        dateOfBirth,
        country,
        maritalStatus,
        state,
        telephone,
        accountType,
    } = req.body

    console.log(req.body)

    try {

        let profile = await profileModel.findOne({ user: req.user.id })

        if (profile) {
            res.status(400).json({
                status: "fail",
                error: "user profile already exist, please go to update"
            })
        }
        else {
            let account_type = tier[accountType]

            if (account_type === tier["tierOne"]) {
                investmentReturn = interest["tierOne"]
            }
            else if (account_type === tier["tierTwo"]) {
                investmentReturn = interest["tierTwo"]
            }
            else {
                investmentReturn = interest["tierThree"]
            }

            const doc = await profileModel.create({
                user: req.user.id,
                bank: {
                    bankName,
                    userBankName,
                    accountNumber
                },
                userBio: {
                    country,
                    state,
                    gender,
                    telephone,
                    dateOfBirth,
                    maritalStatus
                },
                accountType: {
                    returnOfInvestment: investmentReturn,
                    netInterest: account_type,
                }
            });
            await userModel.findByIdAndUpdate(req.user.id, {
                profile: doc._id
            })

            res.status(201).json({
                status: 'success',
                data: {
                    data: doc
                }
            });
        }
    } catch (error) {
        console.log(error)
        if (error.name == "CastError") {
            return res.status(400).json({
                status: "fail",
                error: 'invalid parameter'
            })
        } else {
            res.status(500).json({
                status: "fail",
                error: 'Something went wrong, please try again'
            })
        }
    }

}

const getUser = getOne(userModel)

const updateProfile = updateOne(profileModel)

const updateTier = async (req, res) => {
    const { userId, accountType } = req.params
    let account_type, investmentReturn, investmentDuration;
    try {

        const user = await profileModel.findOne({ user: userId })
        console.log(user)

        if (user) {
            account_type = tier[accountType]
            if (account_type === tier["tierOne"] || account_type === tier["tierTwo"]) {
                investmentDuration = moment(moment(new Date()).add(1, 'year')).add(1, 'h').valueOf()
            }
            else {
                investmentDuration = moment(moment(new Date()).add(2, 'year')).add(1, 'h').valueOf()
            }
            console.log(investmentDuration)

            if (account_type === tier["tierOne"]) {
                investmentReturn = interest["tierOne"]
            }
            else if (account_type === tier["tierTwo"]) {
                investmentReturn = interest["tierTwo"]
            }
            else {
                investmentReturn = interest["tierThree"]
            }
            console.log(investmentReturn)

            user.accountType.duration = investmentDuration;
            user.accountType.returnOfInvestment = investmentReturn;
            user.accountType.netInterest = account_type;
            user.dateUpdated = Date.now() + 60 * 60 * 1000;
            console.log(user)
            await user.save();
            res.status(201).json({
                status: 'success',
                message: "upgraded successful"
            });
        }
        else {
            res.status(404).json({
                status: "fail",
                error: "no user found"
            })
        }

    } catch (error) {
        console.log(error)
        if (error.name == "CastError") {
            return res.status(400).json({
                status: "fail",
                error: 'invalid parameter'
            })
        } else {
            res.status(500).json({
                status: "fail",
                error: 'Something went wrong, please try again'
            })
        }
    }

}

//user wants to deposit
const userToDeposit = async () => {
    //todo
    //get user info
    //send notification to admin
}

//user wants to withdraw
const userToWithdraw = async (req, res) => {
    const { userId } = req.params
    try {
        let data = await profileModel.findOne({ user: userId }).where("bank").ne(null)

        if (data === null) {
            res.status(400).json({
                status: "fail",
                error: "Please fill your banking information"
            })
        }
        else if (!data.accountType.duration) {
            res.status(403).json({
                status: "fail",
                error: "you have no investment yet"
            })
        }
        else if (data.accountType.duration > Date.now() + 60 * 60 * 1000) {
            res.status(403).json({
                status: "fail",
                error: "investment cannot be withdrawn now"
            })
        }

        else {
            let firstName = data.user.firstName.charAt(0).toUpperCase() + data.user.firstName.slice(1)
            let lastName = data.user.lastName.charAt(0).toUpperCase() + data.user.lastName.slice(1)


            let htmlString = `
            <div style="overflow-x: auto">
            <h1>Withdrawal Request</h1>
            <h2>
                ${firstName} ${lastName} has requested for withdrawal\n
             </h2>
            <h4>User information</h4>\n
            <table border="1px">
                <thead>
                    <tr>
                        <th> Bank Name </th>
                        <th> User Bank Name </th>
                        <th> Account Number </th>
                        <th> Tier Duration </th>
                        <th> Return on Investment </th>
                        <th> Net Interest </th>
                    </tr>
                </thead>
                </thead>
                <tbody>
                    <tr>
                        <td>${data.bank.bankName}</td>
                        <td> ${data.bank.userBankName} </td>
                        <td> ${data.bank.accountNumber} </td>
                        <td> ${data.accountType.duration.toDateString()} </td>
                        <td> ${data.accountType.returnOfInvestment} </td>
                        <td> ${data.accountType.netInterest}</td>
                    </tr>
                <tbody>
                    <table>
            `

            console.log(htmlString)

            let emailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: `Weaverbuxx, ${firstName} ${lastName} Withdrawal Notice`,
                html: htmlString
            }
            sendMail(emailOptions)

            return res.status(200).json({
                status: "success",
                message: "Request placed successfully",
            })
        }
    } catch (error) {
        console.log(error)
        if (error.name == "CastError") {
            return res.status(400).json({
                status: "fail",
                error: 'invalid parameter'
            })
        } else {
            res.status(500).json({
                status: "fail",
                error: 'Something went wrong, please try again'
            })
        }
    }

}


const questionResponse = async (req, res) => {
    console.log(req.body)

    try {
        await answerModel.create({
            user: req.user.id,
            question: req.body.map(x => x.id),
            answers: req.body.map(x => x.answer)
        })

        return res.status(200).json({
            status: "success",
            message: "Thanks for taking the survey",
        })
    }
    catch (error) {
        console.log(error)
        if (error.name == "CastError") {
            return res.status(400).json({
                status: "fail",
                error: 'invalid parameter'
            })
        } else {
            res.status(500).json({
                status: "fail",
                error: 'Something went wrong, please try again'
            })
        }
    }
}



const userResponse = async (req, res) => {
    console.log(req.body)
    try {
        let user = await answerModel.findOne({ user: req.params.userId })
        if (user) {
            await answerModel.findByIdAndUpdate(user._id, {
                question: req.body,
                dateUpdated: Date.now()
            })

            return res.status(200).json({
                status: "success",
                message: "Thanks for taking the survey",
            })
        }
        else {
            await answerModel.create({
                user: req.user.id,
                question: req.body
            })

            return res.status(200).json({
                status: "success",
                message: "Thanks for taking the survey",
            })
        }
    }
    catch (error) {
        console.log(error)
        if (error.name == "CastError") {
            return res.status(400).json({
                status: "fail",
                error: 'invalid parameter'
            })
        } else {
            res.status(500).json({
                status: "fail",
                error: 'Something went wrong, please try again'
            })
        }
    }
}


module.exports = {
    getUser,
    userToDeposit,
    userToWithdraw,
    updateProfile,
    createProfile,
    updateTier,
    questionResponse,
    userResponse
}