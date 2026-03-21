'use strict';

import { TodoModel } from './model.js';
import { TodoView } from './view.js';

const CARD_STATUS_BY_CLASS = {
	'card--todo': 'todo',
	'card--doing': 'doing',
	'card--done': 'done'
};

const ALLOWED_STATUS = ['todo', 'doing', 'done'];
const DEFAULT_NEW_TODO_TEXT = '新しいタスク';

const getStatusFromButton = (button) => {
	const card = button.closest('.card');
	if (!card) return 'todo';

	const className = Object.keys(CARD_STATUS_BY_CLASS).find((name) => card.classList.contains(name));
	return className ? CARD_STATUS_BY_CLASS[className] : 'todo';
};

export const TodoController = {
	editingTodoId: null,

	init() {
		const addBtns = document.querySelectorAll('.card__add-btn');

		addBtns.forEach((addBtn) => {
			addBtn.addEventListener('click', () => {
				const status = getStatusFromButton(addBtn);
				this.addTodo(status);
			});
		});

		this.loadTodos();
	},

	loadTodos() {
		const todos = TodoModel.todos.map((todo) => ({
			...todo,
			status: ALLOWED_STATUS.includes(todo.status) ? todo.status : 'todo',
			checked: typeof todo.checked === 'boolean' ? todo.checked : todo.status === 'done'
		}));

		TodoView.render(todos, {
			onDelete: (id) => this.deleteTodo(id),
			onUpdate: (id, newText) => this.updateTodo(id, newText),
			onMove: (id, status) => this.moveTodo(id, status),
			onToggleChecked: (id, checked) => this.toggleTodoChecked(id, checked),
			onFinishEditing: (id) => this.finishEditing(id)
		}, {
			editingTodoId: this.editingTodoId
		});
	},

	addTodo(status = 'todo') {
		const todos = TodoModel.todos;
		const nextStatus = ALLOWED_STATUS.includes(status) ? status : 'todo';
		const id = Date.now();

		todos.unshift({
			id,
			text: DEFAULT_NEW_TODO_TEXT,
			status: nextStatus,
			checked: false
		});

		TodoModel.todos = todos;
		this.editingTodoId = String(id);
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
	}
};
