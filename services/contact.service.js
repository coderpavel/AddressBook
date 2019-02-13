	"use strict";
//const Redis = require('ioredis');
//const client = Redis.createClient();
const DbService = require("moleculer-db");
const RethinkDBAdapter = require("moleculer-db-adapter-rethinkdb");
let r = require("rethinkdb");
const uuidv4 = require('uuid/v4');
const QueueService = require("moleculer-bull");

module.exports = {
	name: "contact",

	mixins: [DbService, QueueService()],
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

	queues: {
		"wallet.create"(job) {
			this.logger.info("New job received!", job.data);
			job.progress(10);

			return this.Promise.resolve({
				done: true,
				id: job.data.id,
				worker: process.pid
			});
		}
	},

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
			async handler(ctx) {
				// const { fullName, email, phone, wallets } = ctx.params;

				const newContact = {
					fullName: ctx.params.fullName,
					email: ctx.params.email,
					phone: ctx.params.phone,
					wallets: ctx.params.wallets
				}

				/*
				const contactInserted = await this.adapter.insert(newContact);
				console.log("******** => : " + (contactInserted));

				const walletCreated = await this.broker.emit("wallet.create", contactInserted);
				console.log("******** => : " + (walletCreated));
				return walletCreated;
*/
				/*
								let promise = new Promise((resolve) => {
									resolve(this.adapter.insert(newContact))
								}).then(contact => {
									this.broker.emit("wallet.create", contact);
								});
								console.log(promise);
								return promise;
								*/

				
					return this.adapter.insert(newContact).then(contact => {
						this.broker.emit("wallet.create", contact);
						return contact;
					});
				

			}
		}, // END OF CREATE ACTION

		update: {
			params: {
				id: {
					type: "string",
					empty: true
				},
				fullName: {
					type: "string",
					empty: true
				},
				email: {
					type: "string",
					empty: true
				},
				phone: {
					type: "string",
					empty: true
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
				let { id, fullName, email, phone, wallets } = ctx.params;


				return this.adapter.findById(String(id)).then(userFromDb => {
					return new Promise((resolve) => {
						// Q: Вот так ...  не получилось,заполнить объект
						userFromDb.email = email,
							userFromDb.fullName = fullName,
							userFromDb.phone = phone
						userFromDb.wallets[0].title = wallets[0].title
						userFromDb.wallets[0].currency = wallets[0].currency
						userFromDb.wallets[0].address = wallets[0].address
						resolve(userFromDb);
					})
				}).then(userEdited => {
					const objTest = {
						fullName: "Pavel",
						email: "9243031@gmail.com",
						phone: "+998909243031",
						wallets: [{
							title: "XRP",
							currency: "Ripple",
							address: "555888222"
						}]
					};
					return this.adapter.updateById(String(id), userEdited)
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
		"wallet.create"(newContact) {
			for (let i = 0; newContact.wallets.length > i; i++) {
				switch (newContact.wallets[i].currency) {
					case "BTC":
						newContact.wallets[i].address = "BTC_" + uuidv4();
						this.adapter.updateById(String(newContact.id), newContact).then(walletCreated => {
							return walletCreated;
						});
						break;
					case "ETH":
						newContact.wallets[i].address = "ETH_" + uuidv4();
						this.adapter.updateById(String(newContact.id), newContact).then(walletCreated => {
							return walletCreated;
						});
						break;
					default:
						break;
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