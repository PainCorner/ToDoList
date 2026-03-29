'use strict';

import { TodoModel } from './model.js';
import { TodoView } from './view.js';

const CARD_STATUS_BY_CLASS = {
	'card--todo': 'todo',
	'card--doing': 'doing',
	'card--done': 'done'
};

const ALLOWED_STATUS = ['todo', 'doing', 'done'];
const ALLOWED_SORT_ORDERS = ['created-desc', 'created-asc', 'due-asc', 'due-desc'];

const isValidDueDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const getNormalizedSortOrder = (value) => {
	return ALLOWED_SORT_ORDERS.includes(value) ? value : 'created-desc';
};

const compareDueDateAsc = (a, b) => {
	if (!a.dueDate && !b.dueDate) return Number(b.id) - Number(a.id);
	if (!a.dueDate) return 1;
	if (!b.dueDate) return -1;
	if (a.dueDate === b.dueDate) return Number(b.id) - Number(a.id);
	return a.dueDate.localeCompare(b.dueDate);
};

const compareDueDateDesc = (a, b) => {
	if (!a.dueDate && !b.dueDate) return Number(b.id) - Number(a.id);
	if (!a.dueDate) return 1;
	if (!b.dueDate) return -1;
	if (a.dueDate === b.dueDate) return Number(b.id) - Number(a.id);
	return b.dueDate.localeCompare(a.dueDate);
};

const sortTodos = (todos, sortOrder) => {
	const nextTodos = [...todos];

	switch (sortOrder) {
		case 'created-asc':
			return nextTodos.sort((a, b) => Number(a.id) - Number(b.id));
		case 'due-asc':
			return nextTodos.sort(compareDueDateAsc);
		case 'due-desc':
			return nextTodos.sort(compareDueDateDesc);
		case 'created-desc':
		default:
			return nextTodos.sort((a, b) => Number(b.id) - Number(a.id));
	}
};

const getStatusFromButton = (button) => {
	const card = button.closest('.card');
	if (!card) return 'todo';

	const className = Object.keys(CARD_STATUS_BY_CLASS).find((name) => card.classList.contains(name));
	return className ? CARD_STATUS_BY_CLASS[className] : 'todo';
};

export const TodoController = {
	editingTodoId: null,
	sortOrder: getNormalizedSortOrder(TodoModel.sortOrder),

	init() {
		const addBtns = document.querySelectorAll('.card__add-btn');

		TodoView.bindAddTodoForm(({ text, dueDate, status }) => {
			this.addTodo({ text, dueDate, status });
		});
		TodoView.bindSortSelect((sortOrder) => {
			this.setSortOrder(sortOrder);
		});
		TodoView.setSortValue(this.sortOrder);

		addBtns.forEach((addBtn) => {
			addBtn.addEventListener('click', () => {
				const status = getStatusFromButton(addBtn);
				TodoView.openAddTodoDialog(status);
			});
		});

		this.loadTodos();
	},

	loadTodos() {
		const todos = TodoModel.todos.map((todo) => ({
			...todo,
			status: ALLOWED_STATUS.includes(todo.status) ? todo.status : 'todo',
			checked: typeof todo.checked === 'boolean' ? todo.checked : todo.status === 'done',
			dueDate: isValidDueDate(todo.dueDate) ? todo.dueDate : ''
		}));
		const sortedTodos = sortTodos(todos, this.sortOrder);

		TodoView.render(sortedTodos, {
			onDelete: (id) => this.deleteTodo(id),
			onUpdate: (id, newText) => this.updateTodo(id, newText),
			onMove: (id, status) => this.moveTodo(id, status),
			onToggleChecked: (id, checked) => this.toggleTodoChecked(id, checked),
			onFinishEditing: (id) => this.finishEditing(id)
		}, {
			editingTodoId: this.editingTodoId
		});
	},

	addTodo({ status = 'todo', text = '', dueDate = '' } = {}) {
		const todos = TodoModel.todos;
		const nextStatus = ALLOWED_STATUS.includes(status) ? status : 'todo';
		const nextText = text.trim();
		const id = Date.now();

		if (nextText === '') return;

		todos.unshift({
			id,
			text: nextText,
			status: nextStatus,
			checked: false,
			dueDate: isValidDueDate(dueDate) ? dueDate : ''
		});

		TodoModel.todos = todos;
		this.editingTodoId = null;
		this.loadTodos();
	},

	deleteTodo(id) {
		const normalizedId = String(id);
		const todos = TodoModel.todos.filter((todo) => String(todo.id) !== normalizedId);
		TodoModel.todos = todos;
		this.loadTodos();
	},

	updateTodo(id, newText) {
		const normalizedId = String(id);
		const todos = TodoModel.todos;
		const target = todos.find((todo) => String(todo.id) === normalizedId);

		if (target && newText && newText.trim() !== '') {
			target.text = newText.trim();
			TodoModel.todos = todos;
			this.finishEditing(normalizedId);
			this.loadTodos();
		}
	},

	moveTodo(id, status) {
		if (!ALLOWED_STATUS.includes(status)) return;

		const normalizedId = String(id);
		const todos = TodoModel.todos;
		const target = todos.find((todo) => String(todo.id) === normalizedId);

		if (target && target.status !== status) {
			target.status = status;
			TodoModel.todos = todos;
			this.loadTodos();
		}
	},

	toggleTodoChecked(id, checked) {
		const normalizedId = String(id);
		const todos = TodoModel.todos;
		const target = todos.find((todo) => String(todo.id) === normalizedId);

		if (target && target.checked !== checked) {
			target.checked = checked;
			TodoModel.todos = todos;
			this.loadTodos();
		}
	},

	finishEditing(id) {
		if (this.editingTodoId === String(id)) {
			this.editingTodoId = null;
		}
	},

	setSortOrder(sortOrder) {
		this.sortOrder = getNormalizedSortOrder(sortOrder);
		TodoModel.sortOrder = this.sortOrder;
		this.loadTodos();
	}
};
