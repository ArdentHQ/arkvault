import { Networks } from "@payvo/sdk";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { SelectCategory } from "./components/SelectCategory";
import { NewsOptionsProperties, Option } from "./NewsOptions.contracts";
import { Divider } from "@/app/components/Divider";
import { FilterNetwork } from "@/app/components/FilterNetwork";
import { useEnvironmentContext } from "@/app/contexts";
import { toasts } from "@/app/services";
import { AVAILABLE_CATEGORIES } from "@/domains/news/news.constants";
import { AvailableNewsCategories } from "@/domains/news/news.contracts";

// region for scrollable sidebar on small screen
const HEADER_HEIGHT = 84;
const VERTICAL_PADDING = 20 + 32;
// endregion

export const NewsOptions: React.VFC<NewsOptionsProperties> = ({ selectedCategories, selectedCoins, onSubmit }) => {
	const { env } = useEnvironmentContext();

	const { t } = useTranslation();

	const [categories, setCategories] = useState<Option[]>(
		AVAILABLE_CATEGORIES.map((name) => ({
			isSelected: selectedCategories.length === 0 || selectedCategories.includes(name),
			name,
		})),
	);

	const [coinOptions, setCoinOptions] = useState(() => {
		const coins: Record<string, { network: Networks.Network; isSelected: boolean }> = {};

		for (const network of env.availableNetworks()) {
			const coin = network.coin();

			if (!coins[coin]) {
				coins[coin] = {
					isSelected: selectedCoins.includes(coin),
					network,
				};
			}
		}

		return Object.values(coins);
	});

	const showSelectAllCategories = useMemo(
		() => categories.some((option: Option) => !option.isSelected),
		[categories],
	);

	const handleSelectCategory = (name: string) => {
		const selected = categories.filter((category: Option) => category.isSelected);

		if (selected.length === 1 && selected[0].name === name) {
			return toasts.warning(t("NEWS.NEWS_OPTIONS.CATEGORY_WARNING"));
		}

		setCategories(
			categories.map((category: Option) =>
				category.name === name
					? {
							...category,
							isSelected: !category.isSelected,
					  }
					: category,
			),
		);
	};

	const handleSelectAllCategories = () => {
		setCategories(
			categories.map((category: Option) => ({
				...category,
				isSelected: true,
			})),
		);
	};

	const handleQueryUpdate = useCallback(() => {
		const categoryNames: AvailableNewsCategories[] = [];

		for (const category of categories) {
			if (category.name !== "All" && category.isSelected) {
				categoryNames.push(category.name);
			}
		}

		const coinNames: string[] = [];

		for (const option of coinOptions) {
			if (option.isSelected) {
				coinNames.push(option.network.coin());
			}
		}

		onSubmit({
			categories: categoryNames,
			coins: coinNames,
		});
	}, [onSubmit, categories, coinOptions]);

	useEffect(() => {
		handleQueryUpdate();
	}, [handleQueryUpdate]);

	return (
		<div data-testid="NewsOptions" className="px-10 pt-7 pb-2">
			<div className="flex flex-col space-y-8">
				<div className="flex flex-col space-y-3">
					<div className="flex items-center justify-between">
						<h5 className="font-semibold">{t("COMMON.CATEGORY")}</h5>
						{showSelectAllCategories && (
							<button
								onClick={handleSelectAllCategories}
								className="-my-px border-b border-t border-dashed border-b-current border-t-transparent text-sm font-semibold text-theme-primary-600 transition-colors hover:border-b-transparent hover:text-theme-primary-700 focus:outline-none active:text-theme-primary-400"
							>
								{t("COMMON.SELECT_ALL")}
							</button>
						)}
					</div>

					<p className="text-sm text-theme-secondary-500">{t("NEWS.NEWS_OPTIONS.SELECT_YOUR_CATEGORIES")}</p>

					<div className="-mx-1 flex flex-wrap">
						{categories.map((category, index) => (
							<SelectCategory
								data-testid={`NewsOptions__category-${category.name}`}
								key={index}
								className="p-1"
								checked={category.isSelected}
								onChange={() => handleSelectCategory(category.name)}
							>
								#{t(`NEWS.CATEGORIES.${category.name.toUpperCase()}`)}
							</SelectCategory>
						))}
					</div>
				</div>

				<Divider dashed />

				<div className="flex flex-col space-y-3">
					<h5 className="font-semibold">{t("NEWS.NEWS_OPTIONS.FILTER_ASSETS")}</h5>
					<p className="text-sm text-theme-secondary-500">
						{t("NEWS.NEWS_OPTIONS.YOUR_CURRENT_SELECTIONS")}:
					</p>

					<FilterNetwork
						options={coinOptions}
						hideViewAll
						onChange={(_, networks) => setCoinOptions(networks)}
					/>
				</div>
			</div>
		</div>
	);
};

export const NewsOptionsSticky = ({ children }) => (
	<div
		data-testid="NewsOptionsSticky"
		className="sticky top-26"
		style={{ height: `calc(100vh - (${HEADER_HEIGHT}px + ${VERTICAL_PADDING}px))` }}
	>
		<div className="max-h-full overflow-y-auto rounded-lg border-2 border-theme-primary-100 bg-theme-background dark:border-theme-secondary-800">
			{children}
		</div>
	</div>
);
