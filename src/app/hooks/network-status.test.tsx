import { act, renderHook } from "@testing-library/react";
import React from "react";

import { useNetworkStatus } from "./network-status";
import { translations as errorTranslations } from "@/domains/error/i18n";
import { Offline } from "@/domains/error/pages";
import { render, screen } from "@/utils/testing-library";

let eventMap: any;

describe("useNetworkStatus", () => {
	const TestNetworkStatus: React.FC = () => {
		const isOnline = useNetworkStatus();

		return isOnline ? <h1>My App</h1> : <Offline />;
	};

	beforeEach(() => {
		vi.restoreAllMocks();

		eventMap = {};

		vi.spyOn(window, "addEventListener").mockImplementation((eventName, callback) => {
			eventMap[eventName] = callback;
		});
	});

	afterEach(() => {
		vi.spyOn(window, "removeEventListener").mockImplementation((eventName) => {
			delete eventMap[eventName];
		});
	});

	it("should be online", () => {
		vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(true);

		render(<TestNetworkStatus />);

		expect(screen.getByText("My App")).toBeInTheDocument();
	});

	it("should be offline", () => {
		vi.spyOn(window.navigator, "onLine", "get").mockReturnValueOnce(false);

		render(<TestNetworkStatus />);

		expect(screen.getByTestId("Offline__text")).toHaveTextContent(errorTranslations.OFFLINE.TITLE);
		expect(screen.getByTestId("Offline__text")).toHaveTextContent(errorTranslations.OFFLINE.DESCRIPTION);
	});

	it("should trigger event", () => {
		vi.spyOn(window.navigator, "onLine", "get").mockReturnValueOnce(false);
		const { result } = renderHook(() => useNetworkStatus());

		act(() => {
			eventMap.online();
		});

		expect(result.current.valueOf()).toBe(true);
	});
});
