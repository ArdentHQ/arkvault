import { Contracts } from "@ardenthq/sdk-profiles";
import { Networks, Coins } from "@ardenthq/sdk";
import { isValidUrl } from "./url-validation";
import { HttpClient } from "@/app/services/HttpClient";
import { NetworkHostType, NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";

// Valid host @see https://www.rfc-editor.org/rfc/rfc952
const hostRegex =
	/^(?:(?<schema>https?):\/\/)?(?<host>(?:(?:[a-z]|[a-z][\da-z-]*[\da-z])\.)*(?:[a-z]|[a-z][\da-z-]*[\da-z])*)(?::(?<port>\d{1,5}))?/i;

// Valid ip address
const ipRegex =
	/^(?:(?<schema>https?):\/\/)?(?<host>(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))(?::(?<port>\d{1,5}))?/i;

const hasPath = (url: string, path: string) => new URL(url).pathname === path;

const endsWithSlash = (url: string) => url.endsWith("/");

const isValidDomain = (url: string) => !!hostRegex.exec(url)?.groups?.host;

const isValidIp = (url: string) => !!ipRegex.exec(url)?.groups?.host;

const addressIsValid = (address: string) => {
	if (!isValidUrl(address)) {
		return false;
	}

	if (isValidDomain(address) || isValidIp(address)) {
		return true;
	}

	return false;
};

const getBaseUrl = (address: string): string => {
	const { host, protocol } = new URL(address);

	return `${protocol}//${host}`;
};

const isPeer = (body: object): boolean => {
	if (!body["data"]) {
		return false;
	}

	return body["data"].startsWith("Hello World");
};

const isMusig = (body: object): boolean => {
	if (typeof body["name"] !== "string") {
		return false;
	}

	return body["name"].endsWith("-musig-server");
};

const urlBelongsToNetwork = async (profile: Contracts.IProfile, url: string, network: Networks.Network) => {
	const coin: Coins.Coin = profile.coins().makeInstance(network.coin(), network.id());
	await coin.__construct();
	return coin.prober().evaluate(url);
};

const pingServerAddress = async (address: string, type: NetworkHostType): Promise<boolean> => {
	const baseUrl = getBaseUrl(address);

	const client = new HttpClient(0);

	const pingServer = async () => {
		try {
			const response = await client.get(baseUrl);

			const body = JSON.parse(response.body());

			if (type === "full") {
				return isPeer(body);
			}

			return isMusig(body);
		} catch {
			return false;
		}
	};

	return pingServer();
};

const getServerHeight = async (address: string): Promise<number | undefined> => {
	const client = new HttpClient(0);

	const baseUrl = getBaseUrl(address);

	try {
		const response = await client.get(`${baseUrl}/api/blockchain`);
		const dataBody: any = JSON.parse(response.body());
		return dataBody.data?.block?.height as number | undefined;
	} catch {
		return;
	}
};

const isSameNetwork = (networkA: NormalizedNetwork, networkB: NormalizedNetwork): boolean =>
	networkA.network &&
	networkB.network &&
	networkA.network.id() === networkB.network.id() &&
	networkA.address === networkB.address &&
	networkA.serverType === networkB.serverType;

export {
	addressIsValid,
	hostRegex,
	ipRegex,
	isValidIp,
	isValidDomain,
	isSameNetwork,
	hasPath,
	endsWithSlash,
	getBaseUrl,
	isPeer,
	isMusig,
	urlBelongsToNetwork,
	pingServerAddress,
	getServerHeight,
};

export { isValidUrl } from "./url-validation";
