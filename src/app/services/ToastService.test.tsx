import userEvent from "@testing-library/user-event";
import React from "react";
import { toast, ToastContainer, Id as ToastId } from "react-toastify";

import { ToastService } from "./ToastService";
import { toasts } from "@/app/services/index";
import { act, render, screen } from "@/utils/testing-library";

let subject: ToastService;

describe("ToastService", () => {
	beforeAll(() => {
		subject = new ToastService();
	});

	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it.each(["info", "success", "warning", "error"])("should call toast %s method", (method) => {
		jest.spyOn(toast, method);

		render(<ToastContainer />);

		act(() => {
			subject[method](method);
			jest.runAllTimers();
		});

		expect(screen.getByText(method)).toBeInTheDocument();
	});

	it.each(["info", "success", "warning", "error"])("should call toast %s method with options", (method) => {
		render(<ToastContainer />);

		act(() => {
			subject[method](method, { position: "top-right" });
			jest.runAllTimers();
		});

		expect(screen.getByText(method)).toBeInTheDocument();
	});

	it("should call the toast dismiss method", () => {
		const mock = jest.spyOn(toast, "dismiss").mockImplementation();

		subject.dismiss();

		expect(mock).toHaveBeenCalledWith(undefined);
	});

	it("should call the toast dismiss method with toast id", () => {
		const mock = jest.spyOn(toast, "dismiss").mockImplementation();

		subject.dismiss(123);

		expect(mock).toHaveBeenCalledWith(123);
	});

	it("should call the toast update method with toast id", () => {
		const mock = jest.spyOn(toast, "update").mockImplementation();

		subject.update(123, "warning", "content");

		expect(mock).toHaveBeenCalledWith(123, {
			render: expect.any(Function),
		});
	});

	it("should call the toast isActive method with toast id", () => {
		const mock = jest.spyOn(toast, "isActive").mockImplementation();

		subject.isActive(123);

		expect(mock).toHaveBeenCalledWith(123);
	});

	it("should render and update toast message", async () => {
		const Component = () => {
			let toastId: ToastId;
			const showMessage = () => {
				toastId = toasts.info("info message");
			};
			const updateMessage = () => {
				toasts.update(toastId, "error", "updated message");
			};

			return (
				<>
					<ToastContainer />
					<div data-testid={"show_message"} onClick={showMessage} />
					<div data-testid={"update_message"} onClick={updateMessage} />
				</>
			);
		};

		render(<Component />);

		expect(screen.queryByTestId("ToastMessage__content")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("show_message"));

		await expect(screen.findByText("info message")).resolves.toBeInTheDocument();

		userEvent.click(screen.getByTestId("update_message"));

		await expect(screen.findByText("updated message")).resolves.toBeInTheDocument();
	});
});
