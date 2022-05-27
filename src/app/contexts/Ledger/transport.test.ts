/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@payvo/sdk-profiles";

import { supportedTransport, connectedTransport, openTransport, closeDevices } from "./transport";
import {
	env,
	getDefaultProfileId,
	mockNanoXTransport,
	mockLedgerTransportError,
	mockConnectedTransport,
	mockLedgerDevicesList,
} from "@/utils/testing-library";

describe("Ledger transport", () => {
	let profile: Contracts.IProfile;
	let ledgerListenSpy: jest.SpyInstance;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(() => {
		ledgerListenSpy = mockNanoXTransport();
	});

	afterEach(() => {
		ledgerListenSpy.mockRestore();
	});

	it("should get supported transport", async () => {
		await expect(supportedTransport()).resolves.toHaveProperty("listen");
	});

	it("should get opened transport", async () => {
		await expect(connectedTransport()).resolves.toBeDefined();
	});

	it("should throw unkown error when connecting to transport", async () => {
		const deviceConnectedMock = mockConnectedTransport(
			jest.fn().mockImplementationOnce(async () => {
				throw new Error("unknown error");
			}),
		);

		await expect(connectedTransport()).rejects.toThrow("unknown error");

		deviceConnectedMock.mockRestore();
	});

	it("should retry connecting if device is already opened", async () => {
		const deviceConnectedMock = mockConnectedTransport(
			jest.fn().mockImplementationOnce(async () => {
				throw new Error("The device is already open.");
			}),
		);

		await expect(connectedTransport()).resolves.not.toThrow("The device is already open.");

		deviceConnectedMock.mockRestore();
	});

	it("should open transport transport", async () => {
		await expect(openTransport()).resolves.toStrictEqual({
			descriptor: "",
			deviceModel: { id: "nanoX", productName: "Nano X" },
		});
	});

	it("should ignore transport open for unkown action type", async () => {
		ledgerListenSpy.mockRestore();

		ledgerListenSpy = mockNanoXTransport({ type: "unknown" });

		await expect(openTransport()).resolves.toStrictEqual({});
	});

	it("should throw transport opening error", async () => {
		ledgerListenSpy.mockRestore();

		ledgerListenSpy = mockLedgerTransportError();

		await expect(openTransport()).rejects.toThrow("error");
	});

	it("should close all open devices", async () => {
		ledgerListenSpy.mockRestore();

		const mockDevices = mockLedgerDevicesList(
			jest.fn().mockImplementation(() => [
				{
					close: jest.fn(),
					open: jest.fn(),
				},
				{
					close: () => {
						throw new Error("error");
					},
					open: jest.fn(),
				},
			]),
		);

		await expect(closeDevices()).resolves.not.toThrow();

		mockDevices.mockRestore();
	});
});
