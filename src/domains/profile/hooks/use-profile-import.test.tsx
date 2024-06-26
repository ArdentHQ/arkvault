/* eslint-disable @typescript-eslint/require-await */
import fs from "fs";
import { act, renderHook } from "@testing-library/react";

import { ReadableFile } from "@/app/hooks/use-files";
import { useProfileImport } from "@/domains/profile/hooks/use-profile-import";
import { env } from "@/utils/testing-library";

let wwe: ReadableFile;
let passwordProtectedWwe: ReadableFile;
let json: ReadableFile;
let jsonCorrupted: ReadableFile;
let jsonEmpty: ReadableFile;

describe("useProfileImport", () => {
	beforeAll(() => {
		const jsonEmptyContent = fs.readFileSync("src/tests/fixtures/profile/import/d2_test_wallets-empty.json");
		const jsonContent = fs.readFileSync("src/tests/fixtures/profile/import/d2_test_wallets.json");
		const wweFileContents = fs.readFileSync("src/tests/fixtures/profile/import/profile.wwe");
		const passwordProtectedWweFileContents = fs.readFileSync(
			"src/tests/fixtures/profile/import/password-protected-profile.wwe",
		);

		wwe = { content: wweFileContents.toString(), extension: "wwe", name: "profile.wwe" };
		passwordProtectedWwe = {
			content: passwordProtectedWweFileContents.toString(),
			extension: "wwe",
			name: "export",
		};

		json = { content: jsonContent.toString(), extension: "json", name: "export" };
		jsonCorrupted = { content: jsonContent.toString() + "...", extension: "json", name: "export" };
		jsonEmpty = { content: jsonEmptyContent.toString(), extension: "json", name: "export" };
	});

	it("should import profile from wwe", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			const profile = await result.current.importProfile({ file: wwe });

			expect(profile?.name()).toBe("test");
		});
	});

	it("should import password protected profile from wwe", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			const profile = await result.current.importProfile({
				file: passwordProtectedWwe,
				password: "S3cUrePa$sword",
			});

			expect(profile?.name()).toBe("test");
		});
	});

	it.each(["Reason: Unexpected token", "unexpected character at line", "Unexpected identifier", "Reason: Malformed"])(
		"should require password for %s",
		async (error) => {
			const mockProfileImport = vi.spyOn(env.profiles(), "import").mockImplementation(() => {
				throw new Error(error);
			});
			const { result } = renderHook(() => useProfileImport({ env }));

			await act(async () => {
				await expect(result.current.importProfile({ file: passwordProtectedWwe })).rejects.toThrow(
					"PasswordRequired",
				);
			});

			mockProfileImport.mockRestore();
		},
	);

	it("should throw for invalid password", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			await expect(
				result.current.importProfile({ file: passwordProtectedWwe, password: "test" }),
			).rejects.toThrow("Failed to decode or decrypt the profile. Reason: Malformed UTF-8 data");
		});
	});

	it("should throw for unknown error in import", async () => {
		const mockProfileImport = vi.spyOn(env.profiles(), "import").mockImplementation(() => {
			throw new Error("some error");
		});
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			await expect(
				result.current.importProfile({ file: passwordProtectedWwe, password: "test" }),
			).rejects.toThrow("some error");
		});
		mockProfileImport.mockRestore();
	});

	it("should import from json file", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			const profile = await result.current.importProfile({ file: json });

			expect(profile?.wallets().count()).toBe(2);
		});
	});

	it("should return undefined if file is not provided", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			//@ts-ignore
			const profile = await result.current.importProfile({});

			expect(profile).toBeUndefined();
		});
	});

	it("should throw if json has missing wallets", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			await expect(result.current.importProfile({ file: jsonEmpty })).rejects.toThrow("MissingWallets");
		});
	});

	it("should throw if json is corrupted", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			await expect(result.current.importProfile({ file: jsonCorrupted })).rejects.toThrow("CorruptedData");
		});
	});

	it("should ignore unknown file extension", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			const response = await result.current.importProfile({
				file: { content: "", extension: "txs", name: "test" },
			});

			expect(response).toBeUndefined();
		});
	});
});
