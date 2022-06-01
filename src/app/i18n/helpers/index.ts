/* eslint-disable import/no-relative-parent-imports */
import { translations as CONTACTS } from "../../../domains/contact/i18n";
import { translations as DASHBOARD } from "../../../domains/dashboard/i18n";
import { translations as ERROR } from "../../../domains/error/i18n";
import { translations as EXCHANGE } from "../../../domains/exchange/i18n";
import { translations as NEWS } from "../../../domains/news/i18n";
import { translations as PROFILE } from "../../../domains/profile/i18n";
import { translations as SETTINGS } from "../../../domains/setting/i18n";
import { translations as TRANSACTION } from "../../../domains/transaction/i18n";
import { translations as VOTE } from "../../../domains/vote/i18n";
import { translations as WALLETS } from "../../../domains/wallet/i18n";
import { translations as COMMON } from "../common/i18n";

export const buildTranslations = () => ({
	COMMON,
	CONTACTS,
	DASHBOARD,
	ERROR,
	EXCHANGE,
	NEWS,
	PROFILE,
	SETTINGS,
	TRANSACTION,
	VOTE,
	WALLETS,
});
