"use strict";
const Redis = require('ioredis');
const uuidv4 = require('uuid/v4');

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

		get: {
			params: {
				id: {				
					type: "string",
					empty: false
				}
			},
			 handler(ctx) {
				return  this.redis.get(String(ctx.params.id));
			}
		},// END OF GET ACTION

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
						},
						address: {
							type: "string",
							empty: true		
						}
					}
				}
			},
			handler(ctx) {
				console.log(Object.values(ctx.params));
				const { id, fullName, email, phone, wallets } = ctx.params;
				return this.broker.emit("contact.create", [id, fullName, email, phone, wallets]);
				//return this.broker.emit("contact.create", [...ctx.params]);
			}
		}, // END OF CREATE ACTION

		update: {
			params: {
				id: {
					type: "string",
					empty: false
				},
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
				walletsTitle: {
					type: "string",
					empty: false
				}
			},
			async handler(ctx) {
				let { id, fullName, email, phone, wallets } = ctx.params;
				let user = await this.redis.get(String(ctx.params.id));
				// Q: Если всё сеттить через user = {} то перезапишет address
				user.fullName = fullName;
				user.email = email;
				user.fullName = fullName;
				user.phone = phone;
				user.title = walletsTitle;

				return this.redis.set(String(ctx.params.id), user);
			}
		}, // END OF UPDATE ACTION

		remove: {
			params: {
				id: {
					type: "string",
					empty: false
				}
			},
			async handler(ctx) {
				return this.redis.del(String(ctx.params.id));
			}
		} // END OF REMOVE ACTION

	},

	/**
	 * Events
	 */
	events: {
		"contact.create"([id, fullName, email, phone, wallets]) {

			wallets.address = this.broker.emit("wallet.create", wallets);

			const newContact = {
				fullName: fullName,
				email: email,
				phone: phone,
				wallets: wallets
			}

			this.redis.set(String(id), JSON.stringify(newContact));

			// console.log(JSON.stringify(newContact));
		},
		"wallet.create"(wallets) {

			for (let i = 0; wallets.length > i; i++) {

				switch (wallets[i].currency) {
					case "BTC":
						wallets[i].address = "BTC_" + uuidv4();
						break;
					case "XRP":
						wallets[i].address = "XRP_" + uuidv4();
						break;
					default:
				}
			} // For End
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