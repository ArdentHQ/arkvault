import React from "react";

import { Icon, ThemeIcon } from "@/app/components/Icon";
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

	const icons = file.extension in fileTypeIcon ? fileTypeIcon[file.extension] : undefined;

	return (
		<div className="flex justify-between items-center space-x-4" data-testid="FilePreviewPlain">
			<div className="flex items-center space-x-2 grow">
				<ThemeIcon darkIcon={icons ? icons[0] : "File"} lightIcon={icons ? icons[1] : "File"} size="lg" />
				<div className="flex-1 w-0 text-sm font-semibold sm:text-lg truncate leading-[17px] sm:leading-[21px]">
					{file.name}
				</div>
			</div>

			{variant === "loading" && (
				<Spinner className="dark:border-theme-secondary-800! dark:border-l-theme-primary-600! h-6! w-6! border-[3px]!" />
			)}

			{variant === "danger" && (
				<div
					data-testid="FilePreviewPlain__Error"
					className="flex justify-center items-center w-5 h-5 rounded-full bg-theme-danger-200 text-theme-danger-500 shrink-0"
				>
					<Icon name="CrossSmall" size="sm" />
				</div>
			)}

			{variant === "success" && (
				<div
					data-testid="FilePreviewPlain__Success"
					className="flex justify-center items-center w-5 h-5 rounded-full dark:text-white bg-theme-navy-100 text-theme-navy-600 shrink-0 dark:bg-theme-navy-600"
				>
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
		<div className="p-4 rounded-xl border sm:py-5 sm:px-6 border-theme-secondary-300 dark:border-theme-secondary-800">
			<FilePreviewPlain variant={variant} file={file} />
		</div>
	);
};
