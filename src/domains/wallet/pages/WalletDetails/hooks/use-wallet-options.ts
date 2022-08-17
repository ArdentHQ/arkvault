import { Enums } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import { TFunction, useTranslation } from "react-i18next";

import { DropdownOptionGroup } from "@/app/components/Dropdown";
import { isCustomNetwork } from "@/utils/network-utils";
import { hasAvailableMusigServer } from "@/utils/server-utils";

const isMultiSignature = (wallet: Contracts.IReadWriteWallet) => {
	try {
		return wallet.isMultiSignature();
	} catch {
		return false;
	}
};

const isRestoredAndSynced = (wallet: Contracts.IReadWriteWallet) =>
	wallet.hasBeenFullyRestored() && wallet.hasSyncedWithNetwork();

const walletSignatures = (wallet: Contracts.IReadWriteWallet, profile?: Contracts.IProfile) => {
	const allowsSecondSignature = () => {
		const networkAllowsSecondSig = wallet.network().allows(Enums.FeatureFlag.TransactionSecondSignature);
		const walletRequiresMnemonic =
			wallet.actsWithMnemonic() ||
			wallet.actsWithMnemonicWithEncryption() ||
			wallet.actsWithAddress() ||
			wallet.actsWithPublicKey();

		return (
			networkAllowsSecondSig &&
			isRestoredAndSynced(wallet) &&
			walletRequiresMnemonic &&
			!wallet.isSecondSignature()
		);
	};

	const allowsMultiSignature = () => {
		const networkAllowsMuSig = wallet.network().allows(Enums.FeatureFlag.TransactionMultiSignature);
		const allowsMusig =
			wallet.network().allows(Enums.FeatureFlag.TransactionMultiSignatureLedgerS) ||
			wallet.network().allows(Enums.FeatureFlag.TransactionMultiSignatureLedgerX);

		if (!isRestoredAndSynced(wallet)) {
			return false;
		}

		if (!networkAllowsMuSig) {
			return false;
		}

		if (!wallet.publicKey()) {
			return false;
		}

		if (wallet.balance() === 0) {
			return false;
		}

		if (isMultiSignature(wallet)) {
			return false;
		}

		if (wallet.isLedger() && !allowsMusig) {
			return false;
		}

		if (isCustomNetwork(wallet.network())) {
			return hasAvailableMusigServer({ network: wallet.network(), profile });
		}

		return true;
	};

	return {
		allowsMultiSignature,
		allowsSecondSignature,
	};
};

const getRegistrationOptions = (wallet: Contracts.IReadWriteWallet, t: TFunction, profile?: Contracts.IProfile) => {
	const { allowsMultiSignature, allowsSecondSignature } = walletSignatures(wallet, profile);

	const registrationOptions: DropdownOptionGroup = {
		key: "registrations",
		options: [],
		title: t("WALLETS.PAGE_WALLET_DETAILS.REGISTRATION_OPTIONS"),
	};

	if (wallet.balance() > 0 && !wallet.isLedger() && !isMultiSignature(wallet) && isRestoredAndSynced(wallet)) {
		if (
			wallet.network().allows(Enums.FeatureFlag.TransactionDelegateRegistration) &&
			!wallet.isDelegate() &&
			!wallet.isResignedDelegate()
		) {
			registrationOptions.options.push({
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.REGISTER_DELEGATE"),
				value: "delegate-registration",
			});
		}

		if (
			wallet.network().allows(Enums.FeatureFlag.TransactionDelegateResignation) &&
			wallet.isDelegate() &&
			!wallet.isResignedDelegate()
		) {
			registrationOptions.options.push({
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.RESIGN_DELEGATE"),
				value: "delegate-resignation",
			});
		}

		if (allowsSecondSignature()) {
			registrationOptions.options.push({
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.SECOND_SIGNATURE"),
				value: "second-signature",
			});
		}
	}

	if (allowsMultiSignature()) {
		registrationOptions.options.push({
			label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.MULTISIGNATURE"),
			value: "multi-signature",
		});
	}

	return registrationOptions;
};

const getAdditionalOptions = (wallet: Contracts.IReadWriteWallet, t: TFunction) => {
	const additionalOptions: DropdownOptionGroup = {
		key: "additional",
		options: [],
		title: t("WALLETS.PAGE_WALLET_DETAILS.ADDITIONAL_OPTIONS"),
	};

	if (
		!wallet.networkId().endsWith("custom") &&
		(wallet.balance() > 0 || wallet.publicKey()) &&
		isRestoredAndSynced(wallet)
	) {
		additionalOptions.options.push({
			label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.TRANSACTION_HISTORY"),
			value: "transaction-history",
		});
	}

	if (!isMultiSignature(wallet) && wallet.network().allows(Enums.FeatureFlag.MessageSign)) {
		additionalOptions.options.push({
			label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.SIGN_MESSAGE"),
			value: "sign-message",
		});
	}

	if (wallet.network().allows(Enums.FeatureFlag.MessageVerify)) {
		additionalOptions.options.push({
			label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.VERIFY_MESSAGE"),
			value: "verify-message",
		});
	}

	if (
		wallet.balance() > 0 &&
		wallet.network().allows(Enums.FeatureFlag.TransactionIpfs) &&
		isRestoredAndSynced(wallet)
	) {
		additionalOptions.options.push({
			label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.STORE_HASH"),
			value: "store-hash",
		});
	}

	return additionalOptions;
};

export const useWalletOptions = (wallet: Contracts.IReadWriteWallet, profile?: Contracts.IProfile) => {
	const { t } = useTranslation();

	const primaryOptions: DropdownOptionGroup = {
		key: "primary",
		options: [
			{
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.WALLET_NAME"),
				value: "wallet-name",
			},
			{
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.RECEIVE_FUNDS"),
				secondaryLabel: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.RECEIVE_FUNDS_QR"),
				value: "receive-funds",
			},
		],
		title: t("WALLETS.PAGE_WALLET_DETAILS.PRIMARY_OPTIONS"),
	};

	const secondaryOptions: DropdownOptionGroup = {
		hasDivider: true,
		key: "secondary",
		options: [
			{
				icon: "GlobePointer",
				iconPosition: "start",
				label: t("COMMON.OPEN_IN_EXPLORER"),
				value: "open-explorer",
			},
			{
				icon: "Trash",
				iconPosition: "start",
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.DELETE"),
				value: "delete-wallet",
			},
		],
	};

	const isWalletRestoredAndSynced = useMemo(() => isRestoredAndSynced(wallet), [wallet]);

	return useMemo(
		() => ({
			additionalOptions: getAdditionalOptions(wallet, t),
			primaryOptions,
			registrationOptions: getRegistrationOptions(wallet, t, profile),
			secondaryOptions,
		}),
		[t, wallet, isWalletRestoredAndSynced], // eslint-disable-line react-hooks/exhaustive-deps
	);
};
