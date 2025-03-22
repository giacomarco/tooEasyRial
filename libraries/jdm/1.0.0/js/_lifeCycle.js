export class _lifeCycle {
	constructor() {
		window.addEventListener('DOMContentLoaded', this.beforeExternals.bind(this));
		window.addEventListener('load', this.loaded.bind(this));
		window.addEventListener('beforeunload', this.beforeUnload.bind(this));
		window.addEventListener('unload', this.unload.bind(this));
	}
	beforeExternals() {}
	loaded() {}
	beforeUnload() {}
	unload() {}
}
