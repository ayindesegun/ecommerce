const { check, validationResult } = require('express-validator')

exports.validateSignupRequest = [
  check('firstName').notEmpty().withMessage('firstName is required'),
  check('lastName').notEmpty().withMessage('lastName is required'),
  check('lastName'),
  check('email').isEmail().withMessage('Valid Email is required'),
  check('password')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 character long'),
  check('mobileNo')
    .isMobilePhone()
    .isLength({ min: 10 })
    .withMessage('Enter a valid mobile number'),
]

exports.validateSigninRequest = [
  check('mobileNo')
  .isMobilePhone()
  .isLength({ min: 10 })
  .withMessage('Enter a valid mobile number'),
  check('password')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 character long'),
]

exports.isRequestValidated = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.array().length > 0) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }
  next()
}
