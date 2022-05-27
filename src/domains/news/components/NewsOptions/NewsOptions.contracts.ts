import { AvailableNewsCategories, NewsFilters } from "@/domains/news/news.contracts";

interface Option {
	name: AvailableNewsCategories;
	isSelected: boolean;
}

interface NewsOptionsProperties {
	selectedCategories: AvailableNewsCategories[];
	selectedCoins: string[];
	onSubmit: (data: NewsFilters) => void;
}

export type { NewsOptionsProperties, Option };
