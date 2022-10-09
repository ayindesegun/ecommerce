require('dotenv').config()

module.exports = {
    serviceSID :process.env.SERVICE_SID,
    accountSID :process.env.TWILIO_ACCOUNT_SID,
    authToken :process.env.TWILIO_AUTH_TOKEN 
}