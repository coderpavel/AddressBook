"use strict";
const Redis = require('ioredis');
const DbService = require("moleculer-db");
const RethinkDBAdapter = require("moleculer-db-adapter-rethinkdb");
//let r = require("rethinkdb");
const uuidv4 = require('uuid/v4');
const QueueService = require("moleculer-bull");
const mailgun = require('mailgun-js')({ apiKey: "key-125dab0e857c04733b1f55f584eb41a3", domain: 'sandbox0b1f9b3711484f89a71c2e284e0e9221.mailgun.org' });

module.exports = {
	name: "contact",

	mixins: [DbService, QueueService()],

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
					pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i
				}
			},
			handler(ctx) {
				return this.redis.get(String(ctx.params.id)).then(contact => {
					const res = {
						code: "200",
						result: contact
					}
					return res;
				});

			}
		},// END OF GET ACTION

		create: {
			params: {
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

				const newContact = {
					id: uuidv4(),
					fullName: ctx.params.fullName,
					email: ctx.params.email,
					avatar: !ctx.params.avatar ? "default img link" : ctx.params.avatar,
					phone: ctx.params.phone,
					wallets: JSON.stringify(ctx.params.wallets)
				}

				this.redis.set(newContact.id, JSON.stringify(newContact))
					.then(() => {
						const res = {
							code: "200",
							result: newContact
						}
						console.log(res);
						return res;
					});
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
					empty: true
				},
				avatar: {
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
			async handler(ctx) {

				let { id, fullName, email, phone, avatar, wallets } = ctx.params;
				let userUpdate = await this.redis.get(String(id));

				userUpdate = {
					fullName: fullName,
					email: email,
					phone: phone,
					avatar: avatar,
					wallets: wallets

				}

				this.redis.set(String(id), JSON.stringify(userUpdate)).then(() => {
					const res = {
						code: "200",
						result: userUpdate
					}
					return res;
				});

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
				const {id} = ctx.params;
				const removedObj = await this.redis.get(String(id)).catch(err => {return err});
				return this.redis.del(String(id)).then(() => {
					const res = {
						code: "200",
						result: removedObj
					}
					return res;
				});
			}
		}, // END OF REMOVE ACTION

	},

	/**
	 * Events
	 */
	events: {

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