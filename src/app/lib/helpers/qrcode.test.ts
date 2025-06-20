/* eslint-disable sonarjs/no-duplicate-string */

import { describe, expect, it } from "vitest";

import { QRCode } from "./qrcode";

describe("QRCode", () => {
	it("should create an instance from a string", () => {
		expect(QRCode.fromString("https://google.com")).toBeInstanceOf(QRCode);
	});

	it("should create an instance from an object", () => {
		expect(QRCode.fromObject({ url: "https://google.com" })).toBeInstanceOf(QRCode);
	});

	it("should turn the QR Code into a data URL", async () => {
		const actual = await QRCode.fromString("https://google.com").toDataURL();

		expect(actual).toMatch(/^data:image\/png;base64,/);
		expect(actual).toMatchSnapshot("qr-code-data-url");
	});

	it("should turn the QR Code into a data URL (with options)", async () => {
		const actual = await QRCode.fromString("https://google.com").toDataURL({ margin: 0, width: 250 });

		expect(actual).toMatch(/^data:image\/png;base64,/);
	});

	it("should turn into a utf-8 string if no argument is given", async () => {
		const result = await QRCode.fromString("https://google.com").toString();
		expect(result).toMatchSnapshot("qr-code-utf8");
	});

	it.each(["utf8", "svg", "terminal"] as const)("should turn into a %s string", async (dataset) => {
		const result = await QRCode.fromString("https://google.com").toString(dataset);
		expect(result).toMatchSnapshot(`qr-code-${dataset}`);
	});
});
