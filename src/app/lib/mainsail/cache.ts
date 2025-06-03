import { DateTime } from "@/app/lib/intl";

interface CacheItem {
	value: any;
	expires_at: number;
}

export class Cache {
	private store: Record<string, CacheItem> = {};
	private readonly ttl: number;

	public constructor(ttl: number) {
		this.ttl = ttl;
	}

	public async remember(key: string, value: unknown, ttl?: number): Promise<any> {
		// 1. Check if we still have a matching item for the key.
		const cacheItem = this.store[key];

		if (cacheItem && DateTime.make().isBefore(DateTime.fromUnix(cacheItem.expires_at))) {
			return cacheItem.value;
		}

		// 2. We don't have a matching value so we need to set it.
		let result: unknown = value;

		if (typeof value === "function") {
			result = await value();
		}

		this.store[key] = {
			expires_at: DateTime.make()
				.addSeconds(ttl ?? this.ttl)
				.toUNIX(),
			value: result,
		};

		return result;
	}

	public forget(key: string) {
		delete this.store[key];
	}

	public flush() {
		this.store = {};
	}
}
