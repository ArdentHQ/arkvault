import { describe } from "@ardenthq/sdk-test";

import { QRCode } from "./qrcode";

describe("QRCode", async ({ assert, each, it, nock, loader }) => {
	it("should create an instance from a string", () => {
		assert.instance(QRCode.fromString("https://google.com"), QRCode);
	});

	it("should create an instance from an object", () => {
		assert.instance(QRCode.fromObject({ url: "https://google.com" }), QRCode);
	});

	it("should turn the QR Code into a data URL", async () => {
		const actual = await QRCode.fromString("https://google.com").toDataURL();

		assert.startsWith(actual, "data:image/png;base64,");
		assert.snapshot("qr-code-data-url", await QRCode.fromString("https://google.com").toDataURL());
	});

	it("should turn the QR Code into a data URL (with options)", async () => {
		const actual = await QRCode.fromString("https://google.com").toDataURL({ width: 250, margin: 0 });

		assert.startsWith(actual, "data:image/png;base64,");
	});

	it("should turn into a utf-8 string if no argument is given", async () => {
		assert.snapshot("qr-code-utf8", await QRCode.fromString("https://google.com").toString());
	});

	each(
		"should turn into a %s string",
		async ({ dataset }) => {
			assert.snapshot(`qr-code-${dataset}`, await QRCode.fromString("https://google.com").toString(dataset));
		},
		["utf8", "svg", "terminal"],
	);
});
