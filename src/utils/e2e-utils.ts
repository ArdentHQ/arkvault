/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable max-lines */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable import-alias/import-alias */

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

export const BASEURL = "https://dwallets-evm.mainsailhq.com/api/";

const PING_RESPONSE_PATH = "coins/mainsail/devnet/ping";

const pingServerUrls = new Set([
	"https://ark-live.arkvault.io/",
	"https://ark-live.arkvault.io",
	"https://dwallets-evm.mainsailhq.com/",
	"https://dwallets-evm.mainsailhq.com",
	"https://explorer.blockpool.io:19031",
	"https://apis.compendia.org",
	"https://apis-testnet.compendia.org",
	"https://qredit.cloud",
	"https://qredit.dev",
	"https://wallets-evm.mainsailhq.com/api/wallets?limit=1&nonce=0",
	"https://dwallets-evm.mainsailhq.com/api/wallets?limit=1&nonce=0",
	// "https://dwallets-evm.mainsailhq.com/evm/api",
]);

const knownWallets: any[] = [];

const transactionsFixture = "coins/mainsail/devnet/transactions";
const validatorsFixture = "coins/mainsail/devnet/validators";
const imageFixture = "/assets/background.png";

const walletMocks = () => {
	const addresses = [
		"0x659A76be283644AEc2003aa8ba26485047fd1BFB",
		"0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
		"0xA46720D11Bc8408411Cbd45057EeDA6d32D2Af54",
	];

	const publicKeys = ["034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192"];

	const devnetMocks = [...addresses, ...publicKeys].map((identifier: string) =>
		mockRequest(
			`https://dwallets-evm.mainsailhq.com/api/wallets/${identifier}`,
			`coins/mainsail/devnet/wallets/${identifier}`,
		),
	);

	const mainnetMocks = ["0xb0E6c955a0Df13220C36Ea9c95bE471249247E57"].map((identifier: string) =>
		mockRequest(
			`https://wallets-evm.mainsailhq.com/api/wallets/${identifier}`,
			`coins/mainsail/mainnet/wallets/${identifier}`,
		),
	);

	// We want to use a clean version of this wallet in E2E tests so we don't have
	// any pre-defined behaviours like delegation, voting and whatever else exists
	devnetMocks
		.push
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB",
		// 	"coins/mainsail/devnet/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB-basic",
		// ),
		();

	return [...devnetMocks, ...mainnetMocks];
};

const searchAddressesMocks = () => {
	const addresses = {
		// "0xb0E6c955a0Df13220C36Ea9c95bE471249247E57": [
		// 	{ limit: 10, page: 1 },
		// 	{ limit: 15, page: 1 },
		// 	{ limit: 30, page: 1 },
		// ],
		// D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb: [
		// 	{ limit: 10, page: 1 },
		// 	{ limit: 15, page: 1 },
		// 	{ limit: 30, page: 1 },
		// ],
		// D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD: [
		// 	{ limit: 10, page: 1 },
		// 	{ limit: 15, page: 1 },
		// 	{ limit: 15, page: 2 },
		// 	{ limit: 30, page: 1 },
		// ],
		"0x659A76be283644AEc2003aa8ba26485047fd1BFB": [
			{ limit: 10, page: 1 },
			{ limit: 15, page: 1 },
			{ limit: 15, page: 2 },
			{ limit: 30, page: 1 },
		],
		// DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P: [
		// 	{ limit: 10, page: 1 },
		// 	{ limit: 15, page: 1 },
		// 	{ limit: 30, page: 1 },
		// ],
		// DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS: [
		// 	{ limit: 10, page: 1 },
		// 	{ limit: 15, page: 1 },
		// 	{ limit: 30, page: 1 },
		// ],
		// DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq: [
		// 	{ limit: 10, page: 1 },
		// 	{ limit: 15, page: 1 },
		// 	{ limit: 30, page: 1 },
		// ],
	};

	const mocks: any = [];

	for (const [address, configs] of Object.entries(addresses)) {
		mocks.push(
			...configs.map(({ page, limit }: { page: number; limit: number }) =>
				mockRequest(
					(request: any) =>
						request.url ===
							`https://dwallets-evm.mainsailhq.com/api/transactions?page=${page}&limit=${limit}&address=${address}` ||
						request.url ===
							`https://dwallets-evm.mainsailhq.com/api/transactions?limit=${limit}&address=${address}`,
					`coins/mainsail/devnet/transactions/byAddress/${address}-${page}-${limit}`,
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

export const requestMocks = {
	configuration: [
		// devnet
		mockRequest("https://dwallets-evm.mainsailhq.com/api/blockchain", "coins/mainsail/devnet/blockchain"),
		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/node/configuration",
			"coins/mainsail/devnet/configuration",
		),
		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/node/configuration/crypto",
			"coins/mainsail/devnet/cryptoConfiguration",
		),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/node/fees", "coins/mainsail/devnet/node-fees"),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/node/syncing", "coins/mainsail/devnet/syncing"),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/peers", "coins/mainsail/devnet/peers"),

		// mainnet
		mockRequest(
			"https://wallets-evm.mainsailhq.com/api/node/configuration/crypto",
			"coins/mainsail/mainnet/cryptoConfiguration",
		),
		mockRequest("https://wallets-evm.mainsailhq.com/api/node/syncing", "coins/mainsail/mainnet/syncing"),
		mockRequest("https://wallets-evm.mainsailhq.com/api/node/fees", "coins/mainsail/mainnet/node-fees"),

		// Compendia
		mockRequest("https://apis.compendia.org/api/node/configuration", "coins/mainsail/devnet/configuration"),
		mockRequest(
			"https://apis.compendia.org/api/node/configuration/crypto",
			"coins/mainsail/devnet/cryptoConfiguration",
		),
		mockRequest("https://apis.compendia.org/api/node/syncing", "coins/mainsail/devnet/syncing"),
		mockRequest("https://apis-testnet.compendia.org/api/node/configuration", "coins/mainsail/devnet/configuration"),
		mockRequest(
			"https://apis-testnet.compendia.org/api/node/configuration/crypto",
			"coins/mainsail/devnet/cryptoConfiguration",
		),
		mockRequest("https://apis-testnet.compendia.org/api/node/syncing", "coins/mainsail/devnet/syncing"),

		// Blockpool
		mockRequest(
			"https://explorer.blockpool.io:19031/api/node/configuration",
			"coins/mainsail/devnet/configuration",
		),
		mockRequest(
			"https://explorer.blockpool.io:19031/api/node/configuration/crypto",
			"coins/mainsail/devnet/cryptoConfiguration",
		),
		mockRequest("https://explorer.blockpool.io:19031/api/node/syncing", "coins/mainsail/devnet/syncing"),

		// Qredit
		mockRequest("https://qredit.cloud/api/node/configuration", "coins/mainsail/devnet/configuration"),
		mockRequest("https://qredit.cloud/api/node/configuration/crypto", "coins/mainsail/devnet/cryptoConfiguration"),
		mockRequest("https://qredit.cloud/api/node/syncing", "coins/mainsail/devnet/syncing"),
		mockRequest("https://qredit.dev/api/node/configuration", "coins/mainsail/devnet/configuration"),
		mockRequest("https://qredit.dev/api/node/configuration/crypto", "coins/mainsail/devnet/cryptoConfiguration"),
		mockRequest("https://qredit.dev/api/node/syncing", "coins/mainsail/devnet/syncing"),
		mockRequest("https://static.zdassets.com/ekr/snippet.js?key=0e4c4d37-9d38-4be4-925d-e659dd4d12bd", () => ""),
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
	other: [
		mockRequest(
			"https://raw.githubusercontent.com/ArkEcosystem/common/master/mainsail/devnet/known-wallets-extended.json",
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
		// mockRequest("https://dwallets-evm.mainsailhq.com/api/transactions/fees", "coins/mainsail/devnet/transaction-fees"),
		// mockRequest("https://dwallets-evm.mainsailhq.com/api/transactions?limit=10", transactionsFixture),
		// mockRequest("https://dwallets-evm.mainsailhq.com/api/transactions?limit=20", transactionsFixture),

		// wallet transactions
		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=30&orderBy=timestamp:desc&address=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
			transactionsFixture,
		),

		// for notifications
		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&to=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6&address=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6,0xA46720D11Bc8408411Cbd45057EeDA6d32D2Af54",
			transactionsFixture,
		),

		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=30&orderBy=timestamp:desc&address=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
		// 	transactionsFixture
		// ),

		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=2&limit=30&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		// 	transactionsFixture,
		// ),
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=20&senderId=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		// 	transactionsFixture,
		// ),
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?limit=30&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD%2CD5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
		// 	transactionsFixture,
		// ),
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?limit=30&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD%2CD5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb%2CDH4Xyyt5zPqM9KwUkevUZPbzM3KjjW8fp5",
		// 	transactionsFixture,
		// ),
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=2&limit=30&address=0x659A76be283644AEc2003aa8ba26485047fd1BFB",
		// 	transactionsFixture,
		// ),
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&recipientId=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		// 	"coins/mainsail/devnet/notification-transactions",
		// ),

		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&recipientId=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
		// 	"coins/mainsail/devnet/notification-transactions",
		// ),

		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&recipientId=0x659A76be283644AEc2003aa8ba26485047fd1BFB",
		// 	transactionsFixture,
		// ),
		//
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&recipientId=DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P",
		// 	transactionsFixture,
		// ),
		//
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&recipientId=DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq",
		// 	transactionsFixture,
		// ),
		//
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=20&senderId=0x659A76be283644AEc2003aa8ba26485047fd1BFB",
		// 	transactionsFixture,
		// ),
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?limit=30&address=0x659A76be283644AEc2003aa8ba26485047fd1BFB%2CD5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
		// 	transactionsFixture,
		// ),
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?limit=30&address=0x659A76be283644AEc2003aa8ba26485047fd1BFB%2CD5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb%2CDH4Xyyt5zPqM9KwUkevUZPbzM3KjjW8fp5",
		// 	transactionsFixture,
		// ),
		// // unconfirmed transactions list before sending single or multiPayment transaction
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=20&senderId=DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS",
		// 	transactionsFixture,
		// ),
		//
		// mockRequest(
		// 	/https:\/\/ark-test\.arkvault\.io\/api\/transactions\?page=1&limit=20&senderId=(.*?)/,
		// 	transactionsFixture,
		// ),
		//
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&orderBy=timestamp&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		// 	transactionsFixture,
		// ),
		//
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&orderBy=timestamp&address=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
		// 	transactionsFixture,
		// ),
		//
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&orderBy=timestamp&address=DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq",
		// 	transactionsFixture,
		// ),
		//
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&orderBy=timestamp&address=0x659A76be283644AEc2003aa8ba26485047fd1BFB",
		// 	transactionsFixture,
		// ),
		//
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&orderBy=timestamp&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD%2CD5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
		// 	{ data: [], meta: {} },
		// ),
		//
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&orderBy=timestamp&address=0x659A76be283644AEc2003aa8ba26485047fd1BFB%2CD5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
		// 	{ data: [], meta: {} },
		// ),

		// mainnet
		// mockRequest("https://wallets-evm.mainsailhq.com/api/transactions/fees", "coins/mainsail/mainnet/transaction-fees"),

		...searchAddressesMocks(),
	],
	validators: [
		// devnet
		mockRequest("https://dwallets-evm.mainsailhq.com/api/validators", validatorsFixture),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/validators?page=1&limit=100", validatorsFixture),
		// mockRequest("https://dwallets-evm.mainsailhq.com/api/validators?page=2&limit=10", validatorsFixture),
		// mockRequest("https://dwallets-evm.mainsailhq.com/api/validators?page=3&limit=10", validatorsFixture),
		// mockRequest("https://dwallets-evm.mainsailhq.com/api/validators?page=4&limit=10", validatorsFixture),
		// mockRequest("https://dwallets-evm.mainsailhq.com/api/validators?page=5&limit=10", validatorsFixture),

		// mainnet
		// @TODO use mainnet mock when possible
		mockRequest("https://wallets-evm.mainsailhq.com/api/validators", "coins/mainsail/devnet/validators"),
	],
	wallets: [
		mockRequest("https://wallets-evm.mainsailhq.com/api/wallets?limit=1&nonce=0", {}),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/wallets?limit=1&nonce=0", {}),
		// mockRequest(
		// 	"https://dwallets-evm.mainsailhq.com/api/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD/votes",
		// 	"coins/mainsail/devnet/votes",
		// ),

		...walletMocks(),
	],
	evm: [mockRequest("https://dwallets-evm.mainsailhq.com/evm/api/", {})],
	blocks: [
		// mockRequest("https://dwallets-evm.mainsailhq.com/api/blocks/1e6789dd661ea8cd38ded6fe818eba181589497a2cc3179c42bb5695c33bcf50", {}),
	],
};

const combineRequestMocks = (preHooks: RequestMock[] = [], postHooks: RequestMock[] = []): RequestMock[] => [
	...preHooks,
	...requestMocks.configuration,
	...requestMocks.validators,
	...requestMocks.transactions,
	...requestMocks.wallets,
	...requestMocks.evm,
	...requestMocks.blocks,
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

// export const MNEMONICS = [
// 	shahinDABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr
// 	"skin fortune security mom coin hurdle click emotion heart brisk exact rather code feature era leopard grocery tide gift power lawsuit sight vehicle coin",
// shahinDCX2kvwgL2mrd9GjyYAbfXLGGXWwgN3Px7
// 	"audit theory scheme profit away wing rescue cloth fit spell atom rely enter upon man clutch divide buddy office tuition input bundle silk scheme",
// shahinDDHk393YcsxTPN1H5SWTcbjfnCRmF1iBR8
// 	"uphold egg salon police home famous focus fade skin virus fence surprise hidden skate word famous movie grant ghost save fly assume motion case",
// shahinD6zDN9rmDThCdYA7y1EjGPmgmuKknWTbMn
// 	"dress assault rich club glass fancy hood glance install buzz blur attack room outdoor chapter melody tide blur trend into have accuse very little",
// shahinDQBUSBDkqAZg5etdiPm4uKbUeLNR49fXzp
// 	"already device awful potato face kingdom coral biology badge donkey ranch random when dove solve system tonight purchase foot way deliver grow raccoon blame",
// shahinDS1TkHjVPLCRAjEekYJgybvnZyWCytstUe
// 	"garden neglect enable bone inform deal shallow smart train enrich cloud police pave ignore assault wrong chef harbor river brain way essay zero mouse",
// shahinDJQnKKbvVzQxNKNuJJHWB5Ddm4dYjDRvBy
// 	"analyst rifle dose thank unfair remain claim exile math foster clarify unfair gauge wasp notice crash sustain session lunch verify gasp try divorce slender",
// shahinDB8PEaewudtSM9LHPE2GSdwHjarjHU1A2B
// 	"tray analyst bulk topple night swing list execute walk bronze invite title silent loud cash apology sibling wheel thumb dragon black soccer mixed curious",
// shahinDJVWkM8oeyiGF19YfQnXtT5YUuFCF3hSZx
// 	"cool path congress harbor position ready embody hunt face field boil brown rubber toss arrange later convince anxiety foam urban monster endless essay melt",
// shahinDD9BS5gKPypDj9uRTFLQPgbMebPSULCSpd
// 	"subway cradle salad cake toddler sausage neglect eight cruel fault mammal cannon south interest theory sadness pass move outside segment curtain toddler save banner",
// ];

export const MNEMONICS = [
	// 0x659A76be283644AEc2003aa8ba26485047fd1BFB
	"join pyramid pitch bracket gasp sword flip elephant property actual current mango man seek merge gather fix unit aspect vault cheap gospel garment spring",
	// 0x125b484e51Ad990b5b3140931f3BD8eAee85Db23
	"monkey wage old pistol text garage toss evolve twenty mirror easily alarm ocean catch phrase hen enroll verb trade great limb diesel sight describe",
	// 0x393f3F74F0cd9e790B5192789F31E0A38159ae03
	"fade object horse net sleep diagram will casino firm scorpion deal visit this much yard apology guess habit gold crack great old media fury",
	// 0xB64b3619cEF2642E36B6093da95BA2D14Fa9b52f.json - cold wallet
	"trust anchor salmon annual control split globe conduct myself van ice resist blast hybrid track echo impose virus filter mystery harsh galaxy desk pitch",
	// 0xb0E6c955a0Df13220C36Ea9c95bE471249247E57
	"satoshi weather local seek gravity mountain cycle stem next three arch canal fitness crisp approve cute census hint casual agree pencil sleep best observe",
	// 0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6
	"embody plug round swamp sick minor notable catch idle discover barely easily audit near essence crater stand arch phone border minimum smile above exercise",
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
