/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable max-lines */
/* eslint-disable import/no-relative-parent-imports */
/* eslint-disable sonarjs/no-duplicate-string */
import fs from "fs";
import { ClientFunction, RequestMock, t, Selector } from "testcafe";
import { Before, Given, IWorld, Then, When } from "@cucumber/cucumber";
import { TestStepFunction } from "@cucumber/cucumber/lib/support_code_library_builder/types";
import delve from "dlv";
import { buildTranslations } from "../app/i18n/helpers";

export const getPageURL = () => process.env.E2E_HOST;

export const visitWelcomeScreen = async (t: TestController) => {
	await t.navigateTo(getPageURL());
};

export const getLocation = ClientFunction(() => document.location.href);

export const scrollTo = ClientFunction((top: number, left = 0, behavior = "auto") => {
	window.scrollTo({ behavior, left, top });
});

export const scrollToTop = ClientFunction(() => window.scrollTo({ top: 0 }));
export const scrollToBottom = ClientFunction(() => window.scrollTo({ top: document.body.scrollHeight }));

export const scrollToElement = async (selector: Selector, scrollable?: Selector) => {
	const top = await selector.offsetTop;

	if (scrollable !== undefined) {
		return t.scroll(scrollable, 0, top);
	}

	return t.scroll(0, top);
};

export const BASEURL = "https://ark-test.arkvault.io/api/";

const PING_RESPONSE_PATH = "coins/ark/mainnet/ping";
const PING_MUSIG_RESPONSE_PATH = "coins/ark/mainnet/ping-musig";

const pingServerUrls = new Set([
	"https://ark-live.arkvault.io/",
	"https://ark-live.arkvault.io",
	"https://ark-test.arkvault.io/",
	"https://ark-test.arkvault.io",
	"https://ark-live.arkvault.io/api/wallets?limit=1&nonce=0",
	"https://ark-test.arkvault.io/api/wallets?limit=1&nonce=0",
	"https://dwallets.mainsailhq.com/",
	"https://dwallets.mainsailhq.com",
	"https://dwallets-evm.mainsailhq.com/",
	"https://dwallets-evm.mainsailhq.com",
]);

const pingMusigServerUrls = new Set([
	"https://ark-live-musig.arkvault.io",
	"https://ark-test-musig.arkvault.io",
	"https://musig-demo.mainsailhq.com",
	"https://musig-demo.mainsailhq.com/",
]);

const knownWallets: any[] = [];

const transactionsFixture = "coins/ark/devnet/transactions";
const delegatesFixture = "coins/ark/devnet/delegates";
const imageFixture = "/assets/background.png";

const walletMocks = () => {
	const addresses = [
		"D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
		"D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
		"D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib",
		"D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		"DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P",
		"DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T",
		"D9YiyRYMBS2ofzqkufjrkB9nHofWgJLM7f",
		"DKrACQw7ytoU2gjppy3qKeE2dQhZjfXYqu",
		"DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS",
		"D68sFcspN2LVd9HZpf98c7bXkNimK3M6AZ",
		"DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq",
		"DNTwQTSp999ezQ425utBsWetcmzDuCn2pN",
	];

	const publicKeys = ["034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192"];

	const devnetMocks = [...addresses, ...publicKeys].map((identifier: string) =>
		mockRequest(`https://ark-test.arkvault.io/api/wallets/${identifier}`, `coins/ark/devnet/wallets/${identifier}`),
	);

	const mainnetMocks = ["AThxYTVgpzZfW7K6UxyB8vBZVMoPAwQS3D"].map((identifier: string) =>
		mockRequest(
			`https://ark-live.arkvault.io/api/wallets/${identifier}`,
			`coins/ark/mainnet/wallets/${identifier}`,
		),
	);

	// We want to use a clean version of this wallet in E2E tests so we don't have
	// any pre-defined behaviours like delegation, voting and whatever else exists
	devnetMocks.push(
		mockRequest(
			"https://ark-test.arkvault.io/api/wallets/DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			"coins/ark/devnet/wallets/DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr-basic",
		),
		mockRequest(
			"https://dwallets.mainsailhq.com/api/wallets/DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			"coins/ark/devnet/wallets/DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr-basic",
		),
	);

	return [...devnetMocks, ...mainnetMocks];
};

const publicKeys = [
	"03af2feb4fc97301e16d6a877d5b135417e8f284d40fac0f84c09ca37f82886c51",
	"03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
	"02e012f0a7cac12a74bdc17d844cbc9f637177b470019c32a53cef94c7a56e2ea9",
	"029511e2507b6c70d617492308a4b34bb1bdaabb1c260a8c15c5805df8b6a64f11",
	"03c4d1788718e39c5de7cb718ce380c66bbe2ac5a0645a6ff90f0569178ab7cd6d",
	"03d3fdad9c5b25bf8880e6b519eb3611a5c0b31adebc8455f0e096175b28321aff",
];

const publicKeysMainnet = ["035b3d223f75bde72d0599272ae37573e254b611896241e3688151c4228e04522c"];

const multisignatureMocks = () => {
	const mocks: any = [];

	for (const state of ["ready", "pending"]) {
		mocks.push(
			...publicKeys.map(() => mockMuSigRequest("https://ark-test-musig.arkvault.io/", "list", { result: [] })),
			...publicKeysMainnet.map((publicKey: string) =>
				mockMuSigRequest("https://ark-live-musig.arkvault.io/", "list", { result: [] }, { publicKey, state }),
			),
			...publicKeysMainnet.map(() =>
				mockMuSigRequest("https://ark-test-musig.arkvault.io/", "store", {
					result: { id: "1dd96f630a23d002722b5d61c86b3815e879a31592ddb5d8a7d1ed36c0b7050d" },
				}),
			),
		);
	}

	return mocks;
};

const searchAddressesMocks = () => {
	const addresses = {
		AThxYTVgpzZfW7K6UxyB8vBZVMoPAwQS3D: [
			{ limit: 10, page: 1 },
			{ limit: 15, page: 1 },
			{ limit: 30, page: 1 },
		],
		D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb: [
			{ limit: 10, page: 1 },
			{ limit: 15, page: 1 },
			{ limit: 30, page: 1 },
		],
		D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD: [
			{ limit: 10, page: 1 },
			{ limit: 15, page: 1 },
			{ limit: 15, page: 2 },
			{ limit: 30, page: 1 },
		],
		DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr: [
			{ limit: 10, page: 1 },
			{ limit: 15, page: 1 },
			{ limit: 15, page: 2 },
			{ limit: 30, page: 1 },
		],
		DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P: [
			{ limit: 10, page: 1 },
			{ limit: 15, page: 1 },
			{ limit: 30, page: 1 },
		],
		DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS: [
			{ limit: 10, page: 1 },
			{ limit: 15, page: 1 },
			{ limit: 30, page: 1 },
		],
		DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq: [
			{ limit: 10, page: 1 },
			{ limit: 15, page: 1 },
			{ limit: 30, page: 1 },
		],
	};

	const mocks: any = [];

	for (const [address, configs] of Object.entries(addresses)) {
		mocks.push(
			...configs.map(({ page, limit }: { page: number; limit: number }) =>
				mockRequest(
					(request: any) =>
						request.url ===
							`https://ark-test.arkvault.io/api/transactions?page=${page}&limit=${limit}&address=${address}` ||
						request.url ===
							`https://ark-test.arkvault.io/api/transactions?limit=${limit}&address=${address}`,
					`coins/ark/devnet/transactions/byAddress/${address}-${page}-${limit}`,
				),
			),
		);
	}

	return mocks;
};

export const mockRequest = (url: string | object | Function, fixture: string | object | Function, statusCode = 200) =>
	RequestMock()
		.onRequestTo(url)
		.respond(
			(request: any, res: any) => {
				const getBody = () => {
					if (request.url.endsWith("known-wallets-extended.json")) {
						return require(`../tests/fixtures/wallets/known-wallets.json`);
					}

					if (pingServerUrls.has(request.url)) {
						return require(`../tests/fixtures/${PING_RESPONSE_PATH}.json`);
					}

					if (pingMusigServerUrls.has(request.url)) {
						return require(`../tests/fixtures/${PING_MUSIG_RESPONSE_PATH}.json`);
					}

					if (typeof fixture === "string") {
						return require(`../tests/fixtures/${fixture}.json`);
					}

					if (typeof fixture === "function") {
						return fixture(request);
					}

					return fixture;
				};

				return res.setBody(getBody());
			},
			statusCode,
			{
				"access-control-allow-headers": "Content-Type",
				"access-control-allow-origin": "*",
			},
		);

export const mockMuSigRequest = (host: string, method: string, fixture: object, params?: object) =>
	mockRequest((req: RequestOptions) => {
		if (req.method !== "post") {
			return false;
		}

		if (req.url !== host) {
			return false;
		}

		const body = JSON.parse(req.body.toString());

		if (body.method !== method) {
			return false;
		}

		if (params && body.params !== params) {
			for (const [key, value] of Object.entries(params)) {
				if (body.params[key] !== value) {
					return false;
				}
			}
		}

		return true;
	}, fixture);

export const requestMocks = {
	configuration: [
		// devnet
		mockRequest("https://ark-test.arkvault.io/api/blockchain", "coins/ark/devnet/blockchain"),
		mockRequest("https://ark-test.arkvault.io/api/node/configuration", "coins/ark/devnet/configuration"),
		mockRequest(
			"https://ark-test.arkvault.io/api/node/configuration/crypto",
			"coins/ark/devnet/cryptoConfiguration",
		),
		mockRequest("https://ark-test.arkvault.io/api/node/fees", "coins/ark/devnet/node-fees"),
		mockRequest("https://ark-test.arkvault.io/api/node/syncing", "coins/ark/devnet/syncing"),
		mockRequest("https://ark-test.arkvault.io/api/peers", "coins/ark/devnet/peers"),

		// mainnet
		mockRequest(
			"https://ark-live.arkvault.io/api/node/configuration/crypto",
			"coins/ark/mainnet/cryptoConfiguration",
		),
		mockRequest("https://ark-live.arkvault.io/api/node/syncing", "coins/ark/mainnet/syncing"),
		mockRequest("https://ark-live.arkvault.io/api/node/fees", "coins/ark/mainnet/node-fees"),

		// Mainsail devnet
		mockRequest("https://dwallets.mainsailhq.com/api/blockchain", "coins/mainsail/devnet/blockchain"),
		mockRequest("https://dwallets.mainsailhq.com/api/node/configuration", "coins/mainsail/devnet/configuration"),
		mockRequest(
			"https://dwallets.mainsailhq.com/api/node/configuration/crypto",
			"coins/mainsail/devnet/cryptoConfiguration",
		),
		mockRequest("https://dwallets.mainsailhq.com/api/node/fees", "coins/mainsail/devnet/node-fees"),
		mockRequest("https://dwallets.mainsailhq.com/api/node/syncing", "coins/mainsail/devnet/syncing"),
		mockRequest("https://dwallets.mainsailhq.com/api/peers", "coins/mainsail/devnet/peers"),
		// Mainsail devnet (evm)
		mockRequest("https://dwallets-evm.mainsailhq.com/api/blockchain", "coins/mainsail/devnet/blockchain"),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/node/configuration", "coins/mainsail/devnet/configuration"),
		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/node/configuration/crypto",
			"coins/mainsail/devnet/cryptoConfiguration",
		),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/node/fees", "coins/mainsail/devnet/node-fees"),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/node/syncing", "coins/mainsail/devnet/syncing"),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/peers", "coins/mainsail/devnet/peers"),
	],
	delegates: [
		// devnet
		mockRequest("https://ark-test.arkvault.io/api/delegates", delegatesFixture),
		mockRequest("https://ark-test.arkvault.io/api/delegates?page=1", delegatesFixture),
		mockRequest("https://ark-test.arkvault.io/api/delegates?page=2", delegatesFixture),
		mockRequest("https://ark-test.arkvault.io/api/delegates?page=3", delegatesFixture),
		mockRequest("https://ark-test.arkvault.io/api/delegates?page=4", delegatesFixture),
		mockRequest("https://ark-test.arkvault.io/api/delegates?page=5", delegatesFixture),

		// mainnet
		mockRequest("https://ark-live.arkvault.io/api/delegates", "coins/ark/mainnet/delegates"),

		// Mainsail Devnet
		mockRequest("https://dwallets.mainsailhq.com/api/delegates", "coins/mainsail/devnet/delegates"),
		// Mainsail Devnet (evm)
		mockRequest("https://dwallets-evm.mainsailhq.com/api/delegates", "coins/mainsail/devnet/delegates"),
	],
	exchange: [
		mockRequest(
			// eslint-disable-next-line unicorn/better-regex
			/https:\/\/min-api\.cryptocompare\.com\/data\/dayAvg\?fsym=ARK&tsym=BTC&toTs=[0-9]/,
			"exchange/cryptocompare",
		),
		mockRequest(
			// eslint-disable-next-line unicorn/better-regex
			/https:\/\/min-api\.cryptocompare\.com\/data\/dayAvg\?fsym=ARK&tsym=ETH&toTs=[0-9]/,
			"exchange/cryptocompare-eth",
		),
		mockRequest(/https:\/\/min-api\.cryptocompare\.com\/data\/histoday/, "exchange/cryptocompare-historical"),
		mockRequest(/thumbnail.png$/, () => imageFixture),
		mockRequest(/dark.png$/, () => imageFixture),
		mockRequest(/light.png$/, () => imageFixture),
		mockRequest("https://exchanges.arkvault.io/api", "exchange/exchanges"),
	],
	multisignature: [...multisignatureMocks()],
	other: [
		mockRequest(
			"https://raw.githubusercontent.com/ArkEcosystem/common/master/devnet/known-wallets-extended.json",
			knownWallets,
		),
	],
	profile: [
		mockRequest(/^https:\/\/api\.pwnedpasswords.com\/range/, ({ path }) => {
			// Breached password.
			if (path === "/range/f3f69") {
				return fs.readFileSync("src/tests/fixtures/haveibeenpwned/range-f3f69.txt", "utf8");
			}

			return "";
		}),
	],
	transactions: [
		// devnet
		mockRequest("https://ark-test.arkvault.io/api/transactions/fees", "coins/ark/devnet/transaction-fees"),
		mockRequest("https://ark-test.arkvault.io/api/transactions?limit=10", transactionsFixture),
		mockRequest("https://ark-test.arkvault.io/api/transactions?limit=20", transactionsFixture),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=2&limit=30&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			transactionsFixture,
		),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=20&senderId=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			transactionsFixture,
		),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?limit=30&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD%2CD5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
			transactionsFixture,
		),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?limit=30&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD%2CD5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb%2CDH4Xyyt5zPqM9KwUkevUZPbzM3KjjW8fp5",
			transactionsFixture,
		),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=2&limit=30&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=10&recipientId=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			"coins/ark/devnet/notification-transactions",
		),

		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=10&recipientId=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
			"coins/ark/devnet/notification-transactions",
		),

		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=10&recipientId=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),

		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=10&recipientId=DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P",
			transactionsFixture,
		),

		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=10&recipientId=DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq",
			transactionsFixture,
		),

		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=20&senderId=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?limit=30&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr%2CD5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
			transactionsFixture,
		),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?limit=30&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr%2CD5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb%2CDH4Xyyt5zPqM9KwUkevUZPbzM3KjjW8fp5",
			transactionsFixture,
		),
		// unconfirmed transactions list before sending single or multiPayment transaction
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=20&senderId=DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS",
			transactionsFixture,
		),

		mockRequest(
			/https:\/\/ark-test\.arkvault\.io\/api\/transactions\?page=1&limit=20&senderId=(.*?)/,
			transactionsFixture,
		),

		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=10&orderBy=timestamp&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			transactionsFixture,
		),

		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=10&orderBy=timestamp&address=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
			transactionsFixture,
		),

		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=10&orderBy=timestamp&address=DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq",
			transactionsFixture,
		),

		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=10&orderBy=timestamp&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),

		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=10&orderBy=timestamp&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD%2CD5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
			{ data: [], meta: {} },
		),

		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=10&orderBy=timestamp&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr%2CD5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
			{ data: [], meta: {} },
		),

		// mainnet
		mockRequest("https://ark-live.arkvault.io/api/transactions/fees", "coins/ark/mainnet/transaction-fees"),

		// Mainsail Devnet
		mockRequest("https://dwallets.mainsailhq.com/api/transactions/fees", "coins/mainsail/devnet/transaction-fees"),

		mockRequest(
			"https://dwallets.mainsailhq.com/api/transactions?limit=10&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),

		mockRequest(
			"https://dwallets.mainsailhq.com/api/transactions?limit=30&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),

		mockRequest(
			"https://dwallets.mainsailhq.com/api/transactions?page=2&limit=30&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),

		mockRequest(
			"https://dwallets.mainsailhq.com/api/transactions?page=1&limit=10&orderBy=timestamp&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			{ data: [], meta: {} },
		),

		mockRequest(
			"https://dwallets.mainsailhq.com/api/transactions?page=1&limit=20&senderId=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),

		mockRequest(
			"https://dwallets.mainsailhq.com/api/transactions?page=1&limit=10&recipientId=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),

		// Mainsail Devnet (evm)
		mockRequest("https://dwallets-evm.mainsailhq.com/api/transactions/fees", "coins/mainsail/devnet/transaction-fees"),

		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/transactions?limit=10&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),

		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/transactions?limit=30&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),

		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/transactions?page=2&limit=30&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),

		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&orderBy=timestamp&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			{ data: [], meta: {} },
		),

		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=20&senderId=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),

		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&recipientId=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			transactionsFixture,
		),

		...searchAddressesMocks(),
	],
	wallets: [
		mockRequest("https://ark-live.arkvault.io/api/wallets?limit=1&nonce=0", {}),
		mockRequest("https://ark-test.arkvault.io/api/wallets?limit=1&nonce=0", {}),
		mockRequest(
			"https://ark-test.arkvault.io/api/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD/votes",
			"coins/ark/devnet/votes",
		),

		...walletMocks(),
	],
};

const combineRequestMocks = (preHooks: RequestMock[] = [], postHooks: RequestMock[] = []): RequestMock[] => [
	...preHooks,
	...requestMocks.configuration,
	...requestMocks.delegates,
	...requestMocks.multisignature,
	...requestMocks.transactions,
	...requestMocks.wallets,
	...requestMocks.other,
	...requestMocks.exchange,
	...requestMocks.profile,
	...postHooks,
	mockRequest(/^https?:\/\/(?!localhost)/, (request: any) => {
		const mock: { url: string; method: string; body?: string } = {
			method: request.method,
			url: request.url,
		};

		if (request.method === "OPTIONS") {
			return request;
		}

		if (request.method === "POST") {
			mock.body = request.body.toString();
		}

		throw new Error(`\n-- Missing mock:\n${JSON.stringify(mock, undefined, 4)}`);
	}),
];

export const createFixture = (name: string, preHooks: RequestMock[] = [], postHooks: RequestMock[] = []) =>
	fixture(name)
		.page(getPageURL())
		.requestHooks(...combineRequestMocks(preHooks, postHooks));

export const MNEMONICS = [
	"skin fortune security mom coin hurdle click emotion heart brisk exact rather code feature era leopard grocery tide gift power lawsuit sight vehicle coin",
	"audit theory scheme profit away wing rescue cloth fit spell atom rely enter upon man clutch divide buddy office tuition input bundle silk scheme",
	"uphold egg salon police home famous focus fade skin virus fence surprise hidden skate word famous movie grant ghost save fly assume motion case",
	"dress assault rich club glass fancy hood glance install buzz blur attack room outdoor chapter melody tide blur trend into have accuse very little",
	"already device awful potato face kingdom coral biology badge donkey ranch random when dove solve system tonight purchase foot way deliver grow raccoon blame",
	"garden neglect enable bone inform deal shallow smart train enrich cloud police pave ignore assault wrong chef harbor river brain way essay zero mouse",
	"analyst rifle dose thank unfair remain claim exile math foster clarify unfair gauge wasp notice crash sustain session lunch verify gasp try divorce slender",
	"tray analyst bulk topple night swing list execute walk bronze invite title silent loud cash apology sibling wheel thumb dragon black soccer mixed curious",
	"cool path congress harbor position ready embody hunt face field boil brown rubber toss arrange later convince anxiety foam urban monster endless essay melt",
	"subway cradle salad cake toddler sausage neglect eight cruel fault mammal cannon south interest theory sadness pass move outside segment curtain toddler save banner",
];

// https://cucumber.io/docs/gherkin/reference/
export const cucumber = (
	tag: string,
	scenario: Record<string, TestStepFunction<IWorld>>,
	preHooks: RequestMock[] = [],
	postHooks: RequestMock[] = [],
): void => {
	Before(tag, async (t) => {
		// @ts-ignore
		await t.addRequestHooks(...combineRequestMocks(preHooks, postHooks));
	});

	for (const [pattern, code] of Object.entries(scenario)) {
		if (pattern.startsWith("Given")) {
			Given(pattern.replace("Given ", ""), code);
		}

		if (pattern.startsWith("When")) {
			When(pattern.replace("When ", ""), code);
		}

		if (pattern.startsWith("Then")) {
			Then(pattern.replace("Then ", ""), code);
		}

		if (pattern.startsWith("And")) {
			When(pattern.replace("And ", ""), code);
		}

		if (pattern.startsWith("But")) {
			When(pattern.replace("But ", ""), code);
		}
	}
};

// @TODO: fix generics declaration type errors
export const translate = (path: any, values: Record<string, string> = {}): string => {
	let languageString = delve(buildTranslations(), path, "No translation found") as string;

	for (const [key, value] of Object.entries(values)) {
		languageString = languageString.replace(`{{${key}}}`, value);
	}

	return languageString;
};
