import React from "react";
import userEvent from "@testing-library/user-event";
import { Copy } from "./Copy";
import { act, screen, render } from "@/utils/testing-library";


describe("Copy", () => {
    it("should render", () => {
        render(<Copy address="test" />);

        expect(screen.getByTestId("Copy__icon")).toBeInTheDocument();
    });

    it("should change the icon when clicked", async () => {
        render(<Copy address="test" />);
        await userEvent.click(screen.getByTestId("Copy__icon"));

        expect(screen.getByTestId("Copy__icon_success")).toBeInTheDocument();
    });

    it("should return to the original icon after 1 second", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });

        render(<Copy address="test" />);
        await userEvent.click(screen.getByTestId("Copy__icon"));

        expect(screen.getByTestId("Copy__icon_success")).toBeInTheDocument();

        act(() => {
			vi.advanceTimersByTime(1000);
		});

        expect(screen.getByTestId("Copy__icon")).toBeInTheDocument();

        vi.clearAllTimers();
    });
});