export interface HistoricalData {
	labels: string[];
	datasets: number[];
	min: number;
	max: number;
}

export interface HistoricalTransformer {
	transform(data: Record<string, any>, options: Record<string, any>): HistoricalData;
}

export interface HistoricalPriceOptions {
	token: string;
	currency: string;
	days: number;
	type: string;
	dateFormat: string;
}

export interface HistoricalVolumeOptions {
	token: string;
	currency: string;
	days: number;
	type: string;
	dateFormat: string;
}

export interface DailyAverageOptions {
	token: string;
	currency: string;
	timestamp: number;
}

export interface CurrentPriceOptions {
	token: string;
	currency: string;
}
