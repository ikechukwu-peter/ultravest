const cron = require('node-cron');
const UserModel = require('../models/userModel');


//job to increase user investment every two months
cron.schedule("59 59 0 * * *", async function () {
    //create a date of two months + an hour
    let date = new Date();
    let twoMonths = date.setMonth(date.getMonth() - 2);
    let percentage = 100;

    try {
        let users = await UserModel.find({ "depositeDate": { $gte: +twoMonths } }).populate('profile').exec();
        if (users.length > 0) {
            users.map((user) => {
                const interest = (user.profile.accountType.returnOfInvestment.split('%')[0] / percentage) * user.profile.investment.walletBalance;
                user.profile.investment.walletBalance = user.profile.investment.walletBalance + interest;
                await user.save();
            })
        }
    } catch (error) {
        console.log("ERROR OCCURRED WHILE RUNNING WORKER TO UPDATE INTEREST")
        console.log(error);
        console.log("TRYING TO UPDATE INTEREST AGAIN")
        let users = await UserModel.find({ "depositeDate": { $gte: +twoMonths } }).populate('profile').exec();
        if (users.length > 0) {
            users.map((user) => {
                const interest = (user.profile.accountType.returnOfInvestment.split('%')[0] / percentage) * user.profile.investment.walletBalance;
                user.profile.investment.walletBalance = user.profile.investment.walletBalance + interest;
                await user.save();
            })
        }
    }
}); 
