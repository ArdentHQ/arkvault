import { IProfileInput } from "./contracts.js";

export interface IProfileDumper {
	/**
	 * Dumps the profile into a standardised object.
	 *
	 * @return {IProfileInput}
	 * @memberof ProfileDumper
	 */
	dump(): IProfileInput;
}
