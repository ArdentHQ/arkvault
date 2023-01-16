import { ethers } from "ethers";
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

export type Ethereum = ethers.providers.ExternalProvider &
	MetaMaskInpageProvider & {
		on<K extends EventKeys>(event: K, eventHandler: EventHandler<K>): void;
	};

export enum METAMASK_ERROR_CODES {
	CHAIN_NOT_ADDED_YET = 4902,
}

export type WindowWithMaybeEthereum = Window & { ethereum?: Ethereum };

export type WindowWithEthereum = Window & { ethereum: Ethereum };

export interface AddEthereumChainParameter {
	chainId: string; // A 0x-prefixed hexadecimal string
	chainName: string;
	nativeCurrency: {
		name: string;
		symbol: string; // 2-6 characters long
		decimals: 18;
	};
	rpcUrls: string[];
	blockExplorerUrls?: string[];
	iconUrls?: string[]; // Currently ignored.
}
