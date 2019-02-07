"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
//const TestService = require("../../services/greeter.service");
const TestService = require("../../services/contact.service");

describe("Test 'contact' service", () => {
	let broker = new ServiceBroker();
	const service = broker.createService(TestService, { database: "unit_test" });
	const r = service.adapter.getR();

	const objTest = {
		id: "1",
		fullName: "Pavel",
		email: "9243031@gmail.com",
		phone: "+998909243031",
		wallets: {
			title: "XRP",
			currency: "Ripple",
			address: "555888222"
		}
	};


	beforeAll(() => broker.start().then(() => {
		return service.adapter.insert(objTest);
	}));

	afterAll(() => {
		return r.dbDrop("unit_test").run(service.client)
		.then(() =>  broker.stop());
	});
	/***************************************************************************************/
	describe("get an entity", () => {

		//async 
		it("should return Entity with name Pavel", () => {
			//result = await this.adapter.findById("1");
			expect(broker.call("contact.get")).resolves.toEqual(objTest);
		});

	});


});

