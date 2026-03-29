'use strict';

const STORAGE_KEY = 'todos';
const SORT_STORAGE_KEY = 'todoSortOrder';

export const TodoModel = {
	get todos() {
		const json = localStorage.getItem(STORAGE_KEY);
		return json ? JSON.parse(json) : [];
	},

	set todos(value) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
	},

	get sortOrder() {
		return localStorage.getItem(SORT_STORAGE_KEY) || 'created-desc';
	},

	set sortOrder(value) {
		localStorage.setItem(SORT_STORAGE_KEY, value);
	},

	clear() {
		localStorage.removeItem(STORAGE_KEY);
		localStorage.removeItem(SORT_STORAGE_KEY);
	}
};
