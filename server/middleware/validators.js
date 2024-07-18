const { body, validationResult } = require('express-validator');

const validateCreateEmployee = [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').notEmpty().trim().escape(),
  body('last_name').notEmpty().trim().escape(),
  body('age').isInt({ min: 18, max: 100 }),
  body('employee_id').notEmpty().trim().escape(),
  body('iban').isIBAN(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateCreateEmployee
};