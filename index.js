require("dotenv").config();
const express = require("express");

const app = express();

const { appConfig, errorHandler, appPort } = require("./config");

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