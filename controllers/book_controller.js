/**
 * Book Controller
 */

const debug = require('debug')('books:book_controller');
const models = require('../models');
const { matchedData, validationResult } = require('express-validator');

/**
 * Get all resources
 *
 * GET /
 */
const index = async (req, res) => {
	const all_books = await models.Book.fetchAll();

	res.send({
		status: 'success',
		data: {
			books: all_books
		}
	});
}

/**
 * Get a specific resource
 *
 * GET /:bookId
 */
const show = async (req, res) => {
	const book = await new models.Book({ id: req.params.bookId })
		.fetch({ withRelated: ['book', 'users'] });

	res.send({
		status: 'success',
		data: {
			book,
		}
	});
}

/**
 * Store a new resource
 *
 * POST /
 */
const store = async (req, res) => {
	const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).send({ 
			status: 'fail', 
			data: errors.array() });
    }

    const validData = matchedData(req);
	res.send({ status: 'success', data: validData });


	try {
		const book = await new models.Book(validData).save();
		debug("Created new book successfully: %O", book);


	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: 'Exception thrown in database when creating a new book.',
		});
		throw error;
	}
}

/**
 * Update a specific resource
 *
 * POST /:bookId
 */
 const update = async (req, res) => {
	const bookId = req.params.bookId;

	// make sure book exists
	const book = await new models.User({ id: bookId }).fetch({ require: false });
	if (!book) {
		debug("User to update was not found. %o", { id: bookId });
		res.status(404).send({
			status: 'fail',
			data: 'User Not Found',
		});
		return;
	}
	const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).send({ 
			status: 'fail', 
			data: errors.array() });
    }

    const validData = matchedData(req);
	res.send({ status: 'success', data: validData });

	try {
		const updatedBook = await book.save(validData);
		debug("Updated book successfully: %O", updatedBook);

	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: 'Exception thrown in database when updating a new book.',
		});
		throw error;
	}
}

/**
 * Destroy a specific resource
 *
 * DELETE /:bookId
 */
const destroy = (req, res) => {
	res.status(405).send({
		status: 'fail',
		message: 'Method Not Allowed.',
	});
}

module.exports = {
	index,
	show,
	store,
	update,
	destroy,
}
