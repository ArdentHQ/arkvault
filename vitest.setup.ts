import "@testing-library/jest-dom";
import MockDate from "mockdate";
import { bootEnvironmentWithProfileFixtures } from "@/utils/test-helpers";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import "cross-fetch/polyfill";
import crypto from "crypto";
import "jest-styled-components";
import { server } from "./src/tests/mocks/server";
import { pwnedMock } from "./src/tests/mocks/handlers/pwned";
import { actWarningsAsErrors } from "./src/utils/test-plugins";
import * as matchers from "jest-extended";

expect.extend(matchers);

vi.mock("@faustbrian/node-haveibeenpwned", () => ({
	pwned: async () => pwnedMock(),
}));

vi.mock("@/utils/debounce", () => ({
	debounceAsync: (promise) => promise,
}));

// Mocking @konforti/react-truncate to return a fixed truncated value.
// Umocked, it errors with: "ReferenceError: regeneratorRuntime is not defined" in tests only.
vi.mock("@konforti/react-truncate", () => {
	const truncateMiddle = (str) => (str.length > 10 ? str.slice(0, 5) + "..." + str.slice(-5) : str);
	return {
		default: ({ children }) => truncateMiddle(children),
	};
});

vi.mock(
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

vi.mock("@/app/hooks/use-synchronizer", async () => {
	const { useSynchronizer } = await vi.importActual("@/app/hooks/use-synchronizer");

	return {
		useSynchronizer: (jobs) => {
			if (process.env.MOCK_SYNCHRONIZER) {
				return {
					start: vi.fn(),
					stop: vi.fn(),
					runAll: vi.fn(),
					error: undefined,
				};
			}

			return useSynchronizer(jobs);
		},
	};
});

vi.mock("react-idle-timer", () => {
	return {
		useIdleTimer: (options) => {
			const threshold = process.env.IDLE_TIME_THRESHOLD || 10000;

			return {
				start: () => setTimeout(options.onIdle, parseInt(threshold)),
				stop: vi.fn(),
				pause: vi.fn(),
			};
		},
	};
});

// Reduce ledger connection retries to 2 in all tests.
vi.mock("p-retry", async () => {
	const retry = await vi.importActual("p-retry");

	return {
		...retry,
		default: (fn, options) => retry.default(fn, { ...options, retries: 2 }),
	};
});

vi.mock("browser-fs-access");

const originalLocalStorageGetItem = localStorage.getItem;
let localstorageSpy;

// Treat act warnings as errors.
actWarningsAsErrors();

beforeAll(async () => {
	// Fixes "URL.createObjectURL is not a function" in /src/app/hooks/use-files.test.tsx
	global.URL.createObjectURL = vi.fn(() => "blob:mock-url");

	MockDate.set(new Date("2020-07-01T00:00:00.000Z"));

	process.env.REACT_APP_IS_UNIT = "1";
	server.listen({ onUnhandledRequest: "warn" });

	await bootEnvironmentWithProfileFixtures({ env, shouldRestoreDefaultProfile: true });

	// Mark profiles as restored, to prevent multiple restoration in profile synchronizer
	process.env.TEST_PROFILES_RESTORE_STATUS = "restored";

	return;
});

beforeEach(() => {
	localstorageSpy = vi
		.spyOn(Storage.prototype, "getItem")
		.mockImplementation((key) => originalLocalStorageGetItem.call(localStorage, key));

	if (process.env.MOCK_AVAILABLE_NETWORKS !== "false") {
		try {
			const profileId = getMainsailProfileId();

			const profile = env.profiles().findById(profileId);
			const networks = profile
				.wallets()
				.values()
				.map((wallet) => wallet.network());

			for (const profile of env.profiles().values()) {
				vi.spyOn(profile, "availableNetworks").mockReturnValue([networks[0]]);
			}
		} catch {
			// No profiles. Ignore.
		}
	}
});

afterEach(() => {
	server.resetHandlers();

	localstorageSpy.mockRestore();
});

afterAll(() => {
	server.close();

	MockDate.reset();

	if (global.gc) {
		global.gc();
	}
});

Object.defineProperty(HTMLImageElement.prototype, "decode", {
	writable: true,
	value: vi.fn(),
});

Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(), // deprecated
		removeListener: vi.fn(), // deprecated
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

window.scrollTo = vi.fn();

class ResizeObserverMock {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
}

window.ResizeObserver = ResizeObserverMock;

class BroadcastChannelMock {
	postMessage = vi.fn();
	onMessage = vi.fn();
	onMessageError = vi.fn();
	addEventListener = vi.fn();
	removeEventListener = vi.fn();
	close = vi.fn();
}

vi.stubGlobal("BroadcastChannel", BroadcastChannelMock);

vi.stubGlobal("CSS", {
	supports: () => true,
});

vi.stubGlobal("crypto", {
	...crypto,
	getRandomValues: crypto.randomFillSync,
});

// Zendesk
vi.mock("react-zendesk", () => ({
	__esModule: true,
	default: () => null,
	ZendeskAPI: () => vi.fn(),
}));

Object.defineProperty(window, "$zopim", {
	writable: true,
	value: {
		livechat: {
			window: {
				show: vi.fn(),
				hide: vi.fn(),
			},
		},
	},
});

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
