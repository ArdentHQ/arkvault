/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import React from "react";

import { PasswordModal } from "./PasswordModal";
import { render, screen, waitFor } from "@/utils/testing-library";

describe("PasswordModal", () => {
	beforeEach(() => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it("should not render if not open", () => {
		const { asFragment } = render(<PasswordModal isOpen={false} />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with title and description", async () => {
		const { asFragment } = render(
			<PasswordModal isOpen={true} title="Password title" description="Password description" />,
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent("Password title");
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent("Password description");

		await waitFor(() => {
			expect(screen.getByTestId("PasswordModal__submit-button")).toBeDisabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should submit", async () => {
		const onSuccess = vi.fn();

		render(<PasswordModal isOpen={true} onSubmit={onSuccess} />);

		await userEvent.type(screen.getByTestId("PasswordModal__input"), "password");

		await waitFor(() => {
			expect(screen.getByTestId("PasswordModal__input")).toHaveValue("password");
		});

		await userEvent.click(screen.getByTestId("PasswordModal__submit-button"));

		await waitFor(() => {
			expect(onSuccess).toHaveBeenCalled();
		});
	});
});
