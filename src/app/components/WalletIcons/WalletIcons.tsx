import { Contracts } from "@/app/lib/profiles";
import { Icon } from "@/app/components/Icon";
import React from "react";
import { Size } from "@/types";
import { Skeleton } from "@/app/components/Skeleton";
import { Tooltip } from "@/app/components/Tooltip";
import { constantCase } from "@/app/lib/helpers";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";

interface WalletIconsProperties {
	exclude?: string[];
	iconColor?: string;
	iconSize?: Size;
	wallet: Contracts.IReadWriteWallet;
	tooltipDarkTheme?: boolean;
}

interface WalletIconProperties {
	type: "SecondSignature" | "Multisignature" | "TestNetwork" | "Ledger" | "Starred" | "Verified" | "Username";
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

	if (type === "Username") {
		return "UserCircledCheckMark";
	}

	return type;
};

const getIconColor = (type: string) =>
	type === "Starred"
		? "fill-transparent hover:fill-theme-warning-200 stroke-theme-warning-400"
		: "text-theme-secondary-700 dark:text-theme-secondary-600";

export const WalletIcon = ({ type, label, iconColor, iconSize = "lg", tooltipDarkTheme }: WalletIconProperties) => {
	const { t } = useTranslation();

	return (
		<Tooltip
			content={label || t(`COMMON.${constantCase(type)}` as const as any)}
			theme={tooltipDarkTheme ? "dark" : undefined}
		>
			<Button
				variant="transparent"
				data-testid={`WalletIcon__${type}`}
				className={`inline-block p-1 ${iconColor || getIconColor(type)}`}
			>
				<Icon name={getIconName(type)} size={iconSize} />
			</Button>
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
			{!exclude?.includes("isTestNetwork") && wallet.network().isTest() && (
				<WalletIcon type="TestNetwork" {...iconProperties} />
			)}
			{!exclude?.includes("hasUsername") && wallet.username() && (
				<WalletIcon
					type="Username"
					label={`${t("COMMON.USERNAME")}: ${wallet.username()}`}
					{...iconProperties}
				/>
			)}
		</>
	);
};

export const WalletIconsSkeleton = () => <Skeleton width={54} height={20} />;
