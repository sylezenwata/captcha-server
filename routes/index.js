const express = require("express");
const Route = express.Router();

const { errHandler, jsonRes, encryptData, decryptData, puzzleCode, validateCaptcha } = require("../utilities");

/**
 * base route
 */
Route.get('/v1/init', async (req, res) => {
    try {
        const { mainP, scambledP } = await puzzleCode();
        const timeStamp = Date.now();
        const key = await encryptData(`${mainP}+${timeStamp}`);
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

Route.post('/v1/validate', async (req, res) => {
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
})

module.exports = Route;