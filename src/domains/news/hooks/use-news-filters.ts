import { useCallback, useEffect, useState } from "react";
import { Blockfolio as FTX, BlockfolioResponse as FTXResponse, BlockfolioSignal as FTXSignal } from "@payvo/sdk-news";
import { Contracts } from "@payvo/sdk-profiles";
import { useTranslation } from "react-i18next";
import { NewsFilters, NewsQuery } from "@/domains/news/news.contracts";
import { AVAILABLE_CATEGORIES } from "@/domains/news/news.constants";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { httpClient, toasts } from "@/app/services";

export const useNewsFilters = () => {
	const profile = useActiveProfile();
	const { persist } = useEnvironmentContext();
	const { t } = useTranslation();

	const [isLoading, setIsLoading] = useState(true);
	const [ftx] = useState(() => new FTX(httpClient));

	const [totalCount, setTotalCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);

	const [searchQuery, setSearchQuery] = useState("");

	const [{ categories, coins }, setFilters] = useState<NewsFilters>(() => {
		let initialFilters: NewsFilters;

		try {
			initialFilters = JSON.parse(profile.settings().get(Contracts.ProfileSetting.NewsFilters)!);
		} catch {
			initialFilters = { categories: [], coins: ["ARK"] };
		}

		return initialFilters;
	});

	const [news, setNews] = useState<FTXSignal[]>([]);

	useEffect(() => window.scrollTo({ behavior: "smooth", top: 0 }), [currentPage, coins]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const fetchNews = async () => {
			setIsLoading(true);
			setNews([]);

			if (categories.length > 0 && coins.length > 0) {
				const query: NewsQuery = {
					coins,
					page: currentPage,
				};

				if (categories.length > 0 && categories.length !== AVAILABLE_CATEGORIES.length) {
					query.categories = categories;
				}

				if (searchQuery) {
					query.query = searchQuery;
				}

				try {
					const { data, meta }: FTXResponse = await ftx.findByCoin(query);

					setNews(data);
					setTotalCount(meta.total);
				} catch {
					toasts.error(t("NEWS.PAGE_NEWS.ERRORS.NETWORK_ERROR"));
				}
			}

			setIsLoading(false);
		};

		fetchNews();
	}, [ftx, currentPage, categories, coins, searchQuery, t]);

	useEffect(() => {
		const updateSettings = async () => {
			profile.settings().set(Contracts.ProfileSetting.NewsFilters, JSON.stringify({ categories, coins }));
			await persist();
		};

		updateSettings();
	}, [profile, categories, coins, persist]);

	const handleSelectPage = useCallback((page: number) => setCurrentPage(page), []);

	const handleFilterSubmit = useCallback((data: NewsFilters) => {
		setCurrentPage(1);
		setFilters(data);
	}, []);

	return {
		categories,
		coins,
		currentPage,
		handleFilterSubmit,
		handleSelectPage,
		isLoading,
		news,
		searchQuery,
		setSearchQuery,
		totalCount,
	};
};
