export type Unregister = () => void;

/**
 * return true to keep callback registered and be called again. false to unregister
 */
export type Callback<C> = (args: C) => boolean;

/**
 * Registry for repeatadly called callbacks. The callback can deregister by a return value false
 */
export class ListenerRegistry<C> {
	private callbacks: Callback<C>[] = [];

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
		callbacks.forEach((h) => {
			if (h(args)) {
				this.callbacks.push(h);
			}
		});
	}

	/**
	 * register callback which will be called with each `process` method calls as long as callback returns true or Unregister method is not called.
	 * @param callback
	 * @returns
	 */
	register(callback: Callback<C>): Unregister {
		this.callbacks.push(callback);
		return () => {
			this.callbacks.remove(callback);
		};
	}
}
