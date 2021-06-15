const path = require("path");
const express = require("express");

// middlewares
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

/**
 * app config
 * @param {*} app
 */
module.exports.appConfig = (app) => {
	//compression
	const compress = (req, res) => {
		if (req.headers["x-no-compression"]) return false;
		return compression.filter(req, res);
	};
	// disable express
	app.disable("x-powered-by");
	// middleware exec
	app.use(cors());
	app.use(helmet());
    app.use(express.urlencoded({ extended: true }));
	app.use(express.json());
	app.use(compression({ filter: compress, threshold: 0 }));
    // static files
	app.use(express.static(path.join(__dirname, '..', "public")));
	// cors handler
	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Credentials", true);
		res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Accept, X-No-Compression");
		if (req.method === "OPTIONS") {
			res.header("Access-Control-Allow-Methods", "POST, GET");
			return res.status(200).json({message: "Allowed request methods are 'POST, GET'."});
		}
		next();
	});
};

/**
 * function to handle any other error
 * @param {*} app
 */
module.exports.errorHandler = (app) => {
	app.use((req, res, next) => {
		const err = new Error("Link has been replaced or does not exit.");
		err.status = 404;
		next(err);
	});
	app.use(
		(error, req, res, next) => {
			res.status(error.status || 500).json({error: true, errorMsg: error.message});
		}
	);
};

/**
 * port config
 * @param {*} app
 */
module.exports.appPort = (app) => {
    app.listen(process.env.PORT, () => console.log("CAPTCHA server running on port " + process.env.PORT));
};
