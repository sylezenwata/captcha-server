/**
 * server routes
 */


// dependencies
const express = require("express");
const Route = express.Router();
const { errHandler, jsonRes, encryptData, decryptData, puzzleCode, validateCaptcha } = require("../utilities");
const axios = require("axios");

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

// main route redirects to live-test route
Route.get('/', (req, res) => {
    res.redirect('/live-test');
});

// live-test route
Route.get('/live-test', (req, res) => {
    res.render('index.ejs');
});

// live-test form submission route
Route.post('/live-test', async (req, res) => {
    // define notification properties
    let msg = 'Unable to process request, try again.';
    let type = 'error';
    let formData = {};
    try {
        // get body
        const { full_name = null, email = null, subject = null, message = null, c = null, k = null, CAPTCHA = null } = req.body;
        formData = {full_name,email,subject,message};
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
            msg = 'Thank you for contacting us, we will reply you as soon as possible.';
            type = 'success';
            formData = {};
        } else {
            throw new Error('Error validating CAPTCHA code.');
        }
    } catch (error) {
        msg = errHandler(error, msg);
    }
    res.render('index.ejs', {notification: {msg, type}, formData });
});

// export route
module.exports = Route;