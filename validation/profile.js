/**
 * User Validation Rules
 */

 const { body } = require('express-validator');
 const models = require('../models');

 
 /**
  * Update User validation rules
  *
  * Required: -
  * Optional: password, first_name, last_name
  */
 const updateRules = [
     body('password').optional().isLength({ min: 4 }),
     body('first_name').optional().isLength({ min: 2 }),
     body('last_name').optional().isLength({ min: 2 }),
     body('book_id').optional().custom(async value => {
         const book = await new models.Book({ id : value }).fetch({ require: false, withRelated: ['users']});
         if (!book) {
             return Promise.reject(`Book with ID ${value} does not exist.`);
         }
         debug(`Attempting to update book with id: ${book}`);
         return Promise.resolve();
     })
 ];
 
 module.exports = {
     updateRules
 }
 