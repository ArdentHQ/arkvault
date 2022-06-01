import { AVAILABLE_CATEGORIES } from "./news.constants";

interface NewsFilters {
	categories: AvailableNewsCategories[];
	searchQuery?: string;
}

interface NewsQuery {
	categories?: string[];
	coins: string[];
	page?: number;
	query?: string;
}

export interface NewsHeaderFiltersProperties {
	categories: AvailableNewsCategories[];
	shouldResetFields: boolean;
	onSearch?: (query: string) => void;
	onFilterChange: (filters: NewsFilters) => void;
}

export type AvailableNewsCategories = typeof AVAILABLE_CATEGORIES[number] | "All";

export type { NewsFilters, NewsQuery };
