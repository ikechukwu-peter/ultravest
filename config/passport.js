const { Strategy, ExtractJwt } = require('passport-jwt')
const mongoose = require('mongoose')

const User = mongoose.model("User");

let options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

module.exports =  (passport) => {
    passport.use(
        new Strategy(options, async (jwt_payload, done) => {
            try {
                const user = await User.findById(jwt_payload.id);
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            } catch (err) {
                console.log(err);
            }
        })
    );
};
