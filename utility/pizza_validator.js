var https = require('https');

exports.emailPizzaVerifier = function(email,cb) {
    https.get(`https://www.validator.pizza/email/`+email, (resp) => {
        var data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            data = JSON.parse(data);
            cb(null,data);
        })
    })
}
