const moment = require('dayjs')
const userModel = require('../models/userModel');
const profileModel = require('../models/profileModel')
const { getOne, getAll } = require('../utils/factory')
const { tier } = require('../utils/tier');
const answerModel = require('../models/answerModel');

const getUser = getOne(userModel)
const getUsers = getAll(userModel)

const deleteUser = async (req, res) => {

    const { userId } = req.params;
    try {
        const user = await profileModel.findOne({ user: userId });

        if (!user) {
            return res.status(404).json({
                status: "fail",
                error: "No user found",
            });
        }
        else {
            await user.remove();
            await userModel.findByIdAndDelete(userId);
            res.status(204).json({
                status: "success",
                data: null,
            });
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: "fail",
            error: "Something went wrong, try again",
        });
    }
}

//increase user wallet by admin
const increaseWalletBalance = async (req, res) => {
    const { amount } = req.body
    const { userId } = req.params
    const amountToIncreaseBy = Number(amount)
    let account_type, investmentDuration;

    try {

        let user = await profileModel.findOne({ user: userId })
        console.log(user)

        if (user) {
            if (amountToIncreaseBy < 0) {
                res.status(400).json({
                    status: "fail",
                    error: 'Wallet cannot increase by a negative balance'
                })
            }
            else {
                account_type = tier[user.accountType.netInterest]

                if (account_type === tier["tierOne"] || account_type === tier["tierTwo"]) {
                    investmentDuration = moment(moment(new Date()).add(1, 'year')).add(1, 'h').valueOf()
                }
                else {
                    investmentDuration = moment(moment(new Date()).add(2, 'year')).add(1, 'h').valueOf()
                }
                console.log(investmentDuration)

                user.investment.walletBalance = Number(user.investment.walletBalance) + amountToIncreaseBy
                user.investment.hasDeposited = true;
                user.investment.depositDate = Date.now() + 60 * 60 * 1000;
                user.investment.amountDeposited = amountToIncreaseBy;
                user.investment.numberofDeposits = user.investment.numberofDeposits + 1
                user.accountType.duration = investmentDuration
                user.dateUpdated = Date.now() + 60 * 60 * 1000
                await user.save()
                res.status(200).json({
                    status: "success",
                    message: "wallet credited"
                })
            }

        }
        else {
            // let newUser = {
            //     user: userId,
            //     dateUpdated: Date.now(),
            //     accountType: {
            //         duration: investmentDuration
            //     },
            //     investment: {
            //         walletBalance: amountToIncreaseBy,
            //         depositDate: Date.now(),
            //         numberofDeposits: 1,
            //         amountDeposited: amountToIncreaseBy,
            //         hasDeposited: true
            //     }
            // }

            // console.log(newUser)
            // await profileModel.create(newUser)
            res.status(404).json({
                status: "fail",
                error: "user has no profile"
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "fail",
            error: 'Something went wrong, please try again'
        })
    }


}

//decrease user wallet by admin
const decreaseWalletBalance = async (req, res) => {
    const { amount } = req.body
    const { userId } = req.params
    const amountToDecreaseBy = Number(amount)

    console.log(amount, userId)

    try {
        let user = await profileModel.findOne({ user: userId })
        if (user) {
            if (amountToDecreaseBy < 0) {
                res.status(403).json({
                    status: "fail",
                    error: 'Wallet cannot decrease by a negative balance'
                })
            }
            else {
                if (Number(user.investment.walletBalance) > amountToDecreaseBy) {
                    user.investment.walletBalance = Number(user.investment.walletBalance) - amountToDecreaseBy
                    user.investment.hasWithdrawn = true;
                    user.investment.withdrawalDate = Date.now() + 60 * 60 * 1000;
                    user.investment.amountwithdrawn = amountToDecreaseBy;
                    user.investment.numberofWithdrawals = user.investment.numberofWithdrawals + 1;
                    user.dateUpdated = Date.now() + 60 * 60 * 1000
                    await user.save()
                    res.status(200).json({
                        status: "success",
                        message: "wallet debited"
                    })
                }
                else {
                    return res.status(403).json({
                        status: "fail",
                        error: "Insufficient fund"
                    })
                }
            }

        }
        else {
            return res.status(404).json({
                status: "fail",
                error: "No user found"
            })
        }

    } catch (error) {
        console.log(error)
        if (error.name == "CastError") {
            return res.status(400).json({
                status: "fail",
                error: 'invalid parameter'
            })
        }
        else {
            return res.status(500).json({
                status: "fail",
                error: 'Something went worng, try again'
            })
        }

    }

}

const fetchUserResponse = async (req, res) => {
    try {
        let answers = await answerModel.findOne({ user: req.params.userId }).populate("user");

        if (answers) {
            res.status(200).json({
                status: "success",
                data: answers
            })
        }
        else {
            res.status(404).json({
                status: "fail",
                error: "no user answer found"
            })
        }

    } catch (error) {
        console.log(error)
        if (error.name == "CastError") {
            return res.status(400).json({
                status: "fail",
                error: 'invalid parameter'
            })
        }
        else {
            return res.status(500).json({
                status: "fail",
                error: 'Something went worng, try again'
            })
        }
    }
}

const fetchUserResponses = async (req, res) => {

    try {

        let answers = await answerModel.find().populate("user");
        res.status(200).json({
            status: "success",
            data: answers
        })

    } catch (error) {
        console.log(error)

        return res.status(500).json({
            status: "fail",
            error: 'Something went worng, try again'
        })

    }
}

//upload question
const uploadQuestion = async (req, res) => {

    try {
        await questionModel.create({
            user: req.user.id,
            question: req.body.map(x => x.question.question),
            options: req.body.map(x => x.question.options)
        })
        return res.status(200).json({
            status: "success",
            message: "Question uploaded successfully",
        })

    } catch (error) {
        console.log(error)
        if (error.name == "CastError") {
            return res.status(400).json({
                status: "fail",
                error: 'invalid parameter'
            })
        }
        else {
            return res.status(500).json({
                status: "fail",
                error: 'Something went worng, try again'
            })
        }

    }

}

module.exports = {
    getUser,
    getUsers,
    deleteUser,
    increaseWalletBalance,
    decreaseWalletBalance,
    uploadQuestion,
    fetchUserResponse,
    fetchUserResponses
}