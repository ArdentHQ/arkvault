export class TextMeasurer {
	static measureText(text: string, font: string): number {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		if (!context) {
			return 0;
		}
		context.font = font;
		return context.measureText(text).width;
	}

	static canFit(text: string, availableWidth: number, font: string): boolean {
		return TextMeasurer.measureText(text, font) <= availableWidth;
	}

	static findMaximumTotalCharacters(text: string, availableWidthForText: number, font: string): number {
		let lowerBound = 0;
		let upperBound = text.length;

		while (lowerBound < upperBound) {
			const candidateTotal = Math.ceil((lowerBound + upperBound) / 2);
			const tailLength = Utils.calculateTailLength(candidateTotal);
			const headLength = candidateTotal - tailLength;

			if (
				TextMeasurer.measureText(text.slice(0, headLength) + text.slice(-tailLength), font) <=
				availableWidthForText
			) {
				lowerBound = candidateTotal;
			} else {
				upperBound = candidateTotal - 1;
			}
		}

		return lowerBound;
	}
}

export class Utils {
	static calculateTailLength(totalCharacters: number): number {
		return Math.ceil(totalCharacters / 2);
	}

	static splitHeadAndTail(totalCharacters: number): { headLength: number; tailLength: number } {
		const tailLength = Utils.calculateTailLength(totalCharacters);
		return { headLength: totalCharacters - tailLength, tailLength };
	}

	static buildTruncatedText(text: string, headLength: number, tailLength: number): string {
		const tail = tailLength > 0 ? text.slice(-tailLength) : "";
		return text.slice(0, headLength) + MiddleTruncator.ELLIPSIS + tail;
	}
}

export class MiddleTruncator {
	static ELLIPSIS = "...";

	static truncate(text: string, availableWidth: number, font: string): string {
		if (TextMeasurer.canFit(text, availableWidth, font)) {
			return text;
		}

		const ellipsisWidth = TextMeasurer.measureText(MiddleTruncator.ELLIPSIS, font);
		const availableWidthForText = availableWidth - ellipsisWidth;

		const totalCharacters = TextMeasurer.findMaximumTotalCharacters(text, availableWidthForText, font);
		const { headLength, tailLength } = Utils.splitHeadAndTail(totalCharacters);

		return Utils.buildTruncatedText(text, headLength, tailLength);
	}
}
