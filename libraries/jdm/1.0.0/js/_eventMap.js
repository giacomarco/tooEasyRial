import {_lifeCycle} from "./_lifeCycle.js";

export class _eventMap extends _lifeCycle{
	constructor() {
		super();
		window.addEventListener('visibilitychange', this.onVisibilitychange.bind(this));
		window.addEventListener('error', this.onError.bind(this));
		window.addEventListener('resize', this.onResize.bind(this));
		window.addEventListener('hashchange', this.onHashchange.bind(this, location.hash));
	}
	onVisibilitychange() {}
	onError() {}
	onResize() {}
	onHashchange() {}
}


