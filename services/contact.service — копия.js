"use strict";
const uuidv1 = require('uuid/v1');
const Redis = require('ioredis');

module.exports = {
	name: "contact",

	/**
	 * Service settings
	 */
	settings: {

	},

	/**
	 * Service dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {

		create: {
			params: {
				id: [{
					type: "string",
					empty: false
				},
				{
					type: "number",
					integer: true,
					convert: true,
					positive: true,
					empty: false
				}],
				/*	fullName: {
						type: "object", props: {
							firstName: {
								type: "string",
								empty: false
							},
							lastName: {
								type: "string",
								empty: false
							}
						}
					},
				*/
				fullName: {
					type: "string",
					empty: false
				},
				email: {
					type: "string",
					empty: false
				},
				phone: {
					type: "string",
					empty: false
				},
				wallets: {
					type: "array", items: "object", props: {
						title: {
							type: "string",
							empty: false
						},
						currency: {
							type: "string",
							empty: false
						}
					}
				}
			},
			handler(ctx) {
				const { id, fullName, email, phone, wallets } = ctx.params;
				this.broker.emit("contact.create", [id, fullName, email, phone, wallets]);
			}
		},
		get: {
			params: {
				id: {
					type: "string",
					empty: "false"
				}
			},
			async handler(ctx) {
				const result = await this.redis.get(String(ctx.params.id));
				return JSON.parse(result);
			}
		}
	},

	/**
	 * Events
	 */
	events: {
		async "contact.create"([id, fullName, email, phone, wallets]) {

			wallets.address = await this.broker.emit("wallet.create", wallets);

			const newContact = {
				fullName: fullName,
				email: email,
				phone: phone,
				wallets: wallets
			}

			this.redis.set(String(id), JSON.stringify(newContact));

			// console.log(JSON.stringify(newContact));
		},
		

	},

	/**
	 * Methods
	 */
	methods: {

	}

},

	/**
	 * Service created lifecycle event handler
	 */
	async created() {
	this.redis = await new Redis();
},

/**
 * Service started lifecycle event handler
 */
started() {

},

/**
 * Service stopped lifecycle event handler
 */
stopped() {

}
};