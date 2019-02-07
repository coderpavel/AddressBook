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
		wallets: {
			title: "XRP",
			currency: "Ripple",
			address: "555888222"
		}
	};


	// beforeAll(() => broker.start());
	beforeAll(() => broker.start().then(() => {
		return service.adapter.insert(objTest);
	})
		.then((obj) => {
			objTest.id = obj.id;
		})
	);

	afterAll(() => {
		return r.dbDrop(service.database).run(service.client)
			.then(() => broker.stop());
	});

	/**************************************** CREATE ***********************************************/

/*	describe("create a contact", () => {
		it("should create a contact", () => {
			expect(broker.call("contact.create", objTest)).then(obj => {
				objTest.id = obj.id;
			}).resolves.toEqual(objTest);
		}); // end of it
	});
*/
	/****************************************** GET *********************************************/
	describe("get a contact object", () => {
		it("should return contact object", () => {
			return broker.call("contact.get", { id: objTest.id }).then(res => {
				expect(res).toEqual(objTest);
			});
		});

	});

	/******************************************  UPDATE  *********************************************/

	describe("update a contact", () => {
		it("should update a contact", () => {
			objTest.fullName = "Alex";
			return broker.call("contact.update", objTest).then(newObj => {
				return broker.call("contact.get", { id: objTest.id }).then(res => {
					expect(res).toEqual(newObj);
				});
			});
		}); // end of it
	});


	/******************************************  REMOVE  *********************************************/

	describe("remove a contact", () => {
		it("should remove a contact", () => {
			return broker.call("contact.remove", objTest).then(res => {
				expect(res).toEqual({id: objTest.id});
			});
		}); // end of it
	});


});

