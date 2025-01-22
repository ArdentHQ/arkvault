import { Enums } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/app/i18n/react-i18next.contracts";

import { DropdownOptionGroup } from "@/app/components/Dropdown";
import { isCustomNetwork } from "@/utils/network-utils";
import { hasAvailableMusigServer } from "@/utils/server-utils";
import { isLedgerTransportSupported } from "@/app/contexts/Ledger/transport";

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
	};
};

const getRegistrationOptions = (wallet: Contracts.IReadWriteWallet, t: TFunction, profile?: Contracts.IProfile) => {
	const { allowsMultiSignature } = walletSignatures(wallet, profile);

	const registrationOptions: DropdownOptionGroup = {
		key: "registrations",
		options: [],
		title: t("WALLETS.PAGE_WALLET_DETAILS.REGISTRATION_OPTIONS"),
	};

	if (wallet.isLedger() && !isLedgerTransportSupported()) {
		return registrationOptions;
	}

	if (wallet.balance() > 0 && !wallet.isLedger() && !isMultiSignature(wallet) && isRestoredAndSynced(wallet)) {
		if (
			wallet.network().allows(Enums.FeatureFlag.TransactionValidatorRegistration) &&
			!wallet.isValidator() &&
			!wallet.isResignedValidator()
		) {
			registrationOptions.options.push({
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.REGISTER_VALIDATOR"),
				value: "delegate-registration",
			});
		}

		if (
			wallet.network().allows(Enums.FeatureFlag.TransactionValidatorResignation) &&
			wallet.isValidator() &&
			!wallet.isResignedValidator()
		) {
			registrationOptions.options.push({
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.RESIGN_VALIDATOR"),
				value: "delegate-resignation",
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

	if (wallet.isLedger() && !isLedgerTransportSupported()) {
		return additionalOptions;
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

	return additionalOptions;
};

export const useWalletOptions = (wallet: Contracts.IReadWriteWallet, profile?: Contracts.IProfile) => {
	const { t } = useTranslation();

	const primaryOptions: DropdownOptionGroup = {
		key: "primary",
		options: [
			{
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.ADDRESS_NAME"),
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
				icon: "ArrowExternal",
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
