"use strict";

const ApiGateway = require("moleculer-web");

module.exports = {
	name: "api",
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 8200,
		routes: [{
			path: "/api",
			aliases: {
				"GET contact/:id": "contact.get",
				"PUT contact/:id": "contact.update",
				"POST contact/:id": "contact.create",
				"DELETE contact/:id": "contact.remove",
				"REST contact": "contact"
			},
			bodyParsers: {
				json: true,
				urlencoded: true
			},
			whitelist: [
				// Access to any actions in all services under "/api" URL
				"**"
			],
		}],

		// Serve assets from "public" folder
		assets: {
			folder: "public"
		}
	}
};
