const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mnaufal98@gmail.com',
        pass: 'zfrbwmxkbytzfhra',
    },
    tls: {
        rejectUnauthorized: false,
    },
});

module.exports = transporter;