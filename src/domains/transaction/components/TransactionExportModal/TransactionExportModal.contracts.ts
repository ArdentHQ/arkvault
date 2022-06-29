import { Contracts } from "@ardenthq/sdk-profiles";
import { ReadableFile } from "@/app/hooks/use-files";

export enum ExportProgressStatus {
	Idle = 1,
	Progress = 2,
	Success = 3,
	Error = 4,
}

export interface TransactionExportModalProperties {
	initialStatus?: ExportProgressStatus;
	isOpen: boolean;
	onClose?: () => void;
	wallet: Contracts.IReadWriteWallet;
}

export interface TransactionExportFormProperties {
	onCancel?: () => void;
	onExport?: (exportSettings: ExportSettings) => void;
}

export interface TransactionExportStatusProperties {
	file: ReadableFile;
	onCancel?: () => void;
	onDownload?: () => void;
}

export interface TransactionExportErrorProperties {
	file: ReadableFile;
	error?: string;
	onClose?: () => void;
	onRetry?: () => void;
}

export enum TransactionType {
	All = "all",
	Outgoing = "sent",
	Incoming = "received",
}

export enum CSVDelimiter {
	Comma = ",",
	Semicolon = ";",
	Tab = "\t",
	Space = " ",
	Pipe = "|",
}

export enum DateRange {
	CurrentMonth = "currentMonth",
	LastMonth = "lastMonth",
	LastQuarter = "lastQuarter",
	YearToDate = "yearToDate",
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
	delimiter: CSVDelimiter;
	dateRange: DateRange;
}

export interface ExportSettings extends CsvSettings {
	transactionType: TransactionType;
	delimiter: CSVDelimiter;
	dateRange: DateRange;
}

export type ExportStatus = "success" | "loading" | "danger";
