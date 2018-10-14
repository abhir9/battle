const jwt = require('jsonwebtoken');
const config = require('../config');
const jwtToken = {};

jwtToken.authenticate = (req, res, next) => {
    let token = req.headers['x-access-token'];
    if (!token)
        return res.status(403).send({
            auth: false,
            message: 'No token provided.'
        });

    jwt.verify(token, config.secret, function(err, decoded) {
        if (err)
            return res.status(500).send({
                auth: false,
                message: 'Failed to authenticate token.'
            });

        req.userId = decoded.id;
        next();
    });
}

jwtToken.generateToken = (data) => {
    return jwt.sign(data, config.secret, {
        expiresIn: (60 * 60 * 24 * 30) // expire in 30 days.
    })
}

module.exports = jwtToken;