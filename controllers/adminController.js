
const {
    getUser,
    getUsers,
    deleteUser,
    increaseWalletBalance,
    decreaseWalletBalance,
    uploadQuestion,
    fetchUserResponse,
    fetchUserResponses
} = require('../services/adminService');

const findUser = getUser;
const findUsers = getUsers;
const removeUser = deleteUser;
const increaseWallet = increaseWalletBalance;
const decreaseWallet = decreaseWalletBalance;

module.exports = {
    findUser,
    findUsers,
    removeUser,
    increaseWallet,
    decreaseWallet,
    uploadQuestion,
    fetchUserResponse,
    fetchUserResponses
}

