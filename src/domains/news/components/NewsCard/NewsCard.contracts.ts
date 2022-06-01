import { BlockfolioSignal as FTXSignal } from "@payvo/sdk-news";

export type NewsCardProperties = {
	coverImage?: string;
} & FTXSignal;
