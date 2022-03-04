// User Validation Rules

const { body } = require('express-validator');
const currentYear = (new Date).getFullYear();

const createRules = [
    body('first_name').exists().isLength({ min: 2 }),
    body('last_name').exists().isLength({ min: 2 }),
    body('birthyear').exists().isInt({ min: 1700, max: currentYear })
];

const updateRules = [
    body('first_name').optional().isLength({ min: 3 }),
    body('last_name').optional().isLength({ min: 4 }),
    body('birthyear').optional().isInt({ min: 1700, max: currentYear })
];

module.exports = {
    createRules, 
    updateRules,
}