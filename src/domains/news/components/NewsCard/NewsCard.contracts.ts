import { BlockfolioSignal as FTXSignal } from "@ardenthq/sdk-news";

export type NewsCardProperties = {
	coverImage?: string;
} & FTXSignal;
