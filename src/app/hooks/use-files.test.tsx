import * as browserAccess from "browser-fs-access";
import { renderHook } from "@testing-library/react";
import { isValidImage, ReadableFile, useFiles } from "./use-files";
import { requestMock, server } from "@/tests/mocks/server";

describe("useFiles", () => {
	it("should read file as text", async () => {
		const { result } = renderHook(() => useFiles());

		const { content, extension, name } = await result.current.readFileAsText(
			new File([new Blob(["test mnemonic"])], "fileName.wwe"),
		);

		expect(content).toBe("test mnemonic");
		expect(extension).toBe("wwe");
		expect(name).toBe("fileName.wwe");
	});

	it("should read file as data uri", async () => {
		const { result } = renderHook(() => useFiles());

		const { content, extension, name } = await result.current.readFileAsDataUri(
			new File([new Blob(["test mnemonic"])], "fileName.wwe"),
		);

		expect(content).toBe(`data:application/octet-stream;base64,${btoa("test mnemonic")}`);
		expect(extension).toBe("wwe");
		expect(name).toBe("fileName.wwe");
	});

	it("should open file", async () => {
		const browserAccessMock = vi
			.spyOn(browserAccess, "fileOpen")
			// @ts-ignore
			.mockResolvedValue(new File([], "test.png"));

		const { result } = renderHook(() => useFiles());

		const value = await result.current.showOpenDialog({ extensions: [".png"], mimeTypes: ["image/png"] });

		expect(value).toBeInstanceOf(File);

		expect(browserAccessMock).toHaveBeenCalledWith({
			extensions: [".png"],
			mimeTypes: ["image/png"],
		});

		browserAccessMock.mockRestore();
	});

	it("should handle isValidImage errors", async () => {
		const readableFile = {} as ReadableFile;

		await expect(isValidImage(readableFile)).resolves.toBeFalsy();

		readableFile.extension = "png";
		readableFile.content = "data:image";

		await expect(isValidImage(readableFile, { extensions: ["png"] })).resolves.toBeTruthy();

		Object.defineProperty(global.Image.prototype, "decode", {
			value: () => {
				throw new Error("Wrong file");
			},
		});

		await expect(isValidImage(readableFile, { extensions: ["png"] })).resolves.toBeFalsy();
	});

	it("should save file", async () => {
		const browserAccessMock = vi
			.spyOn(browserAccess, "fileSave")
			// @ts-ignore
			.mockResolvedValue({ name: "test.json" });

		const { result } = renderHook(() => useFiles());

		const value = await result.current.showSaveDialog("test", { extensions: [".json"] });

		expect(value).toBe("test.json");

		expect(browserAccessMock).toHaveBeenCalledWith(expect.any(Blob), {
			extensions: [".json"],
		});

		browserAccessMock.mockRestore();
	});

	it("should save image file", async () => {
		const url = "http://localhost:3000/test";
		server.use(requestMock(url, {}, { method: "get" }));

		const browserAccessMock = vi
			.spyOn(browserAccess, "fileSave")
			// @ts-ignore
			.mockResolvedValue({ name: "test.png" });

		const { result } = renderHook(() => useFiles());

		const value = await result.current.showImageSaveDialog(url, { extensions: [".png"] });

		expect(value).toBe("test.png");

		expect(browserAccessMock).toHaveBeenCalledWith(expect.any(Object), {
			extensions: [".png"],
		});

		const withFilenameOnly = await result.current.showImageSaveDialog(url, { fileName: "test.png" });

		expect(withFilenameOnly).toBe("test.png");

		browserAccessMock.mockRestore();
	});

	it("should check additional functions", async () => {
		const {
			result: { current },
		} = renderHook(() => useFiles());

		expect(current.getExtension()).toBe("");

		let options = { extensions: undefined, fileName: "filename" };
		await current.showSaveDialog("content", options);

		expect(options.extensions).toStrictEqual([".filename"]);
		expect(current.isLegacy()).toBeTruthy();

		options = { extensions: undefined, fileName: "" };
		await current.showSaveDialog("content", options);

		expect(options.extensions).toBeUndefined();
	});

	it("should handle openImage errors", async () => {
		const browserAccessMock = vi
			.spyOn(browserAccess, "fileOpen")
			.mockResolvedValue(new File(["123"], "not-an-image.png"));

		Object.defineProperty(global.FileReader.prototype, "addEventListener", {
			value: (type, listener) => {
				listener({ target: undefined });
			},
		});

		await expect(useFiles().openImage()).rejects.toThrow("Empty");

		browserAccessMock.mockRestore();
	});
});
