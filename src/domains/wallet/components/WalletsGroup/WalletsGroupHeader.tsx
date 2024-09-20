import React from "react";
import { useTranslation } from "react-i18next";
import { useBreakpoint } from "@/app/hooks";
import {
	GroupNetworkIcon,
	GroupNetworkName,
	GroupNetworkTotal,
	GroupSkeleton,
	LabelledText,
} from "@/domains/wallet/components/WalletsGroup/WalletsGroup.blocks";
import {
	WalletsGroupHeaderProperties,
	WalletsGroupHeaderSkeletonProperties,
} from "@/domains/wallet/components/WalletsGroup/WalletsGroup.contracts";
import { AccordionHeader, AccordionHeaderSkeletonWrapper } from "@/app/components/Accordion";
import { Skeleton } from "@/app/components/Skeleton";

export const WalletsGroupHeader: React.VFC<WalletsGroupHeaderProperties> = ({
	wallets,
	network,
	onClick,
	isExpanded,
	maxWidthReferences,
	className,
}) => (
	<AccordionHeader isExpanded={isExpanded} onClick={onClick} data-testid="WalletsGroupHeader" className={className}>
		<GroupNetworkIcon network={network} isGroupExpanded={isExpanded} />
		<GroupNetworkName network={network} />
		<GroupNetworkTotal
			network={network}
			wallets={wallets}
			maxWidthReferences={maxWidthReferences}
			noBorder={!onClick}
		/>
	</AccordionHeader>
);

export const WalletsGroupHeaderSkeleton: React.VFC<WalletsGroupHeaderSkeletonProperties> = ({
	isPlaceholder = false,
}) => {
	const { t } = useTranslation();

	const { isXs } = useBreakpoint();

	const labelClassname = "text-lg text-theme-secondary-600 dark:text-theme-secondary-700";
	const labelNotAvailable = t("COMMON.NOT_AVAILABLE");

	return (
		<AccordionHeaderSkeletonWrapper data-testid="WalletsGroupHeaderSkeleton">
			<div className="flex h-11 w-11 shrink-0 flex-row items-center justify-center -space-x-1 rounded-xl bg-theme-background bg-clip-padding text-theme-secondary-100 ring-1 ring-theme-secondary-300 dark:bg-theme-background dark:text-theme-secondary-700 dark:ring-theme-secondary-800">
				{isPlaceholder ? <></> : <Skeleton width={20} height={20} />}
			</div>
			<div className="grow justify-between space-x-3 px-3 py-3">
				<h1
					className="mb-0 text-lg text-theme-secondary-700 dark:text-theme-secondary-700"
					data-testid="header__title"
				>
					{isPlaceholder ? (
						t("COMMON.CRYPTOASSET")
					) : (
						<div className="flex h-7 items-center">
							<Skeleton width={150} height={18} />
						</div>
					)}
				</h1>
			</div>

			{isXs && !isPlaceholder && (
				<div className="flex h-10 flex-col items-end justify-between">
					<Skeleton width={90} height={14} />
					<Skeleton width={50} height={12} />
				</div>
			)}

			{!isXs && (
				<div className="flex space-x-3">
					<LabelledText label={t("COMMON.WALLETS")}>
						<span className={labelClassname}>
							{isPlaceholder ? labelNotAvailable : <GroupSkeleton width={60} />}
						</span>
					</LabelledText>

					<LabelledText label={t("COMMON.TOTAL_BALANCE")}>
						<span className={labelClassname}>
							{isPlaceholder ? labelNotAvailable : <GroupSkeleton width={160} />}
						</span>
					</LabelledText>

					<LabelledText label={t("COMMON.TOTAL_CURRENCY")} className="hidden lg:flex">
						<span className={labelClassname}>
							{isPlaceholder ? labelNotAvailable : <GroupSkeleton width={130} />}
						</span>
					</LabelledText>
				</div>
			)}
		</AccordionHeaderSkeletonWrapper>
	);
};
