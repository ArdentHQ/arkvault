import { renderHook } from "@testing-library/react-hooks";
import { Contract } from "ethers";
import { useContract } from "./use-contract";
import * as polygonMigrationMock from "@/utils/polygon-migration";
import { waitFor } from "@/utils/testing-library";
import * as waitForMock from "@/utils/wait-for";

let polygonContractAddressSpy;

describe("useContract hook", () => {
	beforeAll(() => {
		vi.mock("ethers");
	});

	beforeEach(() => {
		polygonContractAddressSpy = vi
			.spyOn(polygonMigrationMock, "polygonContractAddress")
			.mockReturnValue("0x4a12a2ADc21F896E6F8e564a106A4cab8746a92f");
	});

	afterEach(() => {
		polygonContractAddressSpy.mockRestore();
	});

	it("should create a contract", () => {
		const { result } = renderHook(() => useContract());

		expect(result.current.contract).toBeInstanceOf(Contract);
	});

	it("should not create a contract if no contractAddress", () => {
		polygonContractAddressSpy.mockReturnValue(undefined);

		const { result } = renderHook(() => useContract());

		expect(result.current.contract).toBeUndefined();
	});

	it("should determine if contract is paused", async () => {
		const ethersMock = Contract.mockImplementation(() => ({
			paused: vi.fn().mockResolvedValue(true),
		}));

		const { result } = renderHook(() => useContract());

		expect(result.current.contractIsPaused).toBeUndefined();

		await waitFor(() => {
			expect(result.current.contractIsPaused).toBe(true);
		});

		ethersMock.mockRestore();
	});

	it("should determine if contract is not paused", async () => {
		const ethersMock = Contract.mockImplementation(() => ({
			paused: vi.fn().mockResolvedValue(false),
		}));

		const { result } = renderHook(() => useContract());

		expect(result.current.contractIsPaused).toBeUndefined();

		await waitFor(() => {
			expect(result.current.contractIsPaused).toBe(false);
		});

		ethersMock.mockRestore();
	});

	it("should determine if contract is not paused after interval", async () => {
		let reloadPausedStateCallback;

		const setInterval = window.setInterval;

		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback, time) => {
			if (callback.name === "reloadPausedStateCallback") {
				reloadPausedStateCallback = callback;
				return;
			}

			setInterval(callback, time);

			return 0;
		});

		let ethersMock = Contract.mockImplementation(() => ({
			paused: vi.fn().mockResolvedValue(true),
		}));

		const { result } = renderHook(() => useContract());

		await waitFor(() => {
			expect(result.current.contractIsPaused).toBe(true);
		});

		ethersMock = Contract.mockImplementation(() => ({
			paused: vi.fn().mockResolvedValue(false),
		}));

		reloadPausedStateCallback();

		expect(result.current.contractIsPaused).toBe(true);

		ethersMock.mockRestore();

		setIntervalSpy.mockRestore();
	});

	it("should get the migrations from the contract", async () => {
		const getMigrationsByArkTxHashMock = vi.fn();

		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: getMigrationsByArkTxHashMock,
		}));

		const { result } = renderHook(() => useContract());

		result.current.getContractMigrations(["0x123", "0x456"]);

		expect(getMigrationsByArkTxHashMock).toHaveBeenCalledWith(["0x123", "0x456"]);

		ethersMock.mockRestore();
	});

	it("should handle rpc error", async () => {
		const watiForSpy = vi.spyOn(waitForMock, "waitFor").mockImplementation(() => Promise.resolve());

		const getMigrationsByArkTxHashMock = vi.fn().mockImplementation(() => {
			throw new Error("RPC Error");
		});

		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: getMigrationsByArkTxHashMock,
		}));

		const { result } = renderHook(() => useContract());

		await expect(() => result.current.getContractMigrations(["0x123", "0x456"])).rejects.toThrowError();

		expect(getMigrationsByArkTxHashMock).toHaveBeenCalledTimes(7);

		ethersMock.mockRestore();

		watiForSpy.mockRestore();
	});
});
