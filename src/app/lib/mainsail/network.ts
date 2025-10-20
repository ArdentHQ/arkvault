import { get } from "@/app/lib/helpers";
import { randomHost } from "./helpers/hosts";
import {
	CoinManifest,
	ExpirationType,
	NetworkManifest,
	NetworkManifestImportMethods,
	NetworkManifestToken,
	VotingMethod,
} from "./network.models";
import { ConfigKey, ConfigRepository } from ".";
import { ArkClient } from "@arkecosystem/typescript-client";
import { FeeService } from "./fee.service";
import { Contracts } from "@/app/lib/profiles";

export class Network {
	/**
	 * The coin of the network.
	 *
	 * @memberof Network
	 */
	readonly #coin: CoinManifest;

	/**
	 * The profile associated with fees config.
	 *
	 * @memberof Network
	 */
	readonly #profile: Contracts.IProfile;

	/**
	 * The fee service instance.
	 *
	 * @memberof Network
	 */
	readonly #feeService: FeeService;

	/**
	 * The manifest of the network.
	 *
	 * @memberof Network
	 */
	readonly #network: NetworkManifest;

	/**
	 * The config of the network.
	 *
	 * @memberof Network
	 */
	readonly #config: ConfigRepository;

	/**
	 * Create a new Network instance.
	 *
	 * @param {string} coin
	 * @param {NetworkManifest} network
	 * @memberof Network
	 */
	public constructor(coin: CoinManifest, network: NetworkManifest, profile: Contracts.IProfile) {
		this.#coin = coin;
		this.#network = network;
		this.#profile = profile;
		this.#config = new ConfigRepository({ network });
		this.#feeService = new FeeService({ config: this.#config, profile: this.#profile });
	}

	/**
	 * Get the parent coin of the network.
	 */
	public coin(): string {
		return this.#coin.name;
	}

	/**
	 * Get the coin of the network.
	 */
	public coinName(): string {
		return this.#network.coin;
	}

	/**
	 * Get the ID of the network.
	 */
	public id(): string {
		return this.#network.id;
	}

	/**
	 * Get the name of the network.
	 */
	public name(): string {
		return this.#network.name;
	}

	/**
	 * Get the display name of the network.
	 */
	public displayName(): string {
		if (this.isLive()) {
			return this.coinName();
		}

		return `${this.coinName()} ${this.name()}`;
	}

	/**
	 * Get the explorer URL of the coin that is used.
	 */
	public explorer(): string {
		return randomHost(this.#network.hosts, "explorer").host;
	}

	/**
	 * Get the ticker of the coin that is used.
	 */
	public ticker(): string {
		return this.#network.currency.ticker;
	}

	/**
	 * Get the symbol of the coin that is used.
	 */
	public symbol(): string {
		return this.#network.currency.symbol;
	}

	/**
	 * Determine if this is a production network.
	 */
	public isLive(): boolean {
		return this.#network.type === "live";
	}

	/**
	 * Determine if this is a development network.
	 */
	public isTest(): boolean {
		return this.#network.type === "test";
	}

	/**
	 * Get the expiration method type.
	 */
	public expirationType(): ExpirationType {
		return this.#network.transactions.expirationType;
	}

	/**
	 * Determine if voting is supported on this network.
	 */
	public allowsVoting(): boolean {
		return get(this.#network, "governance") !== undefined;
	}

	/**
	 * Get the method of voting.
	 */
	public votingMethod(): VotingMethod {
		return get(this.#network, "governance.method", "simple");
	}

	/**
	 * Get the number of delegates that forge blocks.
	 */
	public validatorCount(): number {
		return get(this.#network, "governance.validatorCount", 0);
	}

	/**
	 * Get the property by which validators are identified for voting.
	 */
	public validatorIdentifier(): string {
		return get(this.#network, "governance.validatorIdentifier", "publicKey");
	}

	/**
	 * Get the maximum number of votes per wallet.
	 */
	public maximumVotesPerWallet(): number {
		return get(this.#network, "governance.votesPerWallet", 0);
	}

	/**
	 * Get the maximum number of votes per transaction.
	 */
	public maximumVotesPerTransaction(): number {
		return get(this.#network, "governance.votesPerTransaction", 0);
	}

	/**
	 * Get the step amount per vote. For example 10 for steps of 10/20/30.
	 */
	public votesAmountStep(): number {
		return get(this.#network, "governance.votesAmountStep", 0);
	}

	/**
	 * Get the minimum vote amount required.
	 */
	public votesAmountMinimum(): number {
		return get(this.#network, "governance.votesAmountMinimum", 0);
	}

	/**
	 * Get the maximum vote amount allowed.
	 */
	public votesAmountMaximum(): number {
		return get(this.#network, "governance.votesAmountMaximum", 0);
	}

	/**
	 * Determine if the network uses an extended public key for derivation.
	 */
	public usesExtendedPublicKey(): boolean {
		return get(this.#network, "meta.extendedPublicKey") === true;
	}

	/**
	 * Determine if the given feature is enabled.
	 *
	 * @param feature
	 */
	public allows(feature: string): boolean {
		if (!feature) {
			return false;
		}

		const [root, ...child] = feature.split(".");

		const features: string[] = get(this.#network.featureFlags, root);

		if (Array.isArray(features)) {
			return features.includes(child.join("."));
		}

		return false;
	}

	/**
	 * Determine if the given feature is disabled.
	 *
	 * @param feature
	 */
	public denies(feature: string): boolean {
		return !this.allows(feature);
	}

	/**
	 * Determines if the network charges zero fees.
	 *
	 * @return {*}  {boolean}
	 * @memberof Network
	 */
	public chargesZeroFees(): boolean {
		return get(this.#network, "fees.type") === "free";
	}

	/**
	 * Returns the available import methods for the network.
	 *
	 * @return {*}  {NetworkManifestImportMethods}
	 * @memberof Network
	 */
	public importMethods(): NetworkManifestImportMethods {
		return this.#network.importMethods;
	}

	/**
	 * Returns the meta data of the network.
	 *
	 * @return {*}  {Record<string, any>}
	 * @memberof Network
	 */
	public meta(): Record<string, any> {
		return get(this.#network, "meta", {});
	}

	/**
	 * Determine sif the network uses memos to store additional data.
	 *
	 * @return {*}  {boolean}
	 * @memberof Network
	 */
	public usesMemo(): boolean {
		return get(this.#network, "transactions.memo", false);
	}

	/**
	 * Determines if the network uses UTXO.
	 *
	 * @return {*}  {boolean}
	 * @memberof Network
	 */
	public usesUTXO(): boolean {
		return get(this.#network, "transactions.utxo", false);
	}

	/**
	 * Determines if the network uses locked balances.
	 *
	 * @return {*}  {boolean}
	 * @memberof Network
	 */
	public usesLockedBalance(): boolean {
		return get(this.#network, "transactions.lockedBalance", false);
	}

	/**
	 * Returns the number of recipients per multi payment transaction.
	 *
	 * @return {*}  {number}
	 * @memberof Network
	 */
	public multiPaymentRecipients(): number {
		return get(this.#network, "transactions.multiPaymentRecipients", 0);
	}

	/**
	 * Returns the number of words for newly generated BIP39 phrases.
	 *
	 * @return {*}  {number}
	 * @memberof Network
	 */
	public wordCount(): number {
		return get(this.#network, "constants.bip39.wordCount", 24);
	}

	/**
	 * Returns the list of available tokens, like ERC20 or TRC20.
	 *
	 * @return {*}  {NetworkManifestToken[]}
	 * @memberof Network
	 */
	public tokens(): NetworkManifestToken[] {
		return get(this.#network, "tokens", []);
	}

	/**
	 * Return the object representation of the network.
	 *
	 * @memberof Network
	 * @returns {NetworkManifest}
	 */
	public toObject(): NetworkManifest {
		return this.#network;
	}

	/**
	 * Return the JSON representation of the network.
	 *
	 * @memberof Network
	 * @returns {string}
	 */
	public toJson(): string {
		return JSON.stringify(this.toObject());
	}

	/**
	 * Determines if Ledger transactions are supported in network.
	 *
	 * @memberof Network
	 * @returns {boolean}
	 */
	public allowsLedger(): boolean {
		return get(this.#network, "featureFlags.Ledger", []).length > 0;
	}

	/**
	 * Returns the config repository of the network.
	 *
	 * @memberof Network
	 * @returns {ConfigRepository}
	 */
	public config(): ConfigRepository {
		return this.#config;
	}

	/**
	 * Updates block number & crypto config from network.
	 *
	 * @memberof Network
	 * @returns {Promise<void>}
	 */
	public async sync(): Promise<void> {
		const host = this.#network.hosts.find((host) => host.type === "full");

		if (!host) {
			throw new Error(`Expected network host to be a url but received ${typeof host}`);
		}

		const client = new ArkClient(host.host);
		const [crypto, status] = await Promise.all([client.node().crypto(), client.node().syncing()]);

		const dataCrypto = crypto.data;
		const { blockNumber } = status.data;

		this.config().set("height", blockNumber);
		this.config().set("crypto", dataCrypto);
	}

	/**
	 * Determines if the network is synced.
	 *
	 * @returns {boolean}
	 * @memberof Network
	 */
	public isSynced(): boolean {
		return this.config().has("height") && this.config().has("crypto");
	}

	/**
	 * Determines wether the url belongs to the network.
	 *
	 * @returns {Promise<boolean>}
	 * @memberof Network
	 */
	public async evaluateUrl(host: string): Promise<boolean> {
		const client = new ArkClient(host);
		const { data } = await client.node().crypto();
		return data.network.client.token === this.config().get(ConfigKey.CurrencyTicker);
	}

	public milestone(height?: number): { [key: string]: any } {
		const currentHeight = this.config().get("height") as number;
		const crypto = this.config().get("crypto") as Record<string, any>;

		const milestones = crypto.milestones.sort((a, b) => a.height - b.height);
		const milestone = {
			data: milestones[0],
			index: 0,
		};

		if (!milestone || !milestones) {
			throw new Error("Milestone not found.");
		}

		if (!height && currentHeight) {
			height = currentHeight;
		}

		if (!height) {
			height = 1;
		}

		while (milestone.index < milestones.length - 1 && height >= milestones[milestone.index + 1].height) {
			milestone.index++;
			milestone.data = milestones[milestone.index];
		}

		while (height < milestones[milestone.index].height) {
			milestone.index--;
			milestone.data = milestones[milestone.index];
		}

		return milestone.data;
	}
	/**
	 * Returns the fee service of the network.
	 *
	 * @returns {FeeService}
	 * @memberof Network
	 */
	fees(): FeeService {
		return this.#feeService;
	}

	/**
	 * Returns the block time.
	 *
	 * @returns {number}
	 * @memberof Network
	 */
	blockTime(): number {
		return get(this.milestone(), "timeouts.blockTime");
	}
}
