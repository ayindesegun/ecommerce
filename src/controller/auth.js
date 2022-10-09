const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const shortid = require('shortid')
const config = require('../smsotp_config') 
const client = require('twilio')(config.accountSID, config.authToken)
require('dotenv').config()



const generateJwtToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  })
}

exports.signup = (req, res) => {
  User.findOne({ mobileNo: req.body.mobileNo}).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        error: 'User already registered',
      })

    const { firstName, lastName, email, mobileNo, password } = req.body
    const hash_password = await bcrypt.hash(password, 10)
    
    //Generating OTP
    const generatedOTP = client.verify.v2
    .services(config.serviceSID)
    .verifications.create({
      to: '+234' + mobileNo,
      channel: 'sms',
    })
    .then((verification) => res.send(verification.status))

    const _user = new User({
      firstName,
      lastName,
      email,
      mobileNo,
      hash_password,
      otp : generatedOTP,
      username: shortid.generate(),
    })

    _user.save((error, user) => {
      if (error) {
        return res.status(400).json({
          message: error,
        })
      }

      if (user) {
        const token = generateJwtToken(user._id, user.role)
        const { _id, firstName, lastName, mobileNo, email, role, fullName } = user
        return res.status(201).json({
          token,
          user: { _id, firstName, lastName, mobileNo, email, role, fullName },
        })
      }
    })
  })
}

 exports.verify = (req, res ) => {
  const { mobileNo } = req.body
  const { otp } = req.body

  const verifyOTP = client.verify.v2
    .services(config.serviceSID)
    .verificationChecks.create({ to: '+234' + mobileNo, code: otp })
    .then((verification_check) =>
      res.status(200).send(verification_check.status)
    )
    .catch((error) => {
      return res.status(400).send({ error })
    })
 }


exports.signin = (req, res) => {
  User.findOne({ mobileNo: req.body.mobileNo }).exec(async (error, user) => {
    if (error) return res.status(400).json({ error })
    if (user) {
      const isPassword = await user.authenticate(req.body.password)
      if (isPassword && user.role === 'user') {
        // const token = jwt.sign(
        //   { _id: user._id, role: user.role },
        //   process.env.JWT_SECRET,
        //   { expiresIn: "1d" }
        // );
        const token = generateJwtToken(user._id, user.role)
        const { _id, firstName, lastName, mobileNo, role, fullName } = user
        res.status(200).json({
          token,
          user: { _id, firstName, lastName, mobileNo, role, fullName },
        })
      } else {
        return res.status(400).json({
          message: 'Something went wrong',
        })
      }
    } else {
      return res.status(400).json({ message: 'Something went wrong' })
    }
  })
}

