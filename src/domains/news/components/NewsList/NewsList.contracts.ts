import { BlockfolioSignal as FTXSignal } from "@payvo/sdk-news";

interface NewsListProperties {
	isLoading: boolean;
	news: FTXSignal[];
	totalCount: number;
	itemsPerPage: number;
	currentPage: number;
	onSelectPage: (page: number) => void;
}

export type { NewsListProperties };
