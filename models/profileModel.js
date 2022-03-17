const { Schema, model, SchemaTypes } = require('mongoose');

const schema = Schema({
    user: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    accountType: {
        duration: {
            type: Date,
        },
        returnOfInvestment: {
            type: String,
            enum: ["2.0%-2.5%", "10%-11.7%", "20%-23%"],
            default: "2.0%-2.5%"
        },
        netInterest: {
            type: String,
            enum: ["12.5%-15%", "30%-35%", "60%-70%"],
            default: "12.5%-15%"
        }
    },

    userBio: {
        gender: {
            type: String,
            enum: ["male", "female"],
            default: "male",
            lower: true
        },
        country: {
            type: String,
            lowercase: true,
        },
        state: {
            type: String,
            lowercase: true,
        },
        maritalStatus: {
            type: String,
            enum: ["single", "married", "divorced"],
            default: "single"
        },
        dateOfBirth: {
            type: Date,
        },
        telephone: {
            type: String,
            lowercase: true,
        },
    }
    ,
    bank: {
        bankName: {
            type: String,
            lowercase: true,
        },
        accountNumber: {
            type: String,
            mininum: 10
        },
        userBankName: {
            type: String,
            lowercase: true,
        }
    },

    investment: {
        hasDeposited: {
            type: Boolean,
            default: false,
            select: false
        },
        hasWithdrawn: {
            type: Boolean,
            default: false,
            select: false
        },
        depositDate: {
            type: Date,
            select: false
        },

        withdrawalDate: {
            type: Date,
            select: false
        },
        amountDeposited: {
            type: Number,
            select: false
        },
        amountWithdrawn: {
            type: Number,
            select: false
        },
        numberOfDeposits: {
            type: Number,
            default: 0,
            select: false
        },
        numberOfWithdrawals: {
            type: Number,
            default: 0,
            select: false
        },

        walletBalance: {
            type: Number,
            default: 0
        }
    },
    dateCreated: {
        type: Date,
        default: Date.now() + 60 * 60 * 1000
    },
    dateUpdated: {
        type: Date,
        default: Date.now() + 60 * 60 * 1000
    },
});

schema.pre(/^find/, function (next) {
    this.populate("user").populate({
        path: "user",
        select: ["email", "firstName", "lastName"],
    });
    next();
});

// schema.pre(/^find/, function (next) {
//     // this points to the current query
//     this.find({ hasInvested: { $ne: false } });
//     next();
// });


// 3. Create a Model.
const profileModel = model('Profile', schema);
module.exports = profileModel;