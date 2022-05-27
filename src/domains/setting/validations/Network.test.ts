import { Networks } from "@payvo/sdk";
import { network } from "./Network";

const testAddress1 = "https://test.com";
const testAddress2 = "https://test1.com";
const testAddress3 = "https://test2.com";

describe("Network validation", () => {
	it("should fail validation for invalid addresses", () => {
		expect(
			network(() => "")
				.address([])
				.validate("invalid-address"),
		).not.toBe(true);

		expect(
			network(() => "")
				.explorer()
				.validate("invalid-address"),
		).not.toBe(true);
		expect(
			network(() => "")
				.knownWallets()
				.validate("invalid-address"),
		).not.toBe(true);
	});

	it("should fail validation for duplicate name", () => {
		expect(
			network(() => "")
				.name(
					[
						{
							name: "test2",
						} as Networks.NetworkManifest,
						{
							name: "test",
						} as Networks.NetworkManifest,
					],
					{
						test: "test2",
					},
				)
				.validate("test"),
		).not.toBe(true);
	});

	it("should accept a numeric value for slip", () => {
		expect(
			network(() => "")
				.slip44()
				.validate("1235"),
		).toBeUndefined();
	});

	it("should fail validation for invalid slip", () => {
		expect(
			network(() => "")
				.slip44()
				.validate("123a"),
		).not.toBe(true);
	});

	it("should accept numbers an letter for ticker", () => {
		expect(
			network(() => "")
				.ticker()
				.validate("1S3a"),
		).toBeUndefined();
	});

	it("should fail validation for ticker with invalid characters", () => {
		expect(
			network(() => "")
				.ticker()
				.validate("123a."),
		).not.toBe(true);
	});

	it("should fail validation for ticker with more than 5 chars", () => {
		expect(
			network(() => "")
				.ticker()
				.validate("a12345"),
		).not.toBe(true);
	});

	it("should not fail validation if not duplicate address", () => {
		expect(
			network(() => "")
				.address([
					{
						hosts: [
							{
								host: testAddress1,
								type: "full",
							},
						],
					} as Networks.NetworkManifest,
					{
						hosts: [
							{
								host: testAddress2,
								type: "full",
							},
						],
					} as Networks.NetworkManifest,
				])
				.validate(testAddress3),
		).toBe(true);
	});

	it("should fail validation for duplicate address", () => {
		expect(
			network(() => "")
				.address([
					{
						hosts: [
							{
								host: testAddress2,
								type: "full",
							},
						],
					} as Networks.NetworkManifest,
					{
						hosts: [
							{
								host: testAddress3,
								type: "full",
							},
						],
					} as Networks.NetworkManifest,
				])
				.validate(testAddress2),
		).not.toBe(true);
	});

	it("should not fail validation for duplicate address if current address", () => {
		expect(
			network(() => "")
				.address(
					[
						{
							hosts: [
								{
									host: testAddress2,
									type: "full",
								},
							],
						} as Networks.NetworkManifest,
						{
							hosts: [
								{
									host: testAddress3,
									type: "full",
								},
							],
						} as Networks.NetworkManifest,
					],
					{
						hosts: [
							{
								host: testAddress2,
								type: "full",
							},
						],
					} as Networks.NetworkManifest,
				)
				.validate(testAddress2),
		).toBe(true);
	});
});
