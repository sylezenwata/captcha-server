require("dotenv").config();

const {
    randomVal, 
    encryptData, 
    decryptData,
    validateCaptcha
} = require("./utilities");

// test('Check if randomVal function returns 6 alphanumeric random values.', () => {
//     expect(randomVal()).toMatch(/[A-Z1-9]{6}/);
// });

// test('Check if encryptData function is successful.', () => {
//     const data = `W52YJL+${Date.now()}`;
//     expect(encryptData(data)).toMatch(/.+/);
// });

// test('Check if decryptData function is successful.', () => {
//     const data = `U2FsdGVkX1/IKYSMGEI/hXWp1zuGAvq7xIaC5zZHYJJM+1Tq6gkG+HoFCsv6hw8O`;
//     expect(decryptData(data)).toMatch(/^([A-Z1-9]{6})\+([\d]+)$/);
// });

// test('Check if validateCaptcha function is successful.', () => {
//     const code = 'W52YJL';
//     const key = `U2FsdGVkX1/IKYSMGEI/hXWp1zuGAvq7xIaC5zZHYJJM+1Tq6gkG+HoFCsv6hw8O`;
//     expect(validateCaptcha(code, key)).toBeTruthy();
// });

// js pipe
const pipe = (...fns) => (...args) => fns.reduce((arg, fn) => fn(arg), ...args);

// pipe functions
const systemTest = pipe(
    randomVal(),
    rValue => [rValue, encryptData(`${rValue}+${Date.now()}`)],
    ([...args]) => validateCaptcha(args[0],args[1])
);

// system test
test('CAPTCHA system test.', () => {
    expect(systemTest()).toBeTruthy();
});