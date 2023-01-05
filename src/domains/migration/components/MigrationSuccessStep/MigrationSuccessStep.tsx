import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { EthereumAvatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { Clipboard } from "@/app/components/Clipboard";
import { FormButtons } from "@/app/components/Form";
import { Header } from "@/app/components/Header";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";
import { Link } from "@/app/components/Link";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import MigrationStep from "@/domains/migration/components/MigrationStep";

const migrationTransaction: any = {
	address: "AXzxJ8Ts3dQ2bvBR1tPE7GUee9iSEJb8HX",
	amount: 123,
	id: "id",
	migrationAddress: "0x0000000000000000000000000000000000000000",
	timestamp: Date.now() / 1000,
};

export const MigrationSuccessStep: React.FC = () => {
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	const activeProfile = useActiveProfile();
	const history = useHistory();

	const reference = useRef(null);

	const ButtonWrapper = isXs
		? FormButtons
		: ({ children }: { children: React.ReactNode }) => (
				<div className="mt-8 flex items-center justify-center">{children}</div>
		  );

	return (
		<MigrationStep>
			<div className="my-5 flex flex-col">
				<Header
					title={t("MIGRATION.MIGRATION_ADD.STEP_SUCCESS.TITLE")}
					subtitle={t("MIGRATION.MIGRATION_ADD.STEP_SUCCESS.DESCRIPTION")}
					className="mx-auto text-center"
					headerClassName="text-lg sm:text-2xl"
				/>

				<div className="mx-auto my-6 max-w-2xl">
					<Image
						name="MigrationSuccessBanner"
						domain="migration"
						className="w-full"
						useAccentColor={false}
					/>
				</div>

				<div className="flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
					<div className="flex flex-col py-5 px-6">
						<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
							{t("MIGRATION.POLYGON_ADDRESS")}
						</span>
						<div className="flex items-center gap-x-2">
							<EthereumAvatar address={migrationTransaction.migrationAddress} size="xs" />
							<Address address={migrationTransaction.migrationAddress} />
						</div>
					</div>

					<div className="relative border-t border-theme-secondary-300 dark:border-theme-secondary-800">
						<div className="absolute top-1/2 right-6 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-theme-secondary-300 bg-theme-background dark:border-theme-secondary-800">
							<div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-theme-navy-600 bg-theme-navy-100 text-theme-navy-600 dark:bg-transparent">
								<Icon name="CheckmarkSmall" size="sm" />
							</div>
						</div>
					</div>

					<div className="flex flex-col py-5 px-6">
						<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
							{t("COMMON.AMOUNT")}
						</span>
						<Amount value={migrationTransaction.amount} ticker="ARK" className="text-lg font-semibold" />
					</div>
				</div>

				<div className="mt-3 flex overflow-hidden rounded-xl">
					<div className="flex flex-1 flex-col bg-theme-secondary-100 p-5 dark:bg-black">
						<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
							{t("MIGRATION.TRANSACTION_ID")}
						</span>
						<span ref={reference} className="overflow-hidden">
							<Link
								to={`https://polygonscan.com/tx/${migrationTransaction.id}`}
								tooltip={migrationTransaction.id}
								showExternalIcon={false}
								isExternal
							>
								<TruncateMiddleDynamic value={migrationTransaction.id} parentRef={reference} />
							</Link>
						</span>
					</div>

					<div className="flex items-center bg-theme-navy-100 px-5 text-theme-navy-600 dark:bg-theme-secondary-800 dark:text-theme-secondary-200">
						<Clipboard variant="icon" data={migrationTransaction.id}>
							<Icon name="Copy" />
						</Clipboard>
					</div>
				</div>

				<ButtonWrapper>
					<Button variant="primary" onClick={() => history.push(`/profiles/${activeProfile.id()}/dashboard`)}>
						{t("COMMON.BACK_TO_DASHBOARD")}
					</Button>
				</ButtonWrapper>
			</div>
		</MigrationStep>
	);
};
