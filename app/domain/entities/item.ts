export type DataStoreKey = string;
export type DataStoreValue = string;

export interface Item {
	value: DataStoreValue;
}

export class BasicItem implements Item {
	value: DataStoreValue;
	constructor(value: DataStoreValue) {
		this.value = value;
	}
}

export abstract class ItemDecorator implements Item {
	constructor(protected item: Item) {}

	get value(): string {
		return this.item.value;
	}
}

export class ExpirableItem extends ItemDecorator {
	expiryDate: Date;

	/**
	 * Creates an entry that's valid fox [expiry] amount of ms
	 * @param value - value to be stored
	 * @param expiry - time for the entry to be valid for in ms
	 */
	constructor(item: Item, expiry: number) {
		super(item);
		this.expiryDate = new Date();
		this.expiryDate = new Date(this.expiryDate.getTime() + expiry);
	}

	isExpired(now: Date = new Date()): boolean {
		console.log(this.expiryDate, now);
		return this.expiryDate <= now;
	}
}
export function isExpirable(item: Item): item is ExpirableItem {
	return item instanceof ExpirableItem;
}
