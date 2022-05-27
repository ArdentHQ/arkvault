import { TIME_PERIODS } from "./TimeAgo.constants";

export interface DateDifferenceReturnValue {
	count?: number;
	key: Uppercase<typeof TIME_PERIODS[number]> | "FEW_SECONDS";
}
