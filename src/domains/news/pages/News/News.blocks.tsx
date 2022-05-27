import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import { SvgCollection } from "@/app/assets/svg";
import { HeaderSearchBar } from "@/app/components/Header/HeaderSearchBar";
import { Dropdown } from "@/app/components/Dropdown/Dropdown";
import { NewsOptions } from "@/domains/news/components/NewsOptions";
import { Divider } from "@/app/components/Divider";
import { ControlButton } from "@/app/components/ControlButton";
import { Icon } from "@/app/components/Icon";
import { NewsHeaderFiltersProperties } from "@/domains/news/news.contracts";
import { useBreakpoint } from "@/app/hooks";

export const NewsSubtitle = () => {
	const { t } = useTranslation();

	return (
		<>
			<div className="mr-4 hidden font-semibold text-theme-secondary-text md:block">
				{t("NEWS.PAGE_NEWS.POWERED_BY")}
			</div>
			<SvgCollection.FTX width={65} height={20} className="text-theme-text" />
		</>
	);
};

export const NewsHeaderFilters = ({
	categories,
	coins,
	onFilterChange,
	onSearch,
	shouldResetFields,
}: NewsHeaderFiltersProperties) => {
	const { t } = useTranslation();

	const { isMdAndAbove } = useBreakpoint();

	return (
		<div className="flex items-center text-theme-primary-200">
			<HeaderSearchBar
				offsetClassName="top-0 sm:top-1/2 sm:-translate-y-1/2"
				label={t("COMMON.SEARCH")}
				onSearch={onSearch}
				resetFields={shouldResetFields}
				maxLength={32}
			/>

			<div className="flex items-center xl:hidden">
				<span className="mx-0.5 flex md:mx-3.5">
					<Divider type="vertical" size={isMdAndAbove ? "xl" : "md"} />
				</span>

				<Dropdown
					dropdownClass="mx-4 sm:mx-0"
					toggleContent={
						<ControlButton className={cn({ "-mr-2.5 px-2.5": !isMdAndAbove })} noBorder={!isMdAndAbove}>
							<Icon name="SlidersVertical" size="lg" />
						</ControlButton>
					}
				>
					<div className="w-full sm:w-96">
						<NewsOptions selectedCategories={categories} selectedCoins={coins} onSubmit={onFilterChange} />
					</div>
				</Dropdown>
			</div>
		</div>
	);
};
