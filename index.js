/**
 * server index file
 */

// dependencies
require("dotenv").config();
const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");

// app
const app = express();

// https server
let httpsServerOptions = {
    'cert': fs.readFileSync("./https/cert.pem"),
    'key': fs.readFileSync("./https/key.pem")
};

let httpServer = http.createServer(app);
let httpsServer = https.createServer(httpsServerOptions, app);

// app config, errorHnadler & port
const { appConfig, errorHandler, appPort } = require("./config");

// routes
const Routes = require("./routes");

/**
 * app config
 */
appConfig(app);

/**
 * routes
 */
app.use(Routes);

/**
 * error handler
 */
errorHandler(app);

/**
 * listening to port
 */
httpServer.listen(process.env.PORT, () => console.log("CAPTCHA server running on port " + process.env.PORT));
httpsServer.listen(process.env.PORT_S, () => console.log("CAPTCHA server running on port " + process.env.PORT_S));