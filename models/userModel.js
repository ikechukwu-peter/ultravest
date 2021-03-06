const { Schema, model, SchemaTypes } = require('mongoose');
const bcrypt = require('bcryptjs')

const schema = Schema({
    profile: {
        type: SchemaTypes.ObjectId,
        ref: 'Profile',
    },
    firstName: { type: String, required: true, lower: true },
    lastName: { type: String, required: true, lower: true },
    email: {
        type: String, required: true, unique: true,
        lowercase: true,
    },
    password: { type: String, required: true, select: false },
    role: {
        type: String,
        enum: ["investor", "admin"],
        default: "investor",
    },
    active: {
        type: Boolean,
        default: false,
        select: false
    },
    dateCreated: {
        type: Date,
        default: Date.now() + 60 * 60 * 1000
    },
    dateUpdated: {
        type: Date,
        default: Date.now() + 60 * 60 * 1000
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);


schema.pre("save", async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified("password")) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    next();
});

schema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now() + 60 * 60 * 1000

    next();
});
schema.pre("save", function (next) {
    //this sets expiry date for the verification token
    if (this.isNew) {
        this.verificationTokenExpires = Date.now() + 2 * (60 * 60 * 1000);
    }
    next();
});
// https://weaverbuxx.herokuapp.com
schema.methods.comparePassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

schema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
  };
  
  //This creates random strings, the encrypted version is stored in the db while the plain is sent to the db
  schema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
  
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    this.passwordResetExpires = Date.now() + 2 * (10 * 60 * 1000);
  
    return resetToken;
  };

// 3. Create a Model.
const UserModel = model('User', schema);
module.exports = UserModel;