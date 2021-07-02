"use strict";

// css files
require("../css/animate.css");
require("../css/ca.css");

// modules
const SET = require("./set");
const { unitaryBase } = require("./mods");

// base url
const BASE_URL = 'http://localhost:4040/v1';

// vars
const captchaCon = SET.$('#captchaContainer');
const initCon = captchaCon.getElem('.init-con');
const initCheckbox = captchaCon.getElem('.init-check input[type=checkbox]');
let initCheckboxChecked = false;
/**
 * init captcha popup
 */
initCheckbox.onclick = function(e) {
    if (!initCheckboxChecked) {
        // prevent default check
        e.stopPropagation();
        e.preventDefault();
    }
    initCaptchaPopup(e);
};
/**
 * init popup func
 * @param {*} e 
 * @returns 
 */
function initCaptchaPopup(e) {
    // val already checked
    if (initCheckboxChecked === true) {
        clearance(true);
    }
    // val popup already exists
    if (captchaCon.getElem('#captchaPopup')) {
        window.stop();
        return clearance(true);
    }
    // initialize popup
    createCaptchaPopup();
}
/**
 * create popup func
 * @returns 
 */
function createCaptchaPopup() {
    // initiate loader
    let popup = `<div id="captchaPopup"><div id="loader" class="text-c">Please wait...</div><span class="drop-arrow drop-arrow__down"></span></div>`;
    // display popup
    initCon.appendElem(popup);
    initCheckbox.getParent('init-check').prependElem(`<div class="check__val"></div>`);
    sendRequest(`${BASE_URL}/init`, (res, err) => {
        if (err) 
            return alert(`${err.code ? err.code+': ' : ''}${err.msg}`);
        const { error, errorMsg, data } = res;
        if (error) 
            return alert(`${errorMsg}`);
        if (data) 
            return displayCanvas(data);
        alert('An error occurred processing request.');
    });
}
/**
 * send ajax func
 * @param {String} url 
 * @param {Function} callBack 
 * @param {String} method 
 */
function sendRequest(url,callBack,method = 'GET', body = null) {
    SET.ajax({
        method,
        url,
        body,
        handler: (res, err) => {
            callBack && callBack(res, err);
        },
        withCredentials: false,
    });
}
/**
 * display canvas func
 * @param {Object} data 
 */
function displayCanvas(data) {
    const { p, k } = data;
    let temp = `<div class="cp__content">
            <div class="cp__layer-1">
                <button title="Refresh" type="button" class="btn icon stroke">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                        <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                    </svg>
                </button>
            </div>
            <div class="cp__layer-2">
                <input type="text" data-key="" placeholder="Enter code" autocomplete="off">
                <button type="button">submit</button>
            </div>
        </div>`;
    // remove loader
    SET.removeElem(captchaPopup.getElem('#loader'));
    captchaCon.getElem('#captchaPopup').prependElem(temp);
    createCanvas(p,k);
    activateValidation();
}
/**
 * create canvas func
 * @param {String} puzzle 
 * @param {String} key 
 */
function createCanvas(puzzle,key) {
    const popupCon = captchaCon.getElem('#captchaPopup');
    let canvas = document.createElement('canvas');
    let canvasCtx = canvas.getContext('2d');
    canvasCtx.font = 'italic 60px MomsTypewriter';
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'middle';
    canvasCtx.fillText(unitaryBase(puzzle).split('').join(String.fromCharCode(8202)), canvas.width/2, 80);
    SET.removeElem(captchaCon.getElem('#captchaPopup').getElem('.cp__layer-1 canvas'));
    // render canvas and set key
    popupCon.getElem('.cp__layer-1').prepend(canvas);
    popupCon.getElem('.cp__layer-2 input[data-key]').attr('data-key', key);
    refresh();
}
/**
 * refresh canvas func
 */
function refresh() {
    const refreshBtn = captchaCon.getElem('.cp__layer-1 button');
    const startRefresh = () => {
        SET.fixClass([refreshBtn],[['spin']],[true]);
        sendRequest(`${BASE_URL}/init`, (res, err) => {
            SET.fixClass([refreshBtn],[['spin']],[false]);
            refreshBtn.off('click', startRefresh);
            if (err) 
                return alert(`${err.code ? err.code+': ' : ''}${err.msg}`);
            const { error, errorMsg, data } = res;
            if (error) 
                return alert(`${errorMsg}`);
            if (data) {
                const { p,k } = data;
                return createCanvas(p,k);
            }
            alert('An error occurred processing request.');
        });
    }
    refreshBtn.on('click', startRefresh);
}
/**
 * validation func
 */
function activateValidation() {
    const popupCon = captchaCon.getElem('#captchaPopup');
    const valBtn = popupCon.getElem('.cp__layer-2 button');
    const validate = () => {
        const clientCode = popupCon.getElem('.cp__layer-2 input').value;
        const clientKey = popupCon.getElem('.cp__layer-2 input').attr('data-key');
        if (clientCode.trim().length === 0) {
            return alert('Please enter code.');
        }
        if (clientCode.trim().length < 6 || clientCode.trim().length > 6) {
            return alert('Invalid code.');
        }
        if (clientKey.trim().length === 0) {
            return alert('Invalid data key, please refresh and try again.');
        }
        submitLoader();
        const cb = (res, err) => {
            submitLoader(null);
            if (err) 
                return alert(`${err.code ? err.code+': ' : ''}${err.msg}`);
            const { error, errorMsg, data } = res;
            if (error) 
                return alert(`${errorMsg}`);
            if (data && (data === true)) {
                return confirmValidation(clientCode,clientKey);
            }
            alert('An error occurred processing request.');
        }
        sendRequest(`${BASE_URL}/validate`, cb, 'POST', {c: clientCode, k: clientKey});
    }
    valBtn.on('click', validate);
}
/**
 * set loader when validating func
 * @param {String|null} msg 
 * @returns 
 */
function submitLoader(msg = 'Validating...') {
    const popupCon = captchaCon.getElem('#captchaPopup');
    if (!msg) {
        return popupCon.attr('data-validate', false);
    }
    popupCon.attr('data-validate', msg);
}
/**
 * function to check CAPTCHA checkbox
 * @param {string} c CAPTCHA code
 * @param {string} k CAPTCHA keys
 */
function confirmValidation(c,k) {
    clearance();
    initCheckbox.checked = true;
    initCheckboxChecked = true;
    captchaCon.getElem('input[name=c]').value = c;
    captchaCon.getElem('input[name=k]').value = k;
    initCheckbox.getParent('init-check').prependElem(`<div class="checked"></div>`);
}
/**
 * function to remove CAPTCHA popup and optionally uncheck CAPTCHA checkbox
 * @param {boolean} clearChecked 
 */
function clearance(clearChecked = false) {
    SET.removeElem('#captchaPopup');
    SET.removeElem(initCheckbox.getSibling(null, '.check__val'));
    if (clearChecked) {
        initCheckbox.checked = false;
        initCheckboxChecked = false;
        captchaCon.getElem('input[name=c]').value = '';
        captchaCon.getElem('input[name=k]').value = '';
        SET.removeElem(initCheckbox.getSibling(null, '.checked'));
    }
}
