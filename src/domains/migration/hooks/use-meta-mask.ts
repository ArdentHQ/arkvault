import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { Ethereum, METAMASK_ERROR_CODES, WindowWithEthereum, WindowWithMaybeEthereum } from "./use-meta-mask.contracts";
import { polygonNetworkData } from "@/utils/polygon-migration";
function hasMetaMask() {
	return !!(window as WindowWithMaybeEthereum).ethereum;
}

function getEtherum(): Ethereum {
	return (window as unknown as WindowWithEthereum).ethereum;
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

const networkData = polygonNetworkData();

export const useMetaMask = () => {
	const [initialized, setInitialized] = useState<boolean>(false);
	const [chainId, setChainId] = useState<number>();
	const [account, setAccount] = useState<string | null>();
	const [ethereumProvider, setEthereumProvider] = useState<ethers.providers.Web3Provider>();
	const [connecting, setConnecting] = useState<boolean>(false);
	const [switching, setSwitching] = useState<boolean>(false);

	const isOnValidNetwork = chainId === Number.parseInt(networkData.chainId);

	const supportsMetaMask = isMetaMaskSupportedBrowser();
	const needsMetaMask = !hasMetaMask() || !supportsMetaMask;

	// Initialize the Web3Provider when the page loads
	useEffect(() => {
		if (needsMetaMask || !supportsMetaMask) {
			setInitialized(true);
			return;
		}

		const ethereum = getEtherum();

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
			// At this point we know for sure that the `ethereumProvider` is set
			const [accounts, chainIdAsHex] = await Promise.all([
				ethereumProvider!.send("eth_requestAccounts", []),
				ethereumProvider!.send("eth_chainId", []),
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

	const addPolygonNetwork = useCallback(async (ethereum: Ethereum) => {
		try {
			await ethereum.request({
				method: "wallet_addEthereumChain",
				params: [networkData],
			});
		} catch {
			// Nothing to do here, likely the user rejected the request
		}

		setSwitching(false);
	}, []);

	const switchToPolygonNetwork = useCallback(async () => {
		setSwitching(true);

		const ethereum = getEtherum();

		try {
			await ethereum.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: networkData.chainId }],
			});

			setSwitching(false);
		} catch (error) {
			if (error.code === METAMASK_ERROR_CODES.CHAIN_NOT_ADDED_YET) {
				addPolygonNetwork(ethereum);
				return;
			}

			setSwitching(false);
		}
	}, [addPolygonNetwork]);

	return {
		account,
		chainId,
		connectWallet,
		connecting,
		initialized,
		isOnValidNetwork,
		needsMetaMask,
		supportsMetaMask,
		switchToPolygonNetwork,
		switching,
	};
};
