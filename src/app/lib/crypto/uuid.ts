import { parse, stringify, v4, validate } from "uuid";

export class UUID {
	public static random(): string {
		return v4();
	}

	public static parse(uuid: string): ArrayLike<number> {
		return parse(uuid);
	}

	public static stringify(uuid: Buffer): string {
		return stringify(uuid);
	}

	public static validate(uuid: string): boolean {
		return validate(uuid);
	}
}
