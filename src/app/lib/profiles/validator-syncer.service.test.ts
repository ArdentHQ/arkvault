import { describe } from "vitest";
import { ParallelValidatorSyncer, SerialValidatorSyncer } from "./validator-syncer.service";
import { test } from "@/utils/testing-library";
import { ClientService } from "@/app/lib/mainsail/client.service";

describe("ParallelValidatorSyncer", () => {
	const mockClientService = {
		validators: vi.fn().mockResolvedValue({
			items: () => [
				{ address: () => "validator1", publicKey: () => "pk1" },
				{ address: () => "validator2", publicKey: () => "pk2" },
			],
			currentPage: () => "1",
			lastPage: () => "1",
		}),
	} as unknown as ClientService;

	test("should fetch validators from single page", async () => {
		const syncer = new ParallelValidatorSyncer(mockClientService);
		const result = await syncer.sync();

		expect(result).toHaveLength(2);
		expect(mockClientService.validators).toHaveBeenCalledWith(undefined);
	});

	test("should fetch validators from multiple pages in parallel", async () => {
		const syncer = new ParallelValidatorSyncer(mockClientService);
		const result = await syncer.sync();

		expect(result).toHaveLength(2);
		expect(mockClientService.validators).toHaveBeenCalledTimes(2);
	});

	test("should pass query parameters", async () => {
		const syncer = new ParallelValidatorSyncer(mockClientService);
		await syncer.sync({ limit: 50 });

		expect(mockClientService.validators).toHaveBeenCalledWith({ limit: 50 });
	});
});

describe("SerialValidatorSyncer", () => {
	const mockClientService = {
		validators: vi.fn().mockResolvedValue({
			items: () => [{ address: () => "validator1", publicKey: () => "pk1" }],
			hasMorePages: () => false,
			nextPage: () => undefined,
		}),
	} as unknown as ClientService;

	test("should fetch validators from single page", async () => {
		const syncer = new SerialValidatorSyncer(mockClientService);
		const result = await syncer.sync();

		expect(result).toHaveLength(1);
	});

	test("should fetch validators from multiple pages", async () => {
		const clientServiceMock = {
			validators: vi
				.fn()
				.mockResolvedValueOnce({
					items: () => [{ address: () => "validator1", publicKey: () => "pk1" }],
					hasMorePages: () => true,
					nextPage: () => "2",
				})
				.mockResolvedValueOnce({
					items: () => [{ address: () => "validator2", publicKey: () => "pk2" }],
					hasMorePages: () => false,
					nextPage: () => undefined,
				}),
		} as unknown as ClientService;

		const syncer = new SerialValidatorSyncer(clientServiceMock);
		const result = await syncer.sync();

		expect(result).toHaveLength(2);
		expect(clientServiceMock.validators).toHaveBeenCalledTimes(2);
	});

	test("should pass query parameters across pages", async () => {
		const syncer = new SerialValidatorSyncer(mockClientService);
		await syncer.sync({ limit: 50 });

		expect(mockClientService.validators).toHaveBeenCalledWith({ limit: 50 });
	});
});
