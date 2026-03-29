'use strict';

const STATUS_TO_CLASS = {
	todo: 'card__item--todo',
	doing: 'card__item--doing',
	done: 'card__item--done'
};

const STATUS_TO_SELECTOR = {
	todo: '.card--todo .card__list',
	doing: '.card--doing .card__list',
	done: '.card--done .card__list'
};

const STATUS_TO_CARD_SELECTOR = {
	todo: '.card--todo',
	doing: '.card--doing',
	done: '.card--done'
};

const EMPTY_TASK_LABEL = 'Enter task name';
const CLICK_DELAY_MS = 200;

let itemTemplate = null;
let dropBound = false;

const getListByStatus = (status) => {
	return document.querySelector(STATUS_TO_SELECTOR[status]);
};

const getCardByStatus = (status) => {
	return document.querySelector(STATUS_TO_CARD_SELECTOR[status]);
};

const getItemTemplate = () => {
	if (itemTemplate) return itemTemplate;

	const base = document.querySelector('.card__list .card__item');
	if (base) {
		itemTemplate = base.cloneNode(true);
		return itemTemplate;
	}

	return null;
};

const focusTextNode = (textNode) => {
	queueMicrotask(() => {
		textNode.focus();

		const selection = window.getSelection();
		if (!selection) return;

		const range = document.createRange();
		range.selectNodeContents(textNode);
		selection.removeAllRanges();
		selection.addRange(range);
	});
};

const formatDueDate = (dueDate) => {
	if (!dueDate) return '';

	const [year, month, day] = dueDate.split('-');
	if (!year || !month || !day) return '';

	return `Due: ${year}/${month}/${day}`;
};

const startInlineEdit = (li, textNode, todo, handlers) => {
	if (textNode.dataset.editing === 'true') return;

	const originalText = todo.text || '';
	li.draggable = false;
	textNode.dataset.editing = 'true';
	textNode.contentEditable = 'true';
	textNode.spellcheck = false;
	textNode.tabIndex = -1;
	textNode.style.backgroundColor = '#fff';
	textNode.style.borderRadius = '0.25rem';
	textNode.style.outline = '2px solid #2670f9';
	textNode.style.paddingInline = '0.2rem';
	textNode.style.userSelect = 'text';
	textNode.style.webkitUserSelect = 'text';

	const finishEdit = (shouldSave) => {
		if (textNode.dataset.editing !== 'true') return;

		textNode.dataset.editing = 'false';
		textNode.contentEditable = 'false';
		textNode.removeAttribute('tabindex');
		textNode.style.backgroundColor = '';
		textNode.style.borderRadius = '';
		textNode.style.outline = '';
		textNode.style.paddingInline = '';
		textNode.style.userSelect = '';
		textNode.style.webkitUserSelect = '';
		li.draggable = true;
		textNode.removeEventListener('blur', handleBlur);
		textNode.removeEventListener('keydown', handleKeydown);
		handlers.onFinishEditing?.(todo.id);

		if (!shouldSave) {
			textNode.textContent = originalText || EMPTY_TASK_LABEL;
			return;
		}

		const nextText = (textNode.textContent || '').trim();
		if (nextText === '') {
			textNode.textContent = originalText || EMPTY_TASK_LABEL;
			return;
		}

		handlers.onUpdate(todo.id, nextText);
	};

	const handleBlur = () => {
		finishEdit(true);
	};

	const handleKeydown = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			textNode.blur();
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			finishEdit(false);
		}
	};

	textNode.addEventListener('blur', handleBlur);
	textNode.addEventListener('keydown', handleKeydown);
	focusTextNode(textNode);
};

const createListItem = (todo, handlers, options) => {
	const template = getItemTemplate();
	const li = template ? template.cloneNode(true) : document.createElement('li');

	li.className = `card__item ${STATUS_TO_CLASS[todo.status] || STATUS_TO_CLASS.todo}`;
	li.draggable = true;
	li.dataset.id = String(todo.id);

	let label = li.querySelector('.card__label');
	if (!label) {
		label = document.createElement('label');
		label.className = 'card__label';
		li.appendChild(label);
	}

	let checkbox = li.querySelector('.card__checkbox');
	if (!checkbox) {
		checkbox = document.createElement('input');
		checkbox.className = 'card__checkbox';
		checkbox.type = 'checkbox';
		label.prepend(checkbox);
	}

	checkbox.checked = Boolean(todo.checked);
	checkbox.addEventListener('change', () => {
		handlers.onToggleChecked(todo.id, checkbox.checked);
	});

	let content = li.querySelector('.card__content');
	if (!content) {
		content = document.createElement('span');
		content.className = 'card__content';
		label.appendChild(content);
	}

	let textNode = content.querySelector('.card__text') || li.querySelector('.card__text');
	if (!textNode) {
		textNode = document.createElement('span');
		textNode.className = 'card__text';
	}
	content.appendChild(textNode);

	let dueNode = content.querySelector('.card__due');
	if (!dueNode) {
		dueNode = document.createElement('span');
		dueNode.className = 'card__due';
		content.appendChild(dueNode);
	}

	textNode.textContent = todo.text && todo.text.trim() !== '' ? todo.text : EMPTY_TASK_LABEL;
	textNode.style.cursor = 'pointer';
	dueNode.textContent = formatDueDate(todo.dueDate);
	dueNode.hidden = !todo.dueDate;

	let clickTimerId = null;

	const beginEdit = () => {
		startInlineEdit(li, textNode, todo, handlers);
	};

	const scheduleToggleChecked = (event) => {
		event.preventDefault();
		event.stopPropagation();

		if (clickTimerId) {
			clearTimeout(clickTimerId);
		}

		clickTimerId = window.setTimeout(() => {
			clickTimerId = null;
			checkbox.checked = !checkbox.checked;
			handlers.onToggleChecked(todo.id, checkbox.checked);
		}, CLICK_DELAY_MS);
	};

	const handleDoubleClick = (event) => {
		event.preventDefault();
		event.stopPropagation();

		if (clickTimerId) {
			clearTimeout(clickTimerId);
			clickTimerId = null;
		}

		beginEdit();
	};

	textNode.addEventListener('click', scheduleToggleChecked);
	textNode.addEventListener('dblclick', handleDoubleClick);

	label.addEventListener('click', (event) => {
		if (event.target === checkbox) return;
		scheduleToggleChecked(event);
	});

	label.addEventListener('dblclick', (event) => {
		if (event.target === checkbox) return;
		handleDoubleClick(event);
	});

	if (String(options.editingTodoId) === String(todo.id)) {
		startInlineEdit(li, textNode, todo, handlers);
	}

	let menuBtn = li.querySelector('.card__menu-btn');
	if (!menuBtn) {
		menuBtn = document.createElement('button');
		menuBtn.type = 'button';
		menuBtn.className = 'card__menu-btn';
		menuBtn.textContent = 'Delete';
		li.appendChild(menuBtn);
	}

	menuBtn.addEventListener('click', () => {
		handlers.onDelete(todo.id);
	});

	li.addEventListener('dragstart', (event) => {
		if (!event.dataTransfer) return;
		event.dataTransfer.setData('text/plain', String(todo.id));
		event.dataTransfer.effectAllowed = 'move';
	});

	return li;
};

const attachDropHandlers = (target, status, handlers) => {
	target.addEventListener('dragover', (event) => {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	});

	target.addEventListener('drop', (event) => {
		event.preventDefault();
		if (!event.dataTransfer) return;

		const id = event.dataTransfer.getData('text/plain');
		if (id !== '') {
			handlers.onMove(id, status);
		}
	});
};

const bindDropZones = (handlers) => {
	if (dropBound) return;

	Object.keys(STATUS_TO_SELECTOR).forEach((status) => {
		const list = getListByStatus(status);
		const card = getCardByStatus(status);
		if (!list || !card) return;

		list.style.minHeight = '96px';
		card.style.minHeight = '96px';
		attachDropHandlers(card, status, handlers);
	});

	dropBound = true;
};

export const TodoView = {
	selectors: {
		settingsBtn: '.main-header__setting-btn',
		drawerSettings: '.drawer--settings',
		drawerCloseBtn: '.drawer__close-btn',
		sortSelect: '.todo-sort__select',
		addDialog: '.todo-dialog',
		addForm: '.todo-dialog__form',
		addTitleInput: '.todo-dialog__title-input',
		addDateInput: '.todo-dialog__date-input',
		addStatusInput: '.todo-dialog__status-input',
		addCancelBtn: '.todo-dialog__cancel-btn'
	},

	el: {},

	init() {
		Object.keys(this.selectors).forEach((key) => {
			this.el[key] = document.querySelector(this.selectors[key]);
		});

		this.toggleSettingsDrawerMenu();
		this.bindAddDialogClose();
	},

	toggleSettingsDrawerMenu() {
		this.el.settingsBtn?.addEventListener('click', () => {
			if (this.el.drawerSettings?.open) {
				this.el.drawerSettings.close();
			} else {
				this.el.drawerSettings?.showModal();
			}
		});

		this.el.drawerCloseBtn?.addEventListener('click', () => this.el.drawerSettings?.close());

		this.el.drawerSettings?.addEventListener('click', (event) => {
			if (event.target === this.el.drawerSettings) {
				this.el.drawerSettings.close();
			}
		});
	},

	bindAddDialogClose() {
		this.el.addCancelBtn?.addEventListener('click', () => this.el.addDialog?.close());

		this.el.addDialog?.addEventListener('click', (event) => {
			if (event.target === this.el.addDialog) {
				this.el.addDialog.close();
			}
		});
	},

	openAddTodoDialog(status = 'todo') {
		if (!this.el.addDialog || !this.el.addForm) return;

		this.el.addForm.reset();
		if (this.el.addStatusInput) {
			this.el.addStatusInput.value = status;
		}

		this.el.addDialog.showModal();
		queueMicrotask(() => {
			this.el.addTitleInput?.focus();
		});
	},

	bindAddTodoForm(onSubmit) {
		this.el.addForm?.addEventListener('submit', (event) => {
			event.preventDefault();

			const text = this.el.addTitleInput?.value?.trim() || '';
			const dueDate = this.el.addDateInput?.value || '';
			const status = this.el.addStatusInput?.value || 'todo';

			if (text === '') {
				this.el.addTitleInput?.focus();
				return;
			}

			onSubmit({ text, dueDate, status });
			this.el.addDialog?.close();
		});
	},

	bindSortSelect(onChange) {
		this.el.sortSelect?.addEventListener('change', (event) => {
			onChange(event.target.value);
		});
	},

	setSortValue(value) {
		if (this.el.sortSelect) {
			this.el.sortSelect.value = value;
		}
	},

	render(todos, handlers, options = {}) {
		const todoList = getListByStatus('todo');
		const doingList = getListByStatus('doing');
		const doneList = getListByStatus('done');
		if (!todoList || !doingList || !doneList) return;

		getItemTemplate();
		bindDropZones(handlers);

		todoList.innerHTML = '';
		doingList.innerHTML = '';
		doneList.innerHTML = '';

		todos.forEach((todo) => {
			const status = todo.status || 'todo';
			const list = getListByStatus(status);
			if (!list) return;

			const li = createListItem({ ...todo, status }, handlers, options);
			list.appendChild(li);
		});
	}
};
