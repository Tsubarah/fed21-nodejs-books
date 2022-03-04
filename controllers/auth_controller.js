/**
 * Auth Controller
 */

const bcrypt = require('bcrypt');
const { response } = require('express');
const debug = require('debug')('books:auth_controller');
const jwt = require('jsonwebtoken');
const { matchedData, validationResult } = require('express-validator');
const models = require('../models');

/**
 * Login a user, sign a JTW token and return it
 * 
 * POST /login
 * {
 * 	"username": "",
 * 	"password": ""
 * }
 */
const login = async (req, res) => {
	// destructure username and password from request body
	const { username, password } = req.body;

	// login the user
	const user = await models.User.login(username, password);
	if (!user) {
		return res.status(401).send({
			status: 'fail',
			data: 'Authentication failed.',
		});
	}

	// construct jwt payload (This is where `req.user.user_id` comes from)
	const payload = {
		sub: user.get('username'),
		user_id: user.get('id'),
		name: user.get('first_name') + ' ' + user.get('last_name'),
	}

	// sign payload and get access-token. Can add when the token should expire in options. It can also be saved in the .env "{ expiresIn: process.env.ACCESS_TOKEN_LIFETIME }". Can also put a default value for expiring.
	const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '4h' });

	// sign payload and get refresh-token
	const refresh_token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '2h' });

	// respond with the access-token
	return res.send({
		status: 'success',
		data: {
			access_token,
			refresh_token,
//			access_token: access_token,
		}
	});
}

/**
 * Validate refresh-token and issue a new access-token
 * 
 * POST /refresh
 * {
 * 	"token": ""
 * }
 */
const refresh = (req, res) => {
	// validate the refresh-token (check signature and expiry date)
    try {
		// verify token using the refresh-token-secret
        const payload = jwt.verify(req.body.token, process.env.REFRESH_TOKEN_SECRET);
        
		// construct payload
		// remove 'iat' and 'exp' from refresh-token payload
		delete payload.iat;
		delete payload.exp;

		// sign payload and get access-token
		const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '4h' });

		// send the access-token to the client (Now the user will get a new access-token which is valid for another 4h)
		return res.send({
			status: 'success',
			data: {
				access_token,
	//			access_token: access_token,
			}
		});

    } catch (error) {
        return res.status(401).send({
            status: 'fail',
            data: 'Invalid token',
        });
    }


};



/**
 * Register a new user
 *
 * POST /register
 */
const register = async (req, res) => {
	// check for any validation errors
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).send({ status: 'fail', data: errors.array() });
	}

	// get only the validated data from the request
	const validData = matchedData(req);

	console.log("The validated data:", validData);

	// generate a hash of `validData.password`
	// and overwrite `validData.password` with the generated hash
	try {
		validData.password = await bcrypt.hash(validData.password, 10);

	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: 'Exception thrown when hashing the password.',
		});
		throw error;
	}

	try {
		const user = await new models.User(validData).save();
		debug("Created new user successfully: %O", user);

		res.send({
			status: 'success',
			data: {
				user,
			},
		});

	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: 'Exception thrown in database when creating a new user.',
		});
		throw error;
	}
}

module.exports = {
	login,
	refresh,
	register,
}
