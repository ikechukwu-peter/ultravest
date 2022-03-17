const userModel = require('../models/userModel')

let checkUser = async (req, res, next) => {
    if (req.user.role === 'investor') {
        next()
    } else {
        res.status(403).send()
    }

}
let checkAdmin = async (req, res, next) => {
    if (req.user.role === 'admin') {
        next()
    } else {
        res.status(403).send()
    }
}

let checkUserInfo = async (req, res, next) => {

    try {
        let user_data = await userModel.findById(req.params.userId).exec()

        if (!user_data) {
            console.log("NO USER FOUND")
            res.status(404).json({
                status: "fail",
                message: 'session not found for this user'
            })
        }
        else {
            if (!(req.user.id === user_data.id)) {
                console.log("USER DOES NOT MATCH")
                res.status(403).json({
                    status: "fail",
                    message: 'session does not belong to user'
                })
            } else {
                next()
            }
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: "fail",
            message: 'Something went wrong, please try again'
        }
        )
    }
}

module.exports = {
    checkUser,
    checkAdmin,
    checkUserInfo
}
