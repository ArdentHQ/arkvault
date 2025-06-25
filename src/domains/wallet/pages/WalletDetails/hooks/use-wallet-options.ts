import { Enums } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/app/i18n/react-i18next.contracts";

import { DropdownOptionGroup } from "@/app/components/Dropdown";
import { isCustomNetwork } from "@/utils/network-utils";
import { hasAvailableMusigServer } from "@/utils/server-utils";

const isMultiSignature = (wallet: Contracts.IReadWriteWallet) => {
	console.log(wallet);
	return false;
};

const isRestoredAndSynced = (wallet: Contracts.IReadWriteWallet) =>
	wallet.hasBeenFullyRestored() && wallet.hasSyncedWithNetwork();

const allowsMultiSignature = (wallet: Contracts.IReadWriteWallet, profile?: Contracts.IProfile) => {
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

const getRegistrationOptions = (wallets: Contracts.IReadWriteWallet[], t: TFunction, profile?: Contracts.IProfile) => {
	const registrationOptions: DropdownOptionGroup = {
		key: "registrations",
		options: [],
		title: t("WALLETS.PAGE_WALLET_DETAILS.REGISTRATION_OPTIONS"),
	};

	// @TODO enable when we add ledger support
	// if (wallets.isLedger() && !isLedgerTransportSupported()) {
	// 	return registrationOptions;
	// }

	const walletsWithValidatorActions = wallets.filter((w) => w.balance() > 0 && isRestoredAndSynced(w));

	if (walletsWithValidatorActions.length > 0) {
		if (
			walletsWithValidatorActions.some(
				(w) =>
					w.network().allows(Enums.FeatureFlag.TransactionValidatorRegistration) &&
					!w.isValidator() &&
					!w.isResignedValidator(),
			)
		) {
			registrationOptions.options.push({
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.REGISTER_VALIDATOR"),
				value: "validator-registration",
			});
		}

		if (
			walletsWithValidatorActions.some(
				(w) =>
					w.network().allows(Enums.FeatureFlag.TransactionValidatorRegistration) &&
					w.isValidator() &&
					!w.isResignedValidator() &&
					w.isLegacyValidator(),
			)
		) {
			registrationOptions.options.push({
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.UPDATE_VALIDATOR"),
				value: "validator-registration",
			});
		}

		if (
			walletsWithValidatorActions.some(
				(w) =>
					w.network().allows(Enums.FeatureFlag.TransactionValidatorResignation) &&
					w.isValidator() &&
					!w.isResignedValidator(),
			)
		) {
			registrationOptions.options.push({
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.RESIGN_VALIDATOR"),
				value: "validator-resignation",
			});
		}

		if (
			walletsWithValidatorActions.some((w) =>
				w.network().allows(Enums.FeatureFlag.TransactionUsernameRegistration),
			)
		) {
			registrationOptions.options.push({
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.REGISTER_USERNAME"),
				value: "username-registration",
			});
		}

		if (
			walletsWithValidatorActions.some(
				(w) => w.network().allows(Enums.FeatureFlag.TransactionUsernameRegistration) && w.username(),
			)
		) {
			registrationOptions.options.push({
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.RESIGN_USERNAME"),
				value: "username-resignation",
			});
		}
	}

	if (wallets.some((w) => allowsMultiSignature(w, profile))) {
		registrationOptions.options.push({
			label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.MULTISIGNATURE"),
			value: "multi-signature",
		});
	}

	return registrationOptions;
};

const getAdditionalOptions = (wallets: Contracts.IReadWriteWallet[], t: TFunction) => {
	const additionalOptions: DropdownOptionGroup = {
		key: "additional",
		options: [],
		title: t("WALLETS.PAGE_WALLET_DETAILS.ADDITIONAL_OPTIONS"),
	};

	if (wallets.some((w) => (w.balance() > 0 || w.publicKey()) && isRestoredAndSynced(w))) {
		additionalOptions.options.push({
			label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.TRANSACTION_HISTORY"),
			value: "transaction-history",
		});
	}

	// @TODO enable when we add ledger support
	// if (wallets.isLedger() && !isLedgerTransportSupported()) {
	// 	return additionalOptions;
	// }

	if (wallets.some((w) => w.network().allows(Enums.FeatureFlag.MessageSign))) {
		additionalOptions.options.push({
			label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.SIGN_MESSAGE"),
			value: "sign-message",
		});
	}

	if (wallets.some((w) => w.network().allows(Enums.FeatureFlag.MessageVerify))) {
		additionalOptions.options.push({
			label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.VERIFY_MESSAGE"),
			value: "verify-message",
		});
	}

	return additionalOptions;
};

export const useWalletOptions = (wallets: Contracts.IReadWriteWallet[], profile?: Contracts.IProfile) => {
	const { t } = useTranslation();

	const hasMultipleWallets = wallets.length > 1;

	const primaryOptions: DropdownOptionGroup = {
		key: "primary",
		options: [],
		title: t("WALLETS.PAGE_WALLET_DETAILS.PRIMARY_OPTIONS"),
	};

	if (!hasMultipleWallets) {
		primaryOptions.options.push(
			{
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.ADDRESS_NAME"),
				value: "wallet-name",
			},
			{
				label: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.RECEIVE_FUNDS"),
				secondaryLabel: t("WALLETS.PAGE_WALLET_DETAILS.OPTIONS.RECEIVE_FUNDS_QR"),
				value: "receive-funds",
			},
		);
	}

	const secondaryOptions: DropdownOptionGroup = {
		hasDivider: true,
		key: "secondary",
		options: [],
	};

	if (!hasMultipleWallets) {
		secondaryOptions.options.push(
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
		);
	}

	const areWalletsRestoredAndSynced = useMemo(
		() => wallets.map((wallet) => isRestoredAndSynced(wallet)).join("-"),
		[wallets],
	);

	return useMemo(
		() => ({
			additionalOptions: getAdditionalOptions(wallets, t),
			primaryOptions,
			registrationOptions: getRegistrationOptions(wallets, t, profile),
			secondaryOptions,
		}),
		[t, wallets, areWalletsRestoredAndSynced],
	);
};
