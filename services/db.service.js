"use strict";

/**
 * db service
 */
module.exports = {

	name: "db",

	store: null,

	/**
	 * Service settings
	 */
	settings: {

	},

	/**
	 * Service metadata
	 */
	metadata: {

	},

	/**
	 * Service dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		/**
		* Test action
		*/
		create: {
			params: {
				key: { type: "number", integer: true, positive: true, convert: true },
				value: "string"
			},
			handler(ctx) {
				return this.store.set(ctx.params.key, ctx.params.value);
			}
		},

		update: {
			params: {
				key: { type: "number", integer: true, positive: true, convert: true },
				value: "string"
			},
			handler(ctx) {
				return this.store.set(ctx.params.key, ctx.params.value);
			}
		},

		get: {
			params: {
				key: { type: "number", integer: true, positive: true, convert: true }
			},
			handler(ctx) {
				return this.store.get(ctx.params.key);
			}
		},

		delete: {
			params: {
				key: { type: "number", integer: true, positive: true, convert: true }
			},
			handler(ctx) {
				return this.store.delete(ctx.params.key);
			}
		},

		count() {
			return this.store.size;
		},

		entries() {
			return [...this.store.entries()];
		}
	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
		this.store = new Map();
	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {
		// this.logger.info('DB started!');
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};
