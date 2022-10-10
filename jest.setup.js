import "@testing-library/jest-dom";
import MockDate from "mockdate";
import { bootEnvironmentWithProfileFixtures } from "@/utils/test-helpers";
import { env } from "@/utils/testing-library";
import "cross-fetch/polyfill";
import Tippy from "@tippyjs/react";
import React from "react";

jest.mock("@/utils/debounce", () => ({
	debounceAsync: (promise) => promise,
}));

jest.mock(
	"virtual:pwa-register/react",
	() => {
		return {
			useRegisterSW: () => ({}),
		};
	},
	{
		virtual: true,
	},
);

jest.mock("@/app/hooks/use-synchronizer", () => {
	const { useSynchronizer } = jest.requireActual("@/app/hooks/use-synchronizer");

	return {
		useSynchronizer: (jobs) => {
			if (process.env.MOCK_SYNCHRONIZER) {
				return {
					start: jest.fn(),
					stop: jest.fn(),
					runAll: jest.fn(),
					error: undefined,
				};
			}

			return useSynchronizer(jobs);
		},
	};
});

jest.mock("react-idle-timer", () => {
	return {
		useIdleTimer: (options) => {
			const threshold = process.env.IDLE_TIME_THRESHOLD || 10000;

			return {
				start: () => setTimeout(options.onIdle, parseInt(threshold)),
				stop: jest.fn(),
				pause: jest.fn(),
			};
		},
	};
});

// Reduce ledger connection retries to 2 in all tests.
jest.mock("async-retry", () => {
	const retry = jest.requireActual("async-retry");
	return (fn, options) => retry(fn, { ...options, retries: 2 });
});

jest.mock("browser-fs-access");

const originalTippyRender = Tippy.render;
let tippyMock;
let widgetMock;

const originalLocalStorageGetItem = localStorage.getItem;
let localstorageSpy;

beforeAll(async () => {
	await bootEnvironmentWithProfileFixtures({ env, shouldRestoreDefaultProfile: true });
	// Mark profiles as restored, to prevent multiple restoration in profile synchronizer
	process.env.TEST_PROFILES_RESTORE_STATUS = "restored";

	return;
});

beforeEach(() => {
	MockDate.set(new Date("2020-07-01T00:00:00.000Z"));

	localstorageSpy = jest
		.spyOn(Storage.prototype, "getItem")
		.mockImplementation((key) => originalLocalStorageGetItem.call(localStorage, key));

	tippyMock = jest.spyOn(Tippy, "render").mockImplementation((context) => {
		if (context?.render?.name === "renderDropdownContent") {
			return context.render({
				className: "absolute z-10 w-full",
			});
		}

		return originalTippyRender(context);
	});

	widgetMock = jest.spyOn(window.document, "getElementById").mockImplementation((id) => {
		if (id === "webWidget") {
			return {
				contentWindow: window,
			};
		}
		return window.document.getElementById(id);
	});
});

afterEach(() => {
	MockDate.reset();

	tippyMock.mockRestore();

	localstorageSpy.mockRestore();
	widgetMock.mockRestore();
});

afterAll(() => {
	if (global.gc) {
		global.gc();
	}
});

Object.defineProperty(HTMLImageElement.prototype, "decode", {
	writable: true,
	value: jest.fn(),
});

Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

window.scrollTo = jest.fn();

class ResizeObserverMock {
	observe = jest.fn();
	unobserve = jest.fn();
	disconnect = jest.fn();
}

window.ResizeObserver = ResizeObserverMock;

global.BroadcastChannel = class BroadcastChannel {
	postMessage = jest.fn();
	onMessage = jest.fn();
	onMessageError = jest.fn();
	addEventListener = jest.fn();
	removeEventListener = jest.fn();
	close = jest.fn();
};

// Zendesk
jest.mock("react-zendesk", () => ({
	__esModule: true,
	default: () => <div />,
	ZendeskAPI: () => jest.fn(),
}));

Object.defineProperty(window, "$zopim", {
	writable: true,
	value: {
		livechat: {
			window: {
				show: jest.fn(),
				hide: jest.fn(),
			},
		},
	},
});
