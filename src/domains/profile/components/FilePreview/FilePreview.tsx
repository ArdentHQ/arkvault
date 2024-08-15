import React from "react";

import {Icon, ThemeIcon} from "@/app/components/Icon";
import { Spinner } from "@/app/components/Spinner";
import { ReadableFile } from "@/app/hooks/use-files";

type FilePreviewVariant = "success" | "loading" | "danger";

interface FilePreviewProperties {
	file?: ReadableFile;
	variant?: FilePreviewVariant;
	useBorders?: boolean;
}

export const FilePreviewPlain = ({ file, variant }: { file: ReadableFile; variant?: FilePreviewVariant }) => {
	const fileTypeIcon: Record<string, string[]> = {
		csv: ["ExtensionCsv", "ExtensionCsv"],
		json: ["ExtensionJson", "ExtensionJson"],
		wwe: ["ExtensionWweDark", "ExtensionWweLight"],
	};

	return (
		<div className="flex items-center justify-between space-x-4" data-testid="FilePreviewPlain">
			<div className="flex flex-grow items-center space-x-2">
				<ThemeIcon darkIcon={fileTypeIcon[file.extension][0] || "File"} lightIcon={fileTypeIcon[file.extension][1] || "File"} size="lg" />
				<div className="w-0 flex-1 text-sm sm:text-lg leading-[17px] sm:leading-[21px] truncate font-semibold">{file.name}</div>
			</div>

			{variant === "loading" && <Spinner className="!border-[3px] !w-6 !h-6 dark:!border-theme-secondary-800 dark:!border-l-theme-primary-600"/>}

			{variant === "danger" && (
				<div data-testid="FilePreviewPlain__Error" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-theme-danger-200 text-theme-danger-500">
					<Icon name="CrossSmall" size="sm" />
				</div>
			)}

			{variant === "success" && (
				<div data-testid="FilePreviewPlain__Success" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-theme-navy-100 dark:bg-theme-navy-600 text-theme-navy-600 dark:text-white">
					<Icon name="CheckmarkSmall" size="sm" />
				</div>
			)}
		</div>
	);
};

export const FilePreview = ({ file, useBorders = true, variant }: FilePreviewProperties) => {
	if (!file) {
		return <></>;
	}

	if (!useBorders) {
		return <FilePreviewPlain variant={variant} file={file} />;
	}

	return (
		<div className="rounded-xl border border-theme-secondary-300 p-4 sm:py-5 sm:px-6 dark:border-theme-secondary-800">
			<FilePreviewPlain variant={variant} file={file} />
		</div>
	);
};
