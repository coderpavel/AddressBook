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

	queues: {
		"wallet.create"(job) {
			return new Promise(async (resolve) => {
				let newContact = job.data;

				for (let i = 0; newContact.wallets.length > i; i++) {
					switch (newContact.wallets[i].currency) {
						case "BTC":
							newContact.wallets[i].address = "BTC_" + uuidv4();
							this.redis.set(String(newContact.id), JSON.stringify(newContact));
							break;
						case "ETH":
							newContact.wallets[i].address = "ETH_" + uuidv4();
							this.redis.set(String(newContact.id), JSON.stringify(newContact));
							break;
						default:
							break;
					}
				}

				// wallet.created откуда и куда?
				this.broker.emit("wallet.created", newContact);

				resolve({
					done: true,
					id: newContact.id,
					wallets: newContact.wallets
				});


			});

		},


		"email.send"(job) {
			let newContact = job.data;
			// send
			return mailgun.messages().send({
				from: "Contact: <postmaster@sandbox0b1f9b3711484f89a71c2e284e0e9221.mailgun.org>",
				to: `${newContact.fullName} <${newContact.email}>`,
				subject: 'Hello',
				text: 'Testing some Mailgun awesomeness!'
			}).then(body => {
				this.logger.info(body);
				return Promise.resolve({ done: true, id: job.id });
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
				return this.redis.get(String(ctx.params.id)).then(contact => {
					console.log(contact);
					return contact;
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
			async handler(ctx) {

				const newContact = {
					id: uuidv4(),
					fullName: ctx.params.fullName,
					email: ctx.params.email,
					phone: ctx.params.phone,
					wallets: ctx.params.wallets
				}

				this.redis.set(newContact.id, JSON.stringify(newContact))
					// .then(contactStatus => {
					// 	console.log(contactStatus);
					// 	return contactStatus;
					// });
				
					.then(contact => {
						this.getQueue("wallet.create").on("global:completed", (job, res) => {
							this.logger.info(`Job #${job.id} completed!. Result:`, res);
						});

						this.getQueue("email.send").on("global:completed", (job, res) => {
							this.logger.info(`EMAIL has been sent!. Result:`, res);
						});

						this.createJob("wallet.create", contact);

						// Send
						this.createJob("email.send", contact);

						this.getQueue("email.send").getJobCounts().then(res => this.logger.info(res));

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
			async handler(ctx) {

				let { id, fullName, email, phone } = ctx.params;
				let user = await this.redis.get(String(id));

				user = {
					fullName: fullName,
					email: email,
					phone: phone

				}

				return this.redis.set(String(id), JSON.stringify(user));

			}
		}, // END OF UPDATE ACTION

		remove: {
			params: {
				id: {
					type: "string",
					empty: false
				}
			},
			handler(ctx) {
				this.redis.del(String(ctx.params.id));
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