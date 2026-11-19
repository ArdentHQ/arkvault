/* eslint-disable @typescript-eslint/require-await */
import { renderHook } from "@testing-library/react";
import * as browserAccess from "browser-fs-access";
import { useFileDownload } from "./use-file-download";

const file = {
	content: "",
	extension: "csv",
	name: "test",
};

describe("useFileDownload hook", () => {
	it("should download file", async () => {
		const browserAccessMock = vi.spyOn(browserAccess, "fileSave").mockResolvedValue({ name: "test.csv" });

		const { result } = renderHook(() => useFileDownload());
		await result.current.download(file);

		expect(browserAccessMock).toHaveBeenCalledWith(expect.any(Blob), {
			extensions: [".csv"],
			fileName: "test.csv",
		});

		browserAccessMock.mockRestore();
	});

	it("should return undefined if download fails", async () => {
		const browserAccessMock = vi.spyOn(browserAccess, "fileSave").mockImplementation(() => {
			throw new Error("error");
		});

		const { result } = renderHook(() => useFileDownload());
		const response = await result.current.download(file);

		expect(response).toBeUndefined();

		browserAccessMock.mockRestore();
	});
});
