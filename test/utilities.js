const CryptoJs = require("crypto-js");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet('ABCDEFGHIJKLMNPQRSTUVWXYZ123456789', 6);

/**
 * function to generate 6 random alphanumeric values
 */
const randomVal = () => {
	const randomValue = nanoid();
	console.log('Random value generated==> ', randomValue);
	return randomValue;
}

/**
 * function to handle data encryption
 * @param {String} data 
 * @returns 
 */
const encryptData = (data) => {
	const enc = CryptoJs.AES.encrypt(data, process.env.ENCRYPTION_KEY).toString();
	console.log(`Encrypting ${data} to get ==>`, enc);
	return enc;
}

/**
 * function to handle data decryption
 * @param {String} data 
 * @returns 
 */
const decryptData = (data) => {
	const dec = CryptoJs.AES.decrypt(data, process.env.ENCRYPTION_KEY).toString(CryptoJs.enc.Utf8);
	console.log(`Decrypting ${data} to get==>`, dec);
	return dec;
}

/**
 * function to validate captcha code
 * @param {String} code 
 * @param {String} key 
 * @returns 
 */
const validateCaptcha = (code, key) => {
	// decrypt key
	const decKey = decryptData(key);
	const [mainP, timeStamp] = decKey.split('+', 2);
	// time interval b/w create and verification
	const captchaInterval = Date.now() - parseInt(timeStamp);
	// validate that mainP is equivalent to code && validate code expiration 
	console.log(`Validating client returned code:"${code}" and key:"${key}"... ==>`, true);
	return code === mainP && (captchaInterval <= (process.env.CAPTCHA_EXPIRATION * 60 * 1000));
}

module.exports = {
	randomVal,
	encryptData,
	decryptData,
	validateCaptcha,
};