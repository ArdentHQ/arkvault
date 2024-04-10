import cn from "classnames";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/app/components//Icon";
import { ControlButton } from "@/app/components/ControlButton";
import { Dropdown } from "@/app/components/Dropdown";
import { PageHeader } from "@/app/components/Header";
import { HeaderSearchBar } from "@/app/components/Header/HeaderSearchBar";
import { FilterWallets } from "@/domains/dashboard/components/FilterWallets";
import { FilterOption, VotesFilter } from "@/domains/vote/components/VotesFilter";
import { Divider } from "@/app/components/Divider";
import { useBreakpoint } from "@/app/hooks";
import { selectDelegateValidatorTranslation } from "@/domains/wallet/utils/selectDelegateValidatorTranslation";

interface VotesHeaderProperties {
	profile: Contracts.IProfile;
	setSearchQuery: (query: string) => void;
	selectedAddress?: string;
	isFilterChanged: boolean;
	isSelectDelegateStep: boolean;
	filterProperties: any;
	totalCurrentVotes: number;
	selectedFilter?: FilterOption;
	setSelectedFilter?: (selected: FilterOption) => void;
	activeWallet?: Contracts.IReadWriteWallet;
}

export const VotesHeader = ({
	profile,
	setSearchQuery,
	selectedAddress,
	isFilterChanged,
	filterProperties,
	totalCurrentVotes,
	selectedFilter,
	setSelectedFilter,
	isSelectDelegateStep,
	activeWallet
}: VotesHeaderProperties) => {
	const { t } = useTranslation();

	const { isMdAndAbove } = useBreakpoint();

	const renderPlaceholder = () => {
		if (selectedAddress) {
			return selectDelegateValidatorTranslation({
				delegateStr: t("VOTE.VOTES_PAGE.SEARCH_DELEGATE_PLACEHOLDER"),
				network: activeWallet!.network(),
				validatorStr: t("VOTE.VOTES_PAGE.SEARCH_VALIDATOR_PLACEHOLDER"),
			})
		}

		return t("VOTE.VOTES_PAGE.SEARCH_WALLET_PLACEHOLDER");
	};

	const headerExtra = () => {
		if (profile.wallets().count()) {
			return (
				<div className="flex items-center text-theme-primary-200">
					<HeaderSearchBar
						offsetClassName="top-0 -mr-20 sm:-mx-10 md:top-1/2 md:-translate-y-1/2"
						placeholder={renderPlaceholder()}
						onSearch={setSearchQuery}
						onReset={() => setSearchQuery("")}
					/>

					<span className="mx-0.5 flex md:mx-3.5">
						<Divider type="vertical" size={isMdAndAbove ? "xl" : "md"} />
					</span>

					{selectedAddress && (
						<VotesFilter
							totalCurrentVotes={totalCurrentVotes}
							selectedOption={selectedFilter}
							onChange={setSelectedFilter}
						/>
					)}

					{!selectedAddress && (
						<div data-testid="Votes__FilterWallets">
							<Dropdown
								position="right"
								dropdownClass="mx-4 sm:mx-0"
								toggleContent={
									<ControlButton
										className={cn({ "-mr-2.5 px-2.5": !isMdAndAbove })}
										isChanged={isFilterChanged}
										noBorder={!isMdAndAbove}
									>
										<Icon name="SlidersVertical" size="lg" />
									</ControlButton>
								}
							>
								<div className="w-full px-10 py-7 sm:w-96 md:w-128">
									<FilterWallets {...filterProperties} />
								</div>
							</Dropdown>
						</div>
					)}
				</div>
			);
		}
	};

	const headerTitle = useMemo(() => {
		if (!isMdAndAbove && isSelectDelegateStep) {
			return t("VOTE.DELEGATE_TABLE.TITLE");
		}

		return t("VOTE.VOTES_PAGE.TITLE");
	}, [t, isMdAndAbove, isSelectDelegateStep]);

	return <PageHeader title={headerTitle} subtitle={t("VOTE.VOTES_PAGE.SUBTITLE")} extra={headerExtra()} border />;
};
