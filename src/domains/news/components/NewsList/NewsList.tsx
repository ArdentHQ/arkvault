import React from "react";
import { useTranslation } from "react-i18next";

import { NewsListProperties } from "./NewsList.contracts";
import { EmptyResults } from "@/app/components/EmptyResults";
import { Pagination } from "@/app/components/Pagination";
import { FTXAd } from "@/domains/news/components/FTXAd";
import { NewsCard, NewsCardSkeleton } from "@/domains/news/components/NewsCard";

const NewsList: React.VFC<NewsListProperties> = ({
	isLoading,
	news,
	totalCount,
	itemsPerPage,
	currentPage,
	onSelectPage,
}) => {
	const { t } = useTranslation();

	const skeletonCards = Array.from({ length: 8 }).fill({});

	if (isLoading) {
		return (
			<div className="md:space-y-5">
				{skeletonCards.map((_, key: number) => (
					<NewsCardSkeleton key={key} />
				))}
			</div>
		);
	}

	if (news.length === 0) {
		return (
			<EmptyResults
				className="my-6 mx-8 flex flex-col items-center rounded-lg border-theme-primary-100 dark:border-theme-secondary-800 md:m-0 md:border-2 lg:p-10"
				title={t("COMMON.EMPTY_RESULTS.TITLE")}
				subtitle={t("COMMON.EMPTY_RESULTS.SUBTITLE")}
			/>
		);
	}

	return (
		<>
			<div className="md:space-y-5">
				{news.map((data) => (
					<NewsCard key={data.id} {...data} />
				))}

				<FTXAd />
			</div>

			<div className="mt-8 flex w-full justify-center">
				<Pagination
					totalCount={totalCount}
					itemsPerPage={itemsPerPage}
					onSelectPage={onSelectPage}
					currentPage={currentPage}
				/>
			</div>
		</>
	);
};

export { NewsList };
