/* eslint-disable @typescript-eslint/require-await */
import fs from "fs";
import { act, renderHook } from "@testing-library/react";

import { ReadableFile } from "@/app/hooks/use-files";
import { useProfileImport } from "@/domains/profile/hooks/use-profile-import";
import { env } from "@/utils/testing-library";

let wwe: ReadableFile;
let passwordProtectedWwe: ReadableFile;

describe("useProfileImport", () => {
	beforeAll(() => {
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
	});

	it("should import profile from wwe", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			const profile = await result.current.importProfile({ file: wwe });

			expect(profile?.name()).toBe("test");
		});
	});

	// @TODO https://app.clickup.com/t/86dwq8wy3
	it.skip("should import password protected profile from wwe", async () => {
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

	// @TODO https://app.clickup.com/t/86dwq8wy3
	it.skip("should throw for invalid password", async () => {
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

	it("should return undefined if file is not provided", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			//@ts-ignore
			const profile = await result.current.importProfile({});

			expect(profile).toBeUndefined();
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
