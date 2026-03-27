import { beforeEach, describe, it, expect, vi } from "vitest";
import { Migrator } from "./migrator";

describe("Migrator", () => {
	let migrator: Migrator;
	let mockProfile: any;
	let mockData: any;

	beforeEach(() => {
		mockData = {
			get: vi.fn().mockReturnValue("0.0.0"),
			restore: vi.fn(),
			set: vi.fn(),
			snapshot: vi.fn(),
		};

		mockProfile = {
			data: vi.fn().mockReturnValue(mockData),
			status: vi.fn().mockImplementation(() => ({
				markAsDirty: vi.fn(),
			})),
		};

		migrator = new Migrator(mockProfile, mockData);
	});

	describe("#migrate", () => {
		it("should migrate to a newer version", async () => {
			const migrations = {
				"1.0.0": vi.fn().mockResolvedValue(undefined),
			};

			await migrator.migrate(migrations, "1.0.0");

			expect(mockData.snapshot).toHaveBeenCalled();
		});

		it("should restore and throw on migration failure", async () => {
			const migrations = {
				"1.0.0": vi.fn().mockRejectedValue(new Error("Migration failed")),
			};

			await expect(migrator.migrate(migrations, "1.0.0")).rejects.toThrow(
				"Something went wrong during the migration! Changes applied to the store until this failed migration will be restored.",
			);

			expect(mockData.restore).toHaveBeenCalled();
		});

		it("should handle range format versions", async () => {
			const migrations = {
				">=1.0.0": vi.fn().mockResolvedValue(undefined),
			};

			await migrator.migrate(migrations, "1.0.0");

			expect(mockData.snapshot).toHaveBeenCalled();
		});

		it("should skip already migrated versions", async () => {
			mockProfile.data.mockReturnValue({
				...mockData,
				get: vi.fn().mockReturnValue("0.5.0"),
			});

			const migrations = {
				"0.5.0": vi.fn().mockResolvedValue(undefined),
				"1.0.0": vi.fn().mockResolvedValue(undefined),
			};

			await migrator.migrate(migrations, "1.0.0");

			expect(migrations["0.5.0"]).not.toHaveBeenCalled();
		});

		it("should skip versions greater than target version", async () => {
			const migrations = {
				"2.0.0": vi.fn().mockResolvedValue(undefined),
			};

			await migrator.migrate(migrations, "1.0.0");

			expect(migrations["2.0.0"]).not.toHaveBeenCalled();
		});

		it("should handle exact version match", async () => {
			const migrations = {
				"1.0.0": vi.fn().mockResolvedValue(undefined),
			};

			await migrator.migrate(migrations, "1.0.0");

			expect(migrations["1.0.0"]).toHaveBeenCalled();
		});
	});
});
