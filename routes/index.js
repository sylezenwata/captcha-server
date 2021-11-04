/**
 * server routes
 */


// dependencies
const express = require("express");
const Route = express.Router();
const { errHandler, jsonRes, encryptData, decryptData, puzzleCode, validateCaptcha } = require("../utilities");

/**
 * base initialize captcha
 */
Route.get('/v1/init', async (req, res) => {
    try {
        const { mainP, scambledP } = await puzzleCode();
        const timeStamp = Date.now();
        const key = encryptData(`${mainP}+${timeStamp}`);
        res.json(jsonRes(
                {
                    data: {
                        p: scambledP,
                        k: key
                    }
                }
            )
        );
    } catch (error) {
        let errMsg = errHandler(error,'Unable to process request, try again.');
        res.json(jsonRes({error: true, errorMsg: errMsg}));
    }
});

/**
 * route to validate code
 */
Route.post('/v1/validate', (req, res) => {
    try {
        let {c,k} = req.body;
        if (c.trim().length === 0) {
            throw new Error('Please enter CAPTCHA code.');
        }
        if (c.trim().length < 6 || c.trim().length > 6) {
            throw new Error('Invalid CAPTCHA code.');
        }
        if (k.trim().length === 0) {
            throw new Error('Invalid CAPTCHA data key, please refresh and try again.');
        }
        // validate CAPTCHA Code
        if (validateCaptcha(c, k)) {
            res.json(jsonRes({data: true}));
        } else {
            throw new Error('Error validating CAPTCHA code.');
        }
    } catch (error) {
        let errMsg = errHandler(error,'Unable to process request, try again.');
        res.json(jsonRes({error: true, errorMsg: errMsg}));
    }
});


/**
 * ===> Live Test <===
 */

const users = [
    {
        id: 1,
        name: "Jane Doe",
        email: "janedoe@gmail.com",
        password: "123456",
    },
    {
        id: 2,
        name: "John Doe",
        email: "johndoe@gmail.com",
        password: "123456"
    },
    {
        id: 3,
        name: "John Kennedy",
        email: "johnkennedy@gmail.com",
        password: "123456"
    },
];

// main route redirects to login route
Route.get('/', (req, res) => {
    res.redirect('/login');
});

// login route
Route.get('/login', (req, res) => {
    res.render('login.ejs', { showCaptcha: (req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https') });
});

// login form submission route
Route.post('/login', async (req, res) => {
    // define notification properties
    let msg = 'Unable to process request, try again.';
    let type = 'error';
    let formData = {};
    try {
        // get body
        const { email = null, password, c = null, k = null, CAPTCHA = null } = req.body;
        formData = {email};
        // val for non secure server
        if (req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https') {
            if (!CAPTCHA || !c || !k) {
                throw new Error('Captcha verification is required, refresh and try again.');
            }
            if (c.trim().length === 0) {
                throw new Error('Please enter CAPTCHA code.');
            }
            if (c.trim().length < 6 || c.trim().length > 6) {
                throw new Error('Invalid CAPTCHA code.');
            }
            if (k.trim().length === 0) {
                throw new Error('Invalid CAPTCHA data key, please refresh and try again.');
            }
            // validate CAPTCHA Code
            if (validateCaptcha(c,k)) {
                let userExists = users.filter((e) => e['email'] === email.trim().toLowerCase());
                if (userExists.length > 0) {
                    if (password === userExists[0]['password']) {
                        return res.redirect(`/dashboard?user=${userExists[0]['id']}&ssession=${new Date().getTime()}`)
                    } else {
                        throw new Error('Incorrect Login password.');
                    }
                } else {
                    throw new Error('Email not found.');
                }
            } else {
                throw new Error('Error validating CAPTCHA code.');
            }
        } else {
            let userExists = users.filter((e) => e['email'] === email.trim().toLowerCase());
            if (userExists.length > 0) {
                if (password === userExists[0]['password']) {
                    return res.redirect(`/dashboard?user=${userExists[0]['id']}&session=${new Date().getTime()}`)
                } else {
                    throw new Error('Incorrect Login password.');
                }
            } else {
                throw new Error('Email not found.');
            }
        }
    } catch (error) {
        msg = errHandler(error, msg);
    }
    res.render('login.ejs', {notification: {msg, type}, formData, showCaptcha: (req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https') });
});

const valAuth = (req, res, next) => {
    const {session} = req.query;
    const timeInterval = Date.now() - parseInt(session);
    if (timeInterval > (10 * 60 * 1000)) {
        return res.redirect('/login');
    }
    next();
}

// dashboard route
Route.get('/dashboard', valAuth, (req, res) => {
    let {user} = req.query;
    user = users[parseInt(user) - 1];
    res.render('dashboard.ejs', { user: user.name });
});

// dashboard route
Route.get('/logout', (req, res) => {
    res.redirect('/login');
});

// export route
module.exports = Route;