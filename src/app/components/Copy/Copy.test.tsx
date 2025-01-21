import React from "react";
import userEvent from "@testing-library/user-event";
import { Copy } from "./Copy";
import { Icon } from "@/app/components/Icon";
import { act, screen, render, waitFor } from "@/utils/testing-library";

describe("Copy", () => {
	it("should render", () => {
		render(<Copy copyData="test" icon={() => <Icon name="Copy" data-testid="Copy__icon" />} />);

		expect(screen.getByTestId("Copy__icon")).toBeInTheDocument();
	});

	it("should change the icon when clicked", async () => {
		render(<Copy copyData="test" icon={(isClicked) => isClicked ? <Icon name="Copy" data-testid="Copy__icon_success" /> : <Icon name="Copy" data-testid="Copy__icon" />} />);
		await userEvent.click(screen.getByTestId("Copy__icon"));

		await waitFor(() => {
			expect(screen.getByTestId("Copy__icon_success")).toBeInTheDocument();
		})
	});

	it("should return to the original icon after 1 second", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		render(<Copy copyData="test" icon={(isClicked) => isClicked ? <Icon name="Copy" data-testid="Copy__icon_success" /> : <Icon name="Copy" data-testid="Copy__icon" />} />);
		await userEvent.click(screen.getByTestId("Copy__icon"));

		await waitFor(() => {
			expect(screen.getByTestId("Copy__icon_success")).toBeInTheDocument();
		})
		act(() => {
			vi.advanceTimersByTime(1000);
		});

		expect(screen.getByTestId("Copy__icon")).toBeInTheDocument();

		vi.clearAllTimers();
	});
});
