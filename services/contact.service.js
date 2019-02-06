"use strict";
//const Redis = require('ioredis');
//const client = Redis.createClient();
const DbService = require("moleculer-db");
const RethinkDBAdapter = require("moleculer-db-adapter-rethinkdb");
let r = require("rethinkdb");
const uuidv4 = require('uuid/v4');

module.exports = {
	name: "contact",

	mixins: [DbService],
	adapter: new RethinkDBAdapter(),
	database: "posts",
	table: "posts",
	settings: {
		fields: ["id", "name"]
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
					pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i
				}
			},
			handler(ctx) {
				const { id } = ctx.params;
				return this.Promise.resolve(id)
					.then(contact => this.adapter.findById(String(id)))
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
				const { fullName, email, phone, wallets } = ctx.params;
				const id = 'contact_' + uuidv4();
				return this.broker.emit("contact.create", [id, fullName, email, phone, wallets]);
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
			handler(ctx) {
				let { id, fullName, email, phone, walletsTitle } = ctx.params;


				const getUser = () => new Promise(resolve => resolve(this.adapter.findById(String(id)))); 
				// Почему цепочкой без getUser() не пашет
				getUser().then(userFromDb => {
					return new Promise((resolve) => {

							userFromDb.email = email,
							userFromDb.fullName = fullName,
							userFromDb.phone = phone
							userFromDb.wallets.title = walletsTitle // не заносит
						
						// Q: Вот так не получается и с ... тоже не получилось
						/* 
						let userToEdit = userFromDb;
						userToEdit = { 
							email: email,
							fullName: fullName,
							phone: phone
						}*/
						resolve(userFromDb);
					})
				}).then(userEdited => {
					console.log(userEdited)
					this.adapter.updateById(String(id), userEdited)
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
				const { id } = ctx.params;
				return this.Promise.resolve(id)
					.then(contact => this.adapter.removeById(String(id)))
			}
		}, // END OF REMOVE ACTION

		list() {
			return this.adapter.find();
		}
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
			return this.Promise.resolve(newContact)
				.then(contact => this.adapter.insert(newContact))
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
		//this.redis = await new Redis();
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