const crypto = require('crypto')

module.exports = encryption = (value) => {
    return crypto.createHash("sha256").update(value).digest("hex");
};