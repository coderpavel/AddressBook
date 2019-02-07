"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../services/greeter.service");

describe("Test 'contact' service", () => {
	let broker = new ServiceBroker();
	const service = broker.createService(TestService, { database: "unit-test" });
	const r = service.adapter.getR();



	beforeAll(() => broker.start().then(() => {
		return service.adapter.insert({
			id: "1",
			fullName: "Pavel",
			email: "9243031@gmail.com",
			phone: "+998909243031",
			wallets: {
				title: "XRP",
				currency: "Ripple",
				address: "555888222"
			}
		});
	}));

	afterAll(() => {
		r.dbDrop("unit-test").run(service.client);
		broker.stop();
	});
	/***************************************************************************************/
	describe("get an entity", () => {

		//async 
		it("should return Entity with name Pavel", () => {
			//result = await this.adapter.findById("1");
			expect(broker.call("contact.get").resolves.toMatchObject({
				id: "1",
				fullName: "Pavel",
				email: "9243031@gmail.com",
				phone: "+998909243031",
				wallets: {
					title: "XRP",
					currency: "Ripple",
					address: "555888222"
				});
		});

	});

	describe("Test 'greeter.welcome' action", () => {

		it("should return with 'Welcome'", () => {
			expect(broker.call("greeter.welcome", { name: "Adam" })).resolves.toBe("Welcome, Adam");
		});

		it("should reject an ValidationError", () => {
			expect(broker.call("greeter.welcome")).rejects.toBeInstanceOf(ValidationError);
		});

	});

});

