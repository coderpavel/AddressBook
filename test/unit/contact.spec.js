"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../services/contact.service");

describe("Test 'contact' service", () => {
	let broker = new ServiceBroker();
	const service = broker.createService(TestService, { database: "unit_test" });
	const r = service.adapter.getR();

	const objTest = {
		fullName: "Pavel",
		email: "9243031@gmail.com",
		phone: "+998909243031",
		wallets: [{
			title: "ETH",
			currency: "Ripple",
			address: "555888222"
		}]
	};


	// beforeAll(() => broker.start());
	beforeAll(() => broker.start()
		.then(() => {
			return service.adapter.insert(objTest);
		})
		.then((obj) => {
			objTest.id = obj.id;
		})
	);

	afterAll(() => {
	//	return r.dbDrop(service.database).run(service.client)
		//	.then(() => broker.stop());
	});

	/**************************************** CREATE ***********************************************/

	describe("create a contact", () => {
		it("should create a contact", () => {
			const objCreate = {
				fullName: "ALEX",
				email: "9243031@gmail.com",
				phone: "+998909243031",
				wallets: [{
					title: "ETH",
					currency: "Ripple",
					address: "555888222"
				}]
			};
			return broker.call("contact.create", objCreate).then(obj => {
				objCreate.id = obj.id;
				console.log(obj);
				expect(obj).toEqual(objCreate);
			});
		}); // end of it
	});

	/****************************************** GET *********************************************/
	describe("get a contact object", () => {
		it("GET should return contact object", () => {
			return broker.call("contact.get", { id: objTest.id }).then(res => {
				expect(res).toEqual(objTest);
			});
		});

	});
	/******************************************  UPDATE  *********************************************/

	describe("update a contact", () => {

		// it("should check ID param for update", () => {
		// 	const PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		// 	expect(PATTERN.test(objTest.id) && typeof (objTest.id) === 'string').toBe(true);
		// });

		// it("should check fullname params for update", () => {
		// 	expect(typeof (objTest.fullName) === 'string').toBe(true);
		// });

		// it("should check fullname, email params for update", () => {
		// 	const PATTERN = /.*@.*/;
		// 	expect(PATTERN.test(objTest.email) && typeof (objTest.email) === 'string').toBe(true);
		// });

		// it("should check phone params for update", () => {
		// 	expect(typeof (objTest.phone) === 'string').toBe(true);
		// });


		it("should update a contact", () => {
			objTest.fullName = "Alex3";
			return broker.call("contact.update", objTest).then(result => {
				return broker.call("contact.get", { id: result.id }).then(res => {
					expect(res).toEqual(objTest);
				});
			});
		});
	}); // end of it


	/******************************************  Check Wallet  *********************************************/
/*
	describe("Check wallet", () => {
		it("should create Wallets", () => {
			const PATTERN = /^ETH_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
			return broker.call("contact.get", { id: objTest.id }).then(res => {
				console.log("*********************** RESULT ***********************");
				console.log(PATTERN.test(res.wallets[0].address));
				console.log(res.wallets[0].address);
				
				setTimeout(expect(PATTERN.test(res.wallets[0].address)).toBe(true), 25000);
				
			});
		});
	});

*/
	/******************************************  REMOVE  *********************************************/
/*
	describe("remove a contact", () => {
		it("should remove a contact", () => {
			return broker.call("contact.remove", objTest).then(res => {
				expect(res).toEqual({ id: objTest.id });
			});
		}); // end of it
	});
*/


});

