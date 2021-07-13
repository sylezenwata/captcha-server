/**
 * server index file
 */

// dependencies
require("dotenv").config();
const express = require("express");

// app
const app = express();

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
appPort(app);