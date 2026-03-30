import { beforeEach, describe, it, expect, vi } from "vitest";
import { ProfileFeeService } from "./fee.service";
import { IProfile } from "./contracts";
import { env, getMainsailProfileId } from "@/utils/testing-library";

describe("ProfileFeeService", () => {
	let feeService: ProfileFeeService;
	let profile: IProfile;

	beforeEach(() => {
		feeService = new ProfileFeeService();
		profile = env.profiles().findById(getMainsailProfileId());
	});

	describe("#all", () => {
		it("should throw an error when fees are not synchronized", () => {
			expect(() => feeService.all("mainsail.devnet")).toThrow(
				"The fees for [mainsail.devnet] have not been synchronized yet. Please call [syncFees] before using this method.",
			);
		});
	});

	describe("#findByType", () => {
		it("should throw when fees are not synchronized", () => {
			expect(() => feeService.findByType("mainsail.devnet", "transfer")).toThrow(
				"The fees for [mainsail.devnet] have not been synchronized yet. Please call [syncFees] before using this method.",
			);
		});
	});

	describe("#sync", () => {
		it("should sync fees for a profile", async () => {
			const mockedFees = { transfer: { avg: 2000, max: 3000, min: 1000 } };
			const mockNetwork = {
				fees: () => ({ all: async () => mockedFees }),
				id: () => "mainsail.devnet",
			};

			vi.spyOn(profile, "activeNetwork").mockReturnValue(mockNetwork as any);

			await feeService.sync(profile);

			expect(feeService.all("mainsail.devnet")).toEqual(mockedFees);
			vi.restoreAllMocks();
		});

		it("should throw if activeNetwork is not available", async () => {
			vi.spyOn(profile, "activeNetwork").mockImplementation(() => {
				throw new Error("No active network");
			});

			await expect(feeService.sync(profile)).rejects.toThrow();
			vi.restoreAllMocks();
		});
	});
});
