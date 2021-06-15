const CryptoJs = require("crypto-js");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet('ABCDEFGHIJKLMNPQRSTUVWXYZ123456789', 6);

/**
 * function to handle error
 * @param {String} error 
 * @param {String} initStmt 
 * @returns {String} errorMsg
 */
const errHandler = (error, initStmt) => {
	let errMsg = initStmt;
	if (error.message) {
		errMsg = error.message;
	}
	if (error.errors) {
		let err = error.errors[0];
		errMsg = err.message;
		// if (err.type === 'unique violation') {
		// 	errMsg = `${err.path} '${err.value}' already exists.`;
		// }
	}
	return errMsg;
}

/**
 * function to handle json response
 * @param {Object} param0
 * @returns {Object}
 */
const jsonRes = ({
	error = false,
	errorMsg = null,
	data = null,
}) => {
	return {
		error,
		errorMsg,
		data,
	};
};

/**
 * function to generate 6 random alphanumeric values
 */
const randomVal = () => {
	return nanoid();
}

/**
 * function to generate and scramble captcha code
 * @returns 
 */
const puzzleCode = async () => {
	const mainP = randomVal();
	const scambledP = randomVal()+(mainP.split('').join(randomVal()))+randomVal();
	return {
		mainP,
		scambledP
	}
}

/**
 * function to handle data encryption
 * @param {String} data 
 * @returns 
 */
const encryptData = (data) => {
	return CryptoJs.AES.encrypt(data, process.env.ENCRYPTION_KEY).toString();
}

/**
 * function to handle data decryption
 * @param {String} data 
 * @returns 
 */
const decryptData = (data) => {
	return CryptoJs.AES.decrypt(data, process.env.ENCRYPTION_KEY).toString(CryptoJs.enc.Utf8);
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
	// validate that mainP is equivalent to code
	if (code !== mainP) {
		throw new Error('Incorrect CAPTCHA code.');
	}
	// validate code expiration
	const captchaInterval = Date.now() - parseInt(timeStamp);
	if (captchaInterval > (process.env.CAPTCHA_EXPIRATION * 60 * 1000)) {
		throw new Error('CAPTCHA code has expired, refresh and try again.');
	}
	return true;
}

module.exports = {
    errHandler,
    jsonRes,
	randomVal,
	puzzleCode,
	encryptData,
	decryptData,
	validateCaptcha,
};