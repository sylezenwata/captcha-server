// set library
const SET = require("./set");

/**
 * function run a function on window event
 * @param {String} event
 * @param {Function} func
 */
export function winClick(event, func, off = false) {
	if (off) {
		return window.off(event, func);
	}
	window.on(event, func, { once: true });
}

/**
 * function to validate data
 * @param {*|Array} data Data to validate
 * @param {Regex} regex
 * @returns {*|Array|Boolean}
 */
export function validateData(data, regex) {
	let dataIsArray = Array.isArray(data);
	let newData = [];
	data = dataIsArray ? data : [data];
	data.forEach((element) => {
		if (regex.test(element)) {
			newData.push(element);
		}
	});
	return dataIsArray
		? newData.length > 0
			? newData
			: false
		: newData.length > 0
		? newData[0]
		: false;
}

/**
 * function to stop event propagation
 * @param {Object} e
 */
export function eventPropagator(e) {
	e.stopPropagation();
}

/**
 * function to decipher puzzle
 */
export function unitaryBase(puzzle) {
	if ('string' !== typeof puzzle) {
		throw new Error('Expects parameter to be type string.');
	}
	let count = 0;
	let decipheredPuzzle = '';
	[...puzzle].map((eP, ePI) => {
		if (ePI + 1 - 7 === count) {
			decipheredPuzzle += eP;
			count = ePI + 1;
		}
	});
	return decipheredPuzzle;
}
