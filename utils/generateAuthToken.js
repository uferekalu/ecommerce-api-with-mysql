const jwt = require('jsonwebtoken')

const generateAuthToken = (user) => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY
    const token = jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        },
        jwtSecretKey
    )
    return token
}

module.exports = generateAuthToken