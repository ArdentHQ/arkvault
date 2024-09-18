import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import tw, { css, styled } from "twin.macro";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { Amount } from "@/app/components/Amount";
import { WalletIcon } from "@/app/components/WalletIcons";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile, useTheme } from "@/app/hooks";
import {
	LabelledTextProperties,
	WalletsGroupNetworkIconProperties,
	WalletsGroupNetworkNameProperties,
	WalletsGroupNetworkTotalProperties,
	WalletsGroupSkeletonProperties,
} from "@/domains/wallet/components/WalletsGroup/WalletsGroup.contracts";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { Skeleton } from "@/app/components/Skeleton";
import { networkDisplayName } from "@/utils/network-utils";

export const LabelledText: React.FC<LabelledTextProperties> = ({ label, children, maxWidthReference, className }) => {
	const [width, setWidth] = useState<number | undefined>();
	const columnReference = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (!columnReference.current || !maxWidthReference) {
			return;
		}

		const maxColumnWidth = maxWidthReference.current;
		const columnWidth = columnReference.current.getBoundingClientRect().width;
		if (columnWidth >= maxColumnWidth) {
			maxWidthReference.current = columnWidth;
			return;
		}
		setWidth(maxColumnWidth);
	}, [columnReference, maxWidthReference, children]);

	return (
		<div
			className={cn(
				"flex flex-col space-y-1 border-r border-theme-secondary-300 pr-4 text-right font-semibold dark:border-theme-secondary-800",
				className,
			)}
			ref={columnReference}
			style={width ? { width: `${width}px` } : undefined}
		>
			<span className="whitespace-nowrap text-sm text-theme-secondary-700 dark:text-theme-secondary-700">
				{label}
			</span>

			{typeof children === "function"
				? children("text-base text-theme-secondary-900 dark:text-theme-secondary-200")
				: children}
		</div>
	);
};

const GroupNetworkIconWrapper = styled.div<{ isDarkMode: boolean; isExpanded: boolean }>`
	flex-basis: 2.75rem;

	${tw`relative flex h-11 flex-shrink-0 items-center justify-center rounded-xl bg-clip-padding`}

	${({ isDarkMode }) =>
		isDarkMode
			? tw`bg-theme-background text-theme-secondary-700 ring-2 ring-theme-secondary-800`
			: tw`bg-theme-secondary-100 text-theme-secondary-100`}

	${({ isExpanded }) => !isExpanded && tw`transition-all duration-100`}

	${({ isDarkMode, isExpanded }) => {
		if (isDarkMode && !isExpanded) {
			return css`
				@media not all and (hover: none) {
					${tw`group-hover:(bg-theme-secondary-800 ring-theme-secondary-700)`};
				}
			`;
		}
	}}
`;

export const GroupNetworkIcon: React.VFC<WalletsGroupNetworkIconProperties> = ({ network, isGroupExpanded }) => {
	const { isDarkMode } = useTheme();

	return (
		<GroupNetworkIconWrapper isDarkMode={isDarkMode} isExpanded={isGroupExpanded}>
			<NetworkIcon
				isCompact
				network={network}
				shadowClassName={
					"rounded-lg w-46 h-46 group-hover:bg-theme-secondary-100 dark:(bg-theme-background group-hover:ring-black group-hover:bg-black)"
				}
				size="lg"
			/>

			{network.isTest() && (
				<div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-theme-background sm:hidden">
					<WalletIcon type="TestNetwork" iconSize="md" />
				</div>
			)}
		</GroupNetworkIconWrapper>
	);
};

export const GroupNetworkName: React.VFC<WalletsGroupNetworkNameProperties> = ({ network }) => (
	<div className="hidden flex-auto items-center justify-between space-x-2 px-3 sm:flex">
		<h1 className="mb-0 text-base md:text-lg" data-testid="header__title">
			{networkDisplayName(network)}
		</h1>
		{network.isTest() && (
			<div className="hidden sm:inline-flex">
				<WalletIcon type="TestNetwork" />
			</div>
		)}
		<div className="grow" />
	</div>
);

export const GroupNetworkTotal: React.VFC<WalletsGroupNetworkTotalProperties> = ({
	network,
	wallets,
	maxWidthReferences,
	noBorder,
}) => {
	const profile = useActiveProfile();
	const { t } = useTranslation();

	const { profileIsSyncingExchangeRates, profileIsSyncing } = useConfiguration();

	const exchangeCurrency = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency)!;

	const renderWallets = () => {
		if (profileIsSyncing) {
			return <GroupSkeleton width={60} />;
		}

		return wallets.length;
	};

	const renderBalance = () => {
		if (profileIsSyncing) {
			return <GroupSkeleton width={140} className="h-5" innerClassName="h-4" />;
		}

		let totalNetworkBalance = BigNumber.ZERO;

		for (const wallet of wallets) {
			totalNetworkBalance = totalNetworkBalance.plus(wallet.balance());
		}

		return <Amount value={totalNetworkBalance.toNumber()} ticker={network.ticker()} />;
	};

	const renderCurrency = () => {
		if (network.isTest()) {
			return (
				<span className="text-theme-secondary-500 dark:text-theme-secondary-700">
					{t("COMMON.NOT_AVAILABLE")}
				</span>
			);
		}

		if (profileIsSyncingExchangeRates || profileIsSyncing) {
			return <GroupSkeleton width={110} className="h-4" innerClassName="h-3.5" />;
		}

		let totalConvertedNetworkBalance = BigNumber.ZERO;

		for (const wallet of wallets) {
			totalConvertedNetworkBalance = totalConvertedNetworkBalance.plus(wallet.convertedBalance());
		}

		return <Amount value={totalConvertedNetworkBalance.toNumber()} ticker={exchangeCurrency} />;
	};

	return (
		<>
			<div className="ml-auto flex flex-col space-y-1.5 text-right font-semibold sm:hidden">
				<span className="text-sm text-theme-secondary-900 dark:text-theme-secondary-200">
					{renderBalance()}
				</span>
				<span className="text-xs text-theme-secondary-500 dark:text-theme-secondary-700">
					{renderCurrency()}
				</span>
			</div>

			<div
				className="hidden flex-initial space-x-4 sm:flex"
				css={css`
					@media not all and (hover: none) {
						${tw`dark:group-hover:divide-theme-secondary-700`};
					}
				`}
			>
				{/* needed for the border color on the first LabelledText element */}
				<span className="hidden" />

				<LabelledText label={t("COMMON.WALLETS")}>
					{(className) => <span className={className}>{renderWallets()}</span>}
				</LabelledText>

				<LabelledText
					label={t("COMMON.TOTAL_BALANCE")}
					maxWidthReference={maxWidthReferences?.balance}
					className={cn({ "border-r-0 pr-0 lg:border-r lg:pr-4": noBorder })}
				>
					{(className) => <span className={className}>{renderBalance()}</span>}
				</LabelledText>

				<LabelledText
					label={t("COMMON.TOTAL_CURRENCY")}
					maxWidthReference={maxWidthReferences?.currency}
					className={cn("hidden lg:flex", { "border-r-0 pr-0": noBorder })}
				>
					{(className) => <span className={className}>{renderCurrency()}</span>}
				</LabelledText>
			</div>
		</>
	);
};

export const GroupSkeleton: React.VFC<WalletsGroupSkeletonProperties> = ({ width, className, innerClassName }) => (
	<div className={cn("flex items-center justify-end sm:h-6", className)}>
		<Skeleton width={width} className={cn("sm:h-4.5", innerClassName)} />
	</div>
);
