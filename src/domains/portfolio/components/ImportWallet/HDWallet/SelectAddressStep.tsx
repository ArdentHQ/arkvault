import { Networks } from "@/app/lib/mainsail";
import { Contracts as ProfilesContracts } from "@/app/lib/profiles";
import Tippy from "@tippyjs/react";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { Column } from "react-table";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Checkbox } from "@/app/components/Checkbox";
import { Skeleton } from "@/app/components/Skeleton";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { Button } from "@/app/components/Button";
import cn from "classnames";
import {
	AddressData,
	AddressTableProperties,
} from "@/domains/portfolio/components/ImportWallet/HDWallet/HDWalletsTabs.contracts";
import {
	AmountWrapper,
	AddressTableLoaderOverlay,
	AddressMobileItem,
} from "@/domains/portfolio/components/ImportWallet/Ledger/LedgerScanStep.blocks";
import { BIP44CoinType } from "@/app/lib/profiles/wallet.factory.contract";
import { WalletData } from "@/app/lib/profiles/wallet.enum";

export const ADDRESSES_PER_BATCH = 5;

export const AddressesTable: FC<AddressTableProperties> = ({
	network,
	wallets,
	selectedWallets,
	toggleSelect,
	toggleSelectAll,
	isLoading,
	isSelected,
	loadMore,
	addressesPerPage = ADDRESSES_PER_BATCH,
}) => {
	const { t } = useTranslation();

	const isAllSelected = !isLoading && wallets.length > 0 && selectedWallets.length === wallets.length;

	const columns = useMemo<Column<AddressData>[]>(
		() => [
			{
				Header: (
					<Tippy content={isAllSelected ? t("COMMON.UNSELECT_ALL") : t("COMMON.SELECT_ALL")}>
						<Checkbox
							disabled={isLoading}
							data-testid="SelectAddressStep__select-all"
							onChange={() => toggleSelectAll()}
							checked={isAllSelected}
						/>
					</Tippy>
				),
				className: "justify-center",
				id: "select",
				minimumWidth: true,
			},
			{
				Header: t("COMMON.ADDRESS"),
				accessor: "address",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.BALANCE"),
				accessor: "balance",
				className: "justify-end",
				headerClassName: "no-border",
			},
		],
		[t, isAllSelected, isLoading, toggleSelectAll],
	);

	/* istanbul ignore next -- @preserve */
	const showSkeleton = isLoading;

	const data = useMemo(() => {
		const skeletonRows = Array.from<AddressData>({ length: addressesPerPage }).fill({} as AddressData);
		return showSkeleton ? skeletonRows : wallets;
	}, [wallets, showSkeleton]);

	const renderTableRow = useCallback(
		(wallet: AddressData) => {
			if (showSkeleton) {
				return (
					<TableRow className="relative">
						<TableCell variant="start">
							<Skeleton height={20} width={20} />
						</TableCell>

						<TableCell className="w-2/5" innerClassName="space-x-4">
							<Skeleton circle height={20} width={20} />
							<Skeleton height={16} width={120} />
						</TableCell>

						<TableCell variant="end" innerClassName="justify-end">
							<AmountWrapper isLoading={true} />
						</TableCell>
					</TableRow>
				);
			}

			return (
				<TableRow isSelected={isSelected(wallet)} className="relative">
					<TableCell variant="start" innerClassName="justify-center">
						<Checkbox
							checked={isSelected(wallet)}
							onChange={() => toggleSelect(wallet)}
							data-testid="SelectAddressStep__checkbox-row"
						/>
					</TableCell>

					<TableCell className="w-2/5" innerClassName="space-x-4">
						<div className="flex w-32 flex-1">
							<Address address={wallet.address} showCopyButton />
						</div>
						<span className="hidden">{wallet.path}</span>
					</TableCell>

					<TableCell variant="end" innerClassName="justify-end font-semibold">
						<AmountWrapper isLoading={false}>
							<Amount value={wallet.balance!} ticker={network.ticker()} />
						</AmountWrapper>
					</TableCell>
				</TableRow>
			);
		},
		[toggleSelect, showSkeleton, isSelected, network],
	);

	return (
		<div>
			<div className="md:border-theme-secondary-300 dark:md:border-theme-secondary-800 dim:md:border-theme-dim-700 relative hidden rounded-xl border border-transparent sm:block">
				<div>
					<Table columns={columns} data={data} className="with-x-padding">
						{renderTableRow}
					</Table>
				</div>

				{!showSkeleton && (
					<div className="flex flex-col gap-3 px-6 pb-4">
						<Button
							data-testid="SelectAddressStep__load-more"
							variant="secondary"
							icon="Plus"
							iconPosition="left"
							className="w-full"
							onClick={loadMore}
						>
							<span className="pl-1">
								<Trans i18nKey="WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SELECT_ADDRESS_STEP.LOAD_MORE_ADDRESSES" />
							</span>
						</Button>
					</div>
				)}

				{isLoading && (
					<AddressTableLoaderOverlay className="rounded-xl">
						<Trans i18nKey="WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SELECT_ADDRESS_STEP.LOADING_ADDRESSES" />
					</AddressTableLoaderOverlay>
				)}
			</div>

			<div className="sm:hidden">
				<div className="border-l-theme-primary-400 bg-theme-primary-100 dark:border-l-theme-primary-300 dark:bg-theme-secondary-800 dim:border-l-theme-dim-navy-400 dim:bg-theme-dim-950 mb-3 flex h-9 w-full flex-row items-center justify-between border-l-2 px-3">
					<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-base font-semibold">
						{t("COMMON.ADDRESS")}
					</span>
					<label
						className={cn("flex flex-row items-center gap-2", {
							"text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-700": isLoading,
							"text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-500": !isLoading,
						})}
					>
						<Checkbox
							disabled={isLoading}
							data-testid="SelectAddressStep__select-all-mobile"
							onChange={() => toggleSelectAll()}
							checked={isAllSelected}
						/>
						<span>{t("COMMON.SELECT_ALL")}</span>
					</label>
				</div>

				<div className="flex flex-col gap-2 px-1">
					{!showSkeleton &&
						data.map((wallet) => (
							<AddressMobileItem
								key={wallet.path}
								isLoading={showSkeleton}
								address={wallet.address}
								balance={wallet.balance}
								coin={network.ticker()}
								handleClick={() => toggleSelect(wallet)}
								isSelected={isSelected(wallet)}
							/>
						))}

					{showSkeleton &&
						Array.from({ length: 4 }).map((_, index) => (
							<AddressMobileItem
								index={index}
								key={index}
								isLoading
								address=""
								coin=""
								handleClick={() => {}}
								isSelected={false}
							/>
						))}

					<Button
						data-testid="SelectAddressStep__scan-more-mobile"
						variant="secondary"
						icon="Plus"
						iconPosition="left"
						className="w-full"
						onClick={loadMore}
					>
						<span className="pl-1">
							<Trans i18nKey="WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SELECT_ADDRESS_STEP.LOAD_MORE_ADDRESSES" />
						</span>
					</Button>
				</div>
			</div>
		</div>
	);
};

export const SelectAddressStep = ({
	network,
	profile,
	addressesPerPage = ADDRESSES_PER_BATCH,
}: {
	addressesPerPage?: number;
	network: Networks.Network;
	profile: ProfilesContracts.IProfile;
}) => {
	const { getValues, setValue, register, unregister } = useFormContext();

	const mnemonic = getValues("mnemonic") as string;

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [addresses, setAddresses] = useState<AddressData[]>([]);
	const [selectedAddresses, setSelectedAddresses] = useState<AddressData[]>([]);
	const [lastAddressIndex, setLastAddressIndex] = useState<number>(0);

	const isSelected = (address: AddressData) => selectedAddresses.some((a) => a.path === address.path);

	const toggleSelect = (address: AddressData) => {
		if (isSelected(address)) {
			setSelectedAddresses(selectedAddresses.filter((a) => a.path !== address.path));
		} else {
			setSelectedAddresses([...selectedAddresses, address]);
		}
	};

	const toggleSelectAll = () => {
		if (addresses.length > selectedAddresses.length || selectedAddresses.length === 0) {
			setSelectedAddresses([...addresses]);
		} else {
			setSelectedAddresses([]);
		}
	};

	const generateWallet = async (index: number) => {
		const levels = {
			account: 0,
			addressIndex: index,
			change: 0,
		};

		const wallet = await profile.walletFactory().fromMnemonicWithBIP44({
			coin: BIP44CoinType.ARK,
			levels,
			mnemonic,
		});

		await wallet.synchroniser().identity();

		return { levels, wallet };
	};

	const load = async (startIndex: number = 0, skipEmptyAddresses: boolean = false) => {
		setIsLoading(true);

		const promises = Array.from({ length: addressesPerPage }, (_, index) => generateWallet(index + startIndex));
		const results = await Promise.all(promises);

		let newAddresses: AddressData[] = results.map(({ wallet, levels }) => ({
			address: wallet.address(),
			balance: wallet.balance(),
			levels,
			path: wallet.data().get(WalletData.DerivationPath) as string,
		}));

		if (skipEmptyAddresses) {
			const allAddressesEmpty = newAddresses.every((address) => address.balance === 0);

			if (allAddressesEmpty) {
				newAddresses = newAddresses.slice(0, 1);
			}
		}

		setLastAddressIndex((prevAddressIndex) => prevAddressIndex + newAddresses.length);

		setIsLoading(false);
		setAddresses((previousAddresses) => [...previousAddresses, ...newAddresses]);

		return newAddresses;
	};

	useEffect(() => {
		register("selectedAddresses", {
			required: true,
			validate: (value) => Array.isArray(value) && value.length > 0,
		});

		return () => {
			unregister("selectedAddresses");
		};
	}, [register, unregister]);

	useEffect(() => {
		setValue("selectedAddresses", selectedAddresses, { shouldDirty: true, shouldValidate: true });
	}, [selectedAddresses, setValue]);

	useEffect(() => {
		void load(lastAddressIndex, true);
	}, []);

	return (
		<section data-testid="SelectAddressStep" className="space-y-4">
			<AddressesTable
				addressesPerPage={addressesPerPage}
				network={network}
				wallets={addresses}
				isSelected={isSelected}
				selectedWallets={selectedAddresses}
				toggleSelect={toggleSelect}
				isLoading={isLoading}
				toggleSelectAll={toggleSelectAll}
				loadMore={() => {
					void load(lastAddressIndex, false);
				}}
			/>
		</section>
	);
};
