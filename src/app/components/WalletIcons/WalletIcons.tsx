import { constantCase } from "@payvo/sdk-helpers";
import { Contracts } from "@payvo/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { Size } from "@/types";

interface WalletIconsProperties {
	exclude?: string[];
	iconColor?: string;
	iconSize?: Size;
	wallet: Contracts.IReadWriteWallet;
	tooltipDarkTheme?: boolean;
}

interface WalletIconProperties {
	type: "SecondSignature" | "Multisignature" | "TestNetwork" | "Ledger" | "Starred" | "Verified";
	label?: string;
	iconColor?: string;
	iconSize?: Size;
	tooltipDarkTheme?: boolean;
}

const getIconName = (type: string) => {
	if (type === "Starred") {
		return "StarFilled";
	}

	if (type === "Verified") {
		return "UserCheckMark";
	}

	if (type === "TestNetwork") {
		return "Code";
	}

	return type;
};

const getIconColor = (type: string) => (type === "Starred" ? "text-theme-warning-400" : "text-theme-secondary-700");

export const WalletIcon = ({ type, label, iconColor, iconSize = "lg", tooltipDarkTheme }: WalletIconProperties) => {
	const { t } = useTranslation();

	return (
		<Tooltip
			content={label || t(`COMMON.${constantCase(type)}` as const as any)}
			theme={tooltipDarkTheme ? "dark" : undefined}
		>
			<div data-testid={`WalletIcon__${type}`} className={`inline-block p-1 ${iconColor || getIconColor(type)}`}>
				<Icon name={getIconName(type)} size={iconSize} />
			</div>
		</Tooltip>
	);
};

export const WalletIcons = ({ exclude, wallet, ...iconProperties }: WalletIconsProperties) => {
	const { t } = useTranslation();

	return (
		<>
			{!exclude?.includes("isKnown") && wallet.isKnown() && (
				<WalletIcon
					type="Verified"
					label={t(`COMMON.VERIFIED`, { value: wallet.knownName() })}
					{...iconProperties}
				/>
			)}
			{!exclude?.includes("isSecondSignature") && wallet.hasSyncedWithNetwork() && wallet.isSecondSignature() && (
				<WalletIcon type="SecondSignature" label={t("COMMON.SECOND_SIGNATURE")} {...iconProperties} />
			)}
			{!exclude?.includes("isLedger") && wallet.isLedger() && <WalletIcon type="Ledger" {...iconProperties} />}
			{!exclude?.includes("isStarred") && wallet.isStarred() && <WalletIcon type="Starred" {...iconProperties} />}
			{!exclude?.includes("isMultiSignature") && wallet.hasSyncedWithNetwork() && wallet.isMultiSignature() && (
				<WalletIcon type="Multisignature" {...iconProperties} />
			)}
			{!exclude?.includes("isTestNetwork") && wallet.network().isTest() && (
				<WalletIcon type="TestNetwork" {...iconProperties} />
			)}
		</>
	);
};
