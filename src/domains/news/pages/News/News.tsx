import React from "react";
import { useTranslation } from "react-i18next";
import { NewsSubtitle, NewsHeaderFilters } from "./News.blocks";
import { PageHeader } from "@/app/components/Header";
import { Page } from "@/app/components/Layout";
import { NewsList } from "@/domains/news/components/NewsList";
import { NewsOptions, NewsOptionsSticky } from "@/domains/news/components/NewsOptions";
import { useNewsFilters } from "@/domains/news/hooks/use-news-filters";

const ITEMS_PER_PAGE = 15;

export const News: React.FC = () => {
	const { t } = useTranslation();

	const {
		isLoading,
		totalCount,
		news,
		currentPage,
		categories,
		handleSelectPage,
		handleFilterSubmit,
		setSearchQuery,
		searchQuery,
	} = useNewsFilters();

	return (
		<Page pageTitle={t("NEWS.PAGE_NEWS.TITLE")} isBackDisabled>
			<div className="flex w-full bg-theme-secondary-background md:bg-theme-background">
				<PageHeader
					title={t("NEWS.PAGE_NEWS.TITLE")}
					subtitle={<NewsSubtitle />}
					extra={
						<NewsHeaderFilters
							categories={categories}
							onSearch={(query) => setSearchQuery(query)}
							shouldResetFields={searchQuery === ""}
							onFilterChange={handleFilterSubmit}
						/>
					}
				/>
			</div>

			<div className="flex-1 bg-theme-background pb-8 md:bg-theme-secondary-background md:py-8">
				<div className="sm:mx-auto md:px-10 lg:container">
					<div className="lg:container xl:flex xl:space-x-8">
						<div className="mb-12 sm:mb-0 xl:w-2/3 xl:flex-none">
							<NewsList
								isLoading={isLoading}
								news={news}
								totalCount={totalCount}
								itemsPerPage={ITEMS_PER_PAGE}
								currentPage={currentPage}
								onSelectPage={handleSelectPage}
							/>
						</div>

						<div className="relative hidden xl:block xl:w-1/3">
							<NewsOptionsSticky>
								<NewsOptions selectedCategories={categories} onSubmit={handleFilterSubmit} />
							</NewsOptionsSticky>
						</div>
					</div>
				</div>
			</div>
		</Page>
	);
};
