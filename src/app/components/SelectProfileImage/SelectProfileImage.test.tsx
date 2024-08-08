import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import * as browserAccess from "browser-fs-access";

import { SelectProfileImage } from "./SelectProfileImage";
import { useFiles } from "@/app/hooks/use-files";
import { translations } from "@/app/i18n/common/i18n";
import { toasts } from "@/app/services";
import { render, screen, waitFor } from "@/utils/testing-library";

const uploadButton = () => screen.getByTestId("SelectProfileImage__upload-button");

describe("SelectProfileImage", () => {
	it("should render", () => {
		const onSelect = vi.fn();

		const { asFragment } = render(<SelectProfileImage onSelect={onSelect} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with value svg", () => {
		const onSelect = vi.fn();

		const { asFragment } = render(<SelectProfileImage value="<svg>test</svg>" onSelect={onSelect} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without value svg", async () => {
		const onSelect = vi.fn();

		const { asFragment } = render(<SelectProfileImage value="test" onSelect={onSelect} />);

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("SelectProfileImage__remove-button"));

		expect(onSelect).toHaveBeenCalledWith(expect.any(String));
	});

	it("should handle upload file", async () => {
		const browserAccessMock = vi
			.spyOn(browserAccess, "fileOpen")
			.mockResolvedValue(new File([""], "test.png", { type: "image/png" }));

		const onSelect = vi.fn();

		const { asFragment } = render(<SelectProfileImage value="test" onSelect={onSelect} />);
		const { result: useFilesResult } = renderHook(() => useFiles());

		expect(asFragment()).toMatchSnapshot();

		uploadButton().addEventListener("click", browserAccessMock as any);
		await userEvent.click(uploadButton());

		await expect(
			useFilesResult.current.showOpenDialog({
				extensions: [".png", ".jpg", ".jpeg", ".bmp"],
			}),
		).resolves.not.toThrow();

		await waitFor(() => expect(onSelect).toHaveBeenCalledWith("data:image/png;base64,"));

		browserAccessMock.mockRestore();
	});

	it("should not allow to upload an invalid file image", async () => {
		const onSelect = vi.fn();
		const toastSpy = vi.spyOn(toasts, "error");

		const { asFragment } = render(<SelectProfileImage value="test" onSelect={onSelect} />);

		expect(asFragment()).toMatchSnapshot();

		const browserAccessMock = vi
			.spyOn(browserAccess, "fileOpen")
			.mockResolvedValue(new File(["123"], "not-an-image.png"));

		uploadButton().addEventListener("click", browserAccessMock as any);
		await userEvent.click(uploadButton());

		await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(translations.ERRORS.INVALID_IMAGE));

		Object.defineProperty(global.FileReader.prototype, "readAsDataURL", {
			value: () => {
				throw new Error("Wrong file");
			},
		});

		await userEvent.click(uploadButton());

		await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(translations.ERRORS.INVALID_IMAGE));

		browserAccessMock.mockRestore();
	});

	it("should not handle upload file", async () => {
		const onSelect = vi.fn();
		const toastSpy = vi.spyOn(toasts, "error");

		const { asFragment } = render(<SelectProfileImage value="test" onSelect={onSelect} />);

		expect(asFragment()).toMatchSnapshot();

		const browserAccessMock = vi.spyOn(browserAccess, "fileOpen").mockResolvedValue(undefined);

		await userEvent.click(uploadButton());

		await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(translations.ERRORS.INVALID_IMAGE));
		await waitFor(() => expect(onSelect).not.toHaveBeenCalled());

		browserAccessMock.mockRestore();
		toastSpy.mockRestore();
	});

	it("should not allow to upload when user aborted a request", async () => {
		const onSelect = vi.fn();
		const toastSpy = vi.spyOn(toasts, "error");

		const { asFragment } = render(<SelectProfileImage value="test" onSelect={onSelect} />);

		expect(asFragment()).toMatchSnapshot();

		const browserAccessMock = vi
			.spyOn(browserAccess, "fileOpen")
			.mockRejectedValue(new Error("The user aborted a request."));

		await userEvent.click(uploadButton());

		await waitFor(() => expect(toastSpy).not.toHaveBeenCalled());

		browserAccessMock.mockRestore();
		toastSpy.mockRestore();
	});
});
