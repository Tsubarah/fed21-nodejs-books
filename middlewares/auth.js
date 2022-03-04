/**
 * Authentication Middleware
 */

// A middleware is used to decide if to send it further in the chain or answer straight away

const debug = require('debug')('books:auth');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * HTTP Basic Authentication
 */
const basic = async (req, res, next) => {
    debug('Hello from auth.basic!');

    // Check if Authorization header exists, if not, stop and send response
    if (!req.headers.authorization) {
        debug('Authorization header missing');

        // Sends a response, prevents Next from execute.
        return res.status(401).send({
            status: 'fail',
            data: 'Authorization required',
        });
    }

    // %o works as a placeholder for the 2nd parameter (req.headers.authorization)
    debug('Authorization header: %o', req.headers.authorization);

    // split header into '<authSchema> <base64payload>'
    // 'Basic QmVlbmllOm1hbm5lbg=='
    // [0] = 'basic'
    // [1] = 'QmVlbmllOm1hbm5lbg=='
    const [authSchema, base64payload] = req.headers.authorization.split(' ');

    // if authSchema isn't 'basic', then fail
    if (authSchema.toLowerCase() !== 'basic') {
        // Not ours to authenticate
        debug("Authorization schema isn't basic")

        return res.status(401).send({
            status: 'fail',
            data: 'Authorization required',
        });
    }

    // decode payload from base64 => ascii
    const decodedPayload = Buffer.from(base64payload, 'base64').toString('ascii');
    // decodedPayload = "username:password"
    
    // split decoded payload into "<username>:<password>"
    const [username, password] = decodedPayload.split(':');

    const user = await User.login(username, password);
    if (!user) {
        return res.status(401).send({
            status: 'fail',
            data: 'Authorization failed',
        });
    }

    // finally, attach user to request
    req.user = user;


    // pass request along
    next();
}


/**
 * Validate JWT token
*/
const validateJwtToken = (req, res, next) => {
        
        // Check if Authorization header exists, if not, stop and send response
        if (!req.headers.authorization) {
        debug('Authorization header missing');

        return res.status(401).send({
            status: 'fail',
            data: 'Authorization required',
        });
    }


    // Authorization: Bearer eyJhbGc9.BQaWdnIiwiaWF0IjoxNjQ2MTMyNDg3fQ.lT4r744J3P2iceY
    // Split authorization header "authSchema token"
    const [authSchema, token] = req.headers.authorization.split(' ');
    if (authSchema.toLowerCase() !== 'bearer') {
        return res.status(401).send({
            status: 'fail',
            data: 'Authorization required',
        });
    }


    // verify token (and extract payload)
    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = payload;

    } catch (error) {
        return res.status(401).send({
            status: 'fail',
            data: 'Authorization required',
        });
    }

    next();
}

module.exports = {
    basic,
    validateJwtToken,
}