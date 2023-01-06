import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MetaMaskInpageProvider } from "@metamask/providers";

interface EthereumEvent {
	connect: any;
	disconnect: any;
	message: any;
	chainChanged: string;
	accountsChanged: Array<string>;
}

type EventKeys = keyof EthereumEvent;

type EventHandler<K extends EventKeys> = (event: EthereumEvent[K]) => void;

type Ethereum = ethers.providers.ExternalProvider &
	MetaMaskInpageProvider & {
		on<K extends EventKeys>(event: K, eventHandler: EventHandler<K>): void;
	};

const POLYGON_NETWORK_ID = 137;

type WindowWithEthereum = Window & { ethereum?: Ethereum };

function hasMetaMask() {
	return !!(window as WindowWithEthereum).ethereum;
}

// Metamask supports Chrome, Firefox, Brave, Edge, and Opera, since Edge and
// Opera are based on Chromium, we can just check for Chrome and Firefox
// @see https://metamask.io/download/
function isMetaMaskSupportedBrowser() {
	// If the user has MetaMask installed, we can assume they are on a supported browser
	if (hasMetaMask()) {
		return true;
	}

	const isCompatible = /chrome|firefox/.test(navigator.userAgent.toLowerCase());
	const isMobile = /android|iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

	return isCompatible && !isMobile;
}

export const useMetaMask = () => {
	const [initialized, setInitialized] = useState<boolean>(false);
	const [chainId, setChainId] = useState<number>();
	const [account, setAccount] = useState<string | null>();
	const [ethereumProvider, setEthereumProvider] = useState<ethers.providers.Web3Provider>();
	const [connecting, setConnecting] = useState<boolean>(false);
	const isOnPolygonNetwork = useMemo(() => chainId === POLYGON_NETWORK_ID, [chainId]);

	const supportsMetaMask = isMetaMaskSupportedBrowser();
	const needsMetaMask = !hasMetaMask() || !supportsMetaMask;

	// Initialize the Web3Provider when the page loads
	useEffect(() => {
		if (needsMetaMask || !supportsMetaMask) {
			setInitialized(true);
			return;
		}

		const ethereum = (window as WindowWithEthereum).ethereum;

		let verifyNetworkInterval: ReturnType<typeof setInterval>;

		async function initProvider() {
			const provider = new ethers.providers.Web3Provider(ethereum, "any");

			const [chain, accounts] = await Promise.all([provider.getNetwork(), provider.listAccounts()]);

			setAccount(accounts.length > 0 ? accounts[0] : null);

			setChainId(chain.chainId);

			setEthereumProvider(provider);

			setInitialized(true);

			// The MetaMask app contains some invalid (deprecated) networks,
			// which, when changing from a valid network to them (for example,
			// changing from "Polygon Network" to "Kovan Test Network"), simply
			// do not trigger the `chainChanged` event. To prevent issues
			// regarding this, I added the following timeout that checks and
			// updates the selected network in case is outdated.
			const updateChainId = async () => {
				const { chainId } = await provider.getNetwork();

				setChainId(chainId);
			};

			verifyNetworkInterval = setInterval(updateChainId, 1000);
		}

		initProvider();

		const accountChangedListener = (accounts: string[]) => {
			setAccount(accounts.length > 0 ? accounts[0] : null);
		};

		const chainChangedListener = (chainId: string) => {
			// Chain ID came in as a hex string, so we need to convert it to decimal
			setChainId(Number.parseInt(chainId, 16));
		};
		const connectListener = ({ chainId }: { chainId: string }) => {
			chainChangedListener(chainId);
		};

		const disconnectListener = () => {
			setChainId(undefined);
		};

		ethereum.on("accountsChanged", accountChangedListener);

		ethereum.on("chainChanged", chainChangedListener);

		ethereum.on("disconnect", disconnectListener);

		// Connect event is fired when the user is disconnected because an error
		// (e.g. the network is invalid) and then switches to a valid network
		ethereum.on("connect", connectListener);

		return () => {
			ethereum.removeListener("accountsChanged", accountChangedListener);
			ethereum.removeListener("chainChanged", chainChangedListener);
			ethereum.removeListener("connect", connectListener);
			ethereum.removeListener("disconnect", disconnectListener);

			clearInterval(verifyNetworkInterval);
		};
	}, []);

	const requestChainAndAccount = useCallback(async () => {
		try {
			const [accounts, chainIdAsHex] = await Promise.all([
				ethereumProvider.send("eth_requestAccounts", []),
				ethereumProvider.send("eth_chainId", []),
			]);

			const chainId = Number.parseInt(chainIdAsHex, 16);

			return {
				account: accounts.length > 0 ? accounts[0] : null,
				chainId: chainId,
			};
		} catch {
			return {
				account: undefined,
				chainId: undefined,
			};
		}
	}, [ethereumProvider]);

	const connectWallet = useCallback(async () => {
		setConnecting(true);
		const { chainId, account } = await requestChainAndAccount();

		setAccount(account);
		setChainId(chainId);
		setConnecting(false);
	}, [requestChainAndAccount]);

	return {
		account,
		chainId,
		connectWallet,
		connecting,
		initialized,
		isOnPolygonNetwork,
		needsMetaMask,
		supportsMetaMask,
	};
};
