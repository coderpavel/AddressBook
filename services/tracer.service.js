"use strict";

const Tracer = require("moleculer-console-tracer");

module.exports = {
	name: "tracer",
	mixins: [Tracer],
	settings: {
		width: 100,
		gaugeWidth: 50
	}
};