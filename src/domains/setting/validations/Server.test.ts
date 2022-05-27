import { server } from "./Server";

describe("Server validation", () => {
	it("should fail validation for trailing slash", () => {
		expect(
			server(() => "")
				.address([])
				.validate("http://domain.com/"),
		).not.toBe(true);
	});

	it("should fail validation for duplicate name", () => {
		expect(
			server(() => "")
				.name(
					[
						{
							name: "test2",
						},
						{
							name: "test",
						},
					],
					{
						test: "test2",
					},
				)
				.validate("test"),
		).not.toBe(true);
	});
});
