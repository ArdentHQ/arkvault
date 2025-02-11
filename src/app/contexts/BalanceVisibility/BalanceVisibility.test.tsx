import React from "react";
import { render, screen, waitFor } from "@/utils/testing-library";
import { BalanceVisibilityProvider, useBalanceVisibilityContext } from "./BalanceVisibility";
import userEvent from "@testing-library/user-event";

describe("BalanceVisibility Context", () => {
    const TestComponent = () => {
        const { hideBalance, setHideBalance } = useBalanceVisibilityContext();

        return (
            <div>
                <p data-testid="hideBalance-status">{JSON.stringify(hideBalance)}</p>
                <button onClick={() => setHideBalance(!hideBalance)}>Toggle Balance</button>
            </div>
        );
    };

    beforeEach(() => {
        localStorage.clear();
    });
    

    it("should render the wrapper properly", () => {
        render(
            <BalanceVisibilityProvider>
                <span data-testid="BalanceVisibilityProvider__content">BalanceVisibility Provider content</span>
            </BalanceVisibilityProvider>,
        );

        expect(screen.getByTestId("BalanceVisibilityProvider__content")).toBeInTheDocument();
    });

    it("should throw without provider", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const Test = () => {
            useBalanceVisibilityContext();
            return <p>BalanceVisibility content</p>;
        };

        expect(() => render(<Test />, { withProviders: false })).toThrow(
            "useBalanceVisibilityContext must be used within a BalanceVisibilityProvider",
        );

        consoleSpy.mockRestore();
    });

    it("should initialize hideBalance from localStorage", () => {
        localStorage.setItem("hideBalance", JSON.stringify(true));

        render(
            <BalanceVisibilityProvider>
                <TestComponent />
            </BalanceVisibilityProvider>
        );

        expect(screen.getByTestId("hideBalance-status")).toHaveTextContent("true");
    });

    it("should update hideBalance and persist it to localStorage", async () => {
        render(
            <BalanceVisibilityProvider>
                <TestComponent />
            </BalanceVisibilityProvider>
        );

        const toggleButton = screen.getByRole("button", { name: "Toggle Balance" });

        await userEvent.click(toggleButton);

        await waitFor(() => {
            expect(localStorage.getItem("hideBalance")).toBe(JSON.stringify(true));
        });

        await userEvent.click(toggleButton);

        await waitFor(() => {
            expect(localStorage.getItem("hideBalance")).toBe(JSON.stringify(false));
        });
    });
});