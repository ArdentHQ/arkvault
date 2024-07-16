import { Contracts } from "@ardenthq/sdk-profiles";
import { ReadableFile } from "@/app/hooks/use-files";

export enum ExportProgressStatus {
	Idle = 1,
	Progress = 2,
	Success = 3,
	Error = 4,
}

export interface TransactionExportModalProperties {
	isOpen: boolean;
	wallet: Contracts.IReadWriteWallet;
	onClose: () => void;
}

export interface TransactionExportFormProperties {
	wallet: Contracts.IReadWriteWallet;
	onCancel: () => void;
}

export interface TransactionExportProgressProperties {
	count: number;
	file: ReadableFile;
	onCancel: () => void;
}

export interface TransactionExportStatusProperties {
	count: number;
	file: ReadableFile;
	onBack: () => void;
	onDownload?: (filename: string) => void;
}

export interface TransactionExportErrorProperties {
	error?: string;
	file: ReadableFile;
	onBack: () => void;
	onRetry?: () => void;
	count: number;
	onDownload?: (filename: string) => void;
}

export enum TransactionType {
	All = "all",
	Outgoing = "sent",
	Incoming = "received",
}

export enum CsvDelimiter {
	Comma = ",",
	Semicolon = ";",
	Tab = "\t",
	Pipe = "|",
}

export enum DateRange {
	CurrentMonth = "currentMonth",
	LastMonth = "lastMonth",
	CurrentQuarter = "currentQuarter",
	LastQuarter = "lastQuarter",
	CurrentYear = "currentYear",
	LastYear = "lastYear",
	All = "all",
	Custom = "custom",
}

export interface CsvSettings {
	transactionType: TransactionType;
	includeHeaderRow: boolean;
	includeTransactionId: boolean;
	includeDate: boolean;
	includeSenderRecipient: boolean;
	includeCryptoAmount: boolean;
	includeFiatAmount: boolean;
	delimiter: CsvDelimiter;
	dateRange: DateRange;
}

export interface ExportSettings extends CsvSettings {
	transactionType: TransactionType;
	delimiter: CsvDelimiter;
	dateRange: DateRange;
	from: Date;
	to: Date;
}

export type ExportStatus = "success" | "loading" | "danger";
