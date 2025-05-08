import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";

const wallet = {
	address: () => "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
	alias: () => "Test Wallet",
	currency: () => "ARK",
	exchangeCurrency: () => "BTC",
	isValidator: () => true,
	isLedger: () => false,
	isResignedValidator: () => false,
	transaction: () => ({
		canBeSigned: () => false,
		isAwaitingOurSignature: () => false,
	}),
	network: () => ({
		id: () => "mainsail.devnet",
		isTest: () => true,
	}),
};

export const TransactionFixture = {
	hash: () => "ea63bf9a4b3eaf75a1dfff721967c45dce64eb7facf1aef29461868681b5c79b",
	blockId: () => "71fd1a494ded5430586f4dd1c79c3ac77bf38120e868c8f8980972b8075d67e9",
	type: () => "transfer",
	timestamp: () => DateTime.fromUnix(1596213281),
	confirmations: () => BigNumber.make(10),
	votes: () => ["034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192"],
	unvotes: () => ["034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192"],
	from: () => "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
	to: () => "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
	recipients: () => [],
	amount: () => 100,
	nonce: () => BigNumber.make(1),
	convertedAmount: () => 0,
	fee: () => 21,
	convertedFee: () => 0,
	memo: () => "Test",
	asset: () => ({ a: "b" }),
	isConfirmed: () => false,
	isSent: () => true,
	isReceived: () => false,
	isReturn: () => false,
	isTransfer: () => true,
	isSecondSignature: () => false,
	isMultiSignatureRegistration: () => false,
	usesMultiSignature: () => false,
	isValidatorRegistration: () => false,
	isValidatorResignation: () => false,
	isUsernameRegistration: () => false,
	isUsernameResignation: () => false,
	isVoteCombination: () => false,
	isVote: () => false,
	isUnvote: () => false,
	isIpfs: () => false,
	isMultiPayment: () => false,
	isHtlcLock: () => false,
	isHtlcClaim: () => false,
	isHtlcRefund: () => false,
	toObject: () => ({ a: "b" }),
	hasPassed: () => true,
	hasFailed: () => false,
	getMeta: () => "",
	setMeta: () => "",
	// @ts-ignore
	explorerLink: () =>
		"https://live.arkscan.io/transaction/ee4175091d9f4dacf5fed213711c3e0e4cc371e37afa7bce0429d09bcf3ecefe",
	explorerLinkForBlock: () =>
		"https://live.arkscan.io/blocks/71fd1a494ded5430586f4dd1c79c3ac77bf38120e868c8f8980972b8075d67e9",
	total: () => 121,
	convertedTotal: () => 0,
	wallet: () => wallet,
	coin: () => undefined,
	data: () => {
		return {
			data: () => {},
		};
	},
	get: () => "",
};
