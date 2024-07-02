import { ReadableFile, useFiles } from "@/app/hooks/use-files";

export const useFileDownload = () => {
	const { showSaveDialog } = useFiles();

	const download = async (file: ReadableFile) => {
		let filename: string | undefined;

		try {
			filename = await showSaveDialog(file.content, {
				extensions: [file.extension],
				fileName: `${file.name}.${file.extension}`,
			});
		} catch {
			return;
		}

		return filename;
	};

	return { download };
};
