import React from "react";
import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { LedgerData } from "@/app/contexts/Ledger";
import { assertWallet } from "@/utils/assertions";
import { useBreakpoint } from "@/app/hooks";
import { AmountWrapper } from "./LedgerScanStep.blocks";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { MobileSection } from "@/app/components/Table/Mobile/MobileSection";

export const SectionHeaderMobile = ({ title }: { title: string }) => (
	<div
		className="flex h-9 w-full flex-row items-center justify-between border-l-2 border-l-theme-primary-400 bg-theme-primary-100 px-3 dark:border-l-theme-primary-300 dark:bg-theme-secondary-800"
		data-testid="SectionHeaderMobile__wrapper"
	>
		<span className="text-base font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">{title}</span>
	</div>
);

export const SectionBodyItem = ({ title, children }: { title: string; children: React.ReactNode }) => (
	<div
		className="flex w-full flex-row items-center justify-between text-sm font-semibold sm:justify-start sm:gap-3 sm:text-base"
		data-testid="SectionBodyItem__wrapper"
	>
		<span className="text-theme-secondary-700 dark:text-theme-secondary-500 sm:w-[90px]">{title}</span>
		<div className="text-theme-secondary-900 dark:text-theme-secondary-200 sm:w-full">{children}</div>
	</div>
);

const EditButton = ({ onClick }: { onClick: () => void }) => {
	const { t } = useTranslation();

	return (
		<Button
			variant="transparent"
			onClick={onClick}
			className="!p-0 text-theme-primary-600 dark:text-theme-secondary-500"
			data-testid="LedgerImportStep__edit-alias"
		>
			<Icon name="Pencil" />
			<span>{t("COMMON.EDIT")}</span>
		</Button>
	);
};

const DesktopImportSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
	<div className="flex flex-col gap-4" data-tesid="DesktopImportSection__wrapper">
		<div className="flex flex-col gap-2">
			<span className="text-base font-semibold text-theme-secondary-700">{title}</span>
			<div className="flex flex-col gap-4 rounded-xl border border-theme-secondary-300 px-6 py-5 dark:border-theme-secondary-800">
				{children}
			</div>
		</div>
	</div>
);

export const SingleImport = ({
	network,
	onClickEditWalletName,
	profile,
	wallets,
}: {
	network: Networks.Network;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
	profile: Contracts.IProfile;
	wallets: LedgerData[];
}) => {
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	const ledgerWallet = wallets[0];

	const wallet = profile.wallets().findByAddressWithNetwork(ledgerWallet.address, network.id());
	assertWallet(wallet);

	if (isXs) {
		return (
			<div className="flex flex-col gap-6" data-testid="SingleImport__container-mobile">
				<div>
					<SectionHeaderMobile title={t("COMMON.IMPORTED")} />
					<div className="flex flex-col gap-3 px-3 pt-3">
						<SectionBodyItem title={t("COMMON.ADDRESS")}>
							<div className="w-32">
								<Address address={ledgerWallet.address} showCopyButton wrapperClass="justify-between" />
							</div>
						</SectionBodyItem>

						<SectionBodyItem title={t("COMMON.BALANCE")}>
							<Amount value={ledgerWallet.balance ?? 0} ticker={network.ticker()} />
						</SectionBodyItem>
					</div>
				</div>

				<div>
					<SectionHeaderMobile title={t("COMMON.ADDRESS_NAME")} />
					<div className="flex flex-col gap-3 px-3 pt-3">
						<SectionBodyItem title={t("COMMON.NAME")}>
							<div className="flex flex-row items-center gap-2">
								{wallet.alias()}
								<hr className="h-5 w-px border-transparent bg-theme-secondary-300 dark:bg-theme-secondary-800" />
								<EditButton onClick={() => onClickEditWalletName(wallet)} />
							</div>
						</SectionBodyItem>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<DesktopImportSection title={t("COMMON.IMPORTED")}>
				<SectionBodyItem title={t("COMMON.ADDRESS")}>
					<Address address={ledgerWallet.address} showCopyButton />
				</SectionBodyItem>

				<hr className="w-full border border-dashed border-theme-secondary-300 dark:border-theme-secondary-800" />

				<SectionBodyItem title={t("COMMON.BALANCE")}>
					<Amount value={ledgerWallet.balance ?? 0} ticker={network.ticker()} />
				</SectionBodyItem>
			</DesktopImportSection>

			<DesktopImportSection title={t("COMMON.ADDRESS_NAME")}>
				<SectionBodyItem title={t("COMMON.NAME")}>
					<div className="flex w-full flex-row items-center justify-between">
						<span>{wallet.alias()}</span>

						<EditButton onClick={() => onClickEditWalletName(wallet)} />
					</div>
				</SectionBodyItem>
			</DesktopImportSection>
		</div>
	);
};

export const ImportedLedgerMobileItem = ({
	address,
	balance,
	coin,
	name,
	onClick,
}: {
	address: string;
	balance?: number;
	coin: string;
	name: string;
	onClick: () => void;
}) => {
	const { t } = useTranslation();

	return (
		<MobileCard data-testid="LedgerMobileItem__wrapper">
			<div className="flex h-11 w-full items-center justify-between bg-theme-secondary-100 px-4 dark:bg-black">
				<span className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">
					{name}
				</span>

				<EditButton onClick={onClick} />
			</div>

			<div className="flex w-full flex-col gap-4 px-4 pb-4 pt-2.5">
				<MobileSection title={t("COMMON.ADDRESS")}>
					<Address
						address={address}
						showCopyButton
						addressClass="text-theme-secondary-900 text-sm font-semibold dark:text-theme-secondary-200"
					/>
				</MobileSection>
				<MobileSection title={`${t("COMMON.VALUE")} (${coin})`} data-testid="LedgerMobileItem__network">
					<AmountWrapper isLoading={false}>
						<Amount value={balance!} ticker={coin} />
					</AmountWrapper>
				</MobileSection>
			</div>
		</MobileCard>
	);
};
