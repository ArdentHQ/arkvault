/**
 * Describes the structure of profile appearance settings.
 *
 * @export
 * @interface IProfileAppearance
 */
export interface IProfileAppearance {
	theme: string;
	useNetworkWalletNames: boolean;
}

/**
 * Defines the implementation contract for the appearance service.
 *
 * @export
 * @interface IAppearanceService
 */
export interface IAppearanceService {
	/**
	 * Get default values of appearance settings.
	 *
	 * @return {IProfileAppearance}
	 * @memberOf IAppearanceService
	 */
	defaults(): IProfileAppearance;

	/**
	 * Get all the appearance settings.
	 *
	 * @return {IProfileAppearance}
	 * @memberOf IAppearanceService
	 */
	all(): IProfileAppearance;

	/**
	 * Get the value of appearance setting by key.
	 *
	 * @param {keyof IProfileAppearance} key
	 * @return {IProfileAppearance[key]}
	 * @memberOf IAppearanceService
	 */
	get<T extends keyof IProfileAppearance>(key: T): IProfileAppearance[T];
}
