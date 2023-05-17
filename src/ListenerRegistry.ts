export type Unregister = () => void;

/**
 * return true to keep callback registered and be called again. false to unregister
 */
export type Callback<C> = (args: C) => boolean;

interface RegistryItem<C> {
	callback: Callback<C>;
	destroyed?: true;
}

/**
 * Registry for repeatadly called callbacks. The callback can deregister by a return value false
 */
export class ListenerRegistry<C> {
	private callbacks: RegistryItem<C>[] = [];

	constructor(private name: string) {}

	/**
	 * Calls all registered callbacks
	 * @param args
	 */
	process(args: C) {
		if (this.callbacks.length === 0) {
			return;
		}
		const callbacks = [...this.callbacks];
		this.callbacks.length = 0;
		callbacks.forEach((item) => {
			if (!item.destroyed && item.callback(args)) {
				if (!item.destroyed) {
					//add it if callback did not unregistered this item during its call
					this.callbacks.push(item);
				}
			}
		});
	}

	/**
	 * register callback which will be called with each `process` method calls as long as callback returns true or Unregister method is not called.
	 * @param callback
	 * @returns
	 */
	register(callback: Callback<C>): Unregister {
		const item: RegistryItem<C> = { callback };
		this.callbacks.push(item);
		return () => {
			item.destroyed = true;
			this.callbacks.remove(item);
		};
	}
}
