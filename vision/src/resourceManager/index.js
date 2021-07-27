import ResourceManager from './ResourceManager';
import { toRef, toRefs, reactive, ref } from 'vue';

let plugin = {
	beforeCreate() {
		const vmOptions = this.$options;
		if (!vmOptions.resources || vmOptions._rm) return;

		let resourceManager;
		if (typeof vmOptions.resources === 'function') {
			vmOptions.resources = vmOptions.resources.call(this);
		}

		if (isPlainObject(vmOptions.resources)) {
			const { $options, ...resourceDefs } = vmOptions.resources;
			resourceManager = new ResourceManager(this, resourceDefs);
		} else {
			throw new Error(
				'[ResourceManager]: resources options should be an object or a function that returns object'
			);
		}

		if (!Object.prototype.hasOwnProperty.call(this, '$resources')) {
			// console.log(this);
			// Object.defineProperty(this, '$resources', {
			// 	get: () => resourceManager.resources,
			// });
			// console.log(resourceManager.resources);
			console.log('indexjs, beforeCreate: ', resourceManager.resources);
			this.$resources = reactive(resourceManager.resources);
		}

		console.log('vmOptions.computed inside beforeCreate', vmOptions.computed);

		// console.log(this);
		// window.h = this;
		Object.keys(vmOptions.resources).forEach((key) => {
			console.log('key', key);
			console.log('indexjs, beforeCreate: vmOptions.resources.key', key);
			if (
				!(
					hasKey(vmOptions.computed, key) ||
					hasKey(vmOptions.props, key) ||
					hasKey(vmOptions.methods, key)
				)
			) {
				console.log('beforeCreate computed: ', vmOptions.computed);
				vmOptions.computed[key] = vmOptions.resources[key];
			}
		});

		this._rm = resourceManager;
	},
	data() {
		if (!this._rm) return {};
		return {
			$rm: this._rm,
			$r: this._rm.resources,
			$resources: this._rm.resources,
		};
	},
	created() {
		if (!this._rm) return;
		this._rm.init();
	},
};

export default function install(app, options) {
	app.mixin(plugin);
}

function isPlainObject(value) {
	return (
		typeof value === 'object' &&
		value &&
		Object.prototype.toString(value) === '[object Object]'
	);
}

function hasKey(object, key) {
	return key in (object || {});
}