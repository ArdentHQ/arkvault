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

export const useMetaMask = () => {
	const [needsMetaMask, setNeedsMetaMask] = useState<boolean>(false);
	const [chainId, setChainId] = useState<number>();
	const [account, setAccount] = useState<string | null>();
	const [ethereumProvider, setEthereumProvider] = useState<ethers.providers.Web3Provider>();
	const isOnPolygonNetwork = useMemo(() => chainId === POLYGON_NETWORK_ID, [chainId]);

	// Initialize the Web3Provider when the page loads
	useEffect(() => {
		if (!window.ethereum) {
			setNeedsMetaMask(true);
			return;
		}

		const ethereum = window.ethereum as Ethereum;

		async function initProvider() {
			const provider = new ethers.providers.Web3Provider(ethereum, "any");

			const [chain, accounts] = await Promise.all([provider.getNetwork(), provider.listAccounts()]);

			setAccount(accounts.length > 0 ? accounts[0] : null);

			setChainId(chain.chainId);

			setEthereumProvider(provider);
		}

		const accountChangedListener = (accounts: string[]) => {
			console.log("accountsChanged", accounts);
			setAccount(accounts.length > 0 ? accounts[0] : null);
		};

		const chainChangedListener = (chainId: string) => {
			console.log("chainChangedListener", chainId);
			// Chain ID came in as a hex string, so we need to convert it to decimal
			setChainId(Number.parseInt(chainId, 16));
		};

		ethereum.on("accountsChanged", accountChangedListener);

		ethereum.on("chainChanged", chainChangedListener);

		initProvider();

		return () => {
			ethereum.removeListener("accountsChanged", accountChangedListener);
			ethereum.removeListener("chainChanged", chainChangedListener);
		};
	}, []);

	const requestChainAndAccount = useCallback(async () => {
		try {
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
		const { chainId, account } = await requestChainAndAccount();
		setAccount(account);
		setChainId(chainId);
	}, [requestChainAndAccount]);

	return {
		account,
		chainId,
		connectWallet,
		isOnPolygonNetwork,
		needsMetaMask,
	};
};
