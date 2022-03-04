const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile_controller');
const profileValidationRules = require('../validation/profile');
// const bookValidationRules = require('../validation/book');

/* Get authenticated user's profile */
router.get('/', profileController.getProfile);  // <-- /profile

/* Update authenticated user's profile */
// Add validationrules as a 1st param.
router.put('/', profileValidationRules.updateRules, profileController.updateProfile); // <-- /profile

/* Get authenticated user's books */ 
router.get('/books', profileController.getBooks); // <-- /profile/books

//Create validated book to profile
router.post('/books', profileValidationRules.updateRules, profileController.addBook); // profileController.addBook



module.exports = router;
