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

const EMPTY_TASK_LABEL = '・域悴險伜・繧ｿ繧ｹ繧ｯ・・;';

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

  let textNode = li.querySelector('.card__text');
  if (!textNode) {
    textNode = document.createElement('span');
    textNode.className = 'card__text';
    label.appendChild(textNode);
  }

  textNode.textContent = todo.text && todo.text.trim() !== '' ? todo.text : EMPTY_TASK_LABEL;
  textNode.style.cursor = 'pointer';
  const beginEdit = () => {
    startInlineEdit(li, textNode, todo, handlers);
  };
  textNode.addEventListener('dblclick', beginEdit);
  label.addEventListener('dblclick', (event) => {
    if (event.target === checkbox) return;
    beginEdit();
  });

  if (String(options.editingTodoId) === String(todo.id)) {
    startInlineEdit(li, textNode, todo, handlers);
  }

  let menuBtn = li.querySelector('.card__del-btn');
  if (!menuBtn) {
    menuBtn = document.createElement('button');
    menuBtn.type = 'button';
    menuBtn.className = 'card__del-btn';
    menuBtn.textContent = '蜑企勁';
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

// 期限日周りの設定
const DueDateManger = {
  CARD_DUE_DATE_BTN: '.card__due-date-btn',
  dueDate: document.querySelector('.card__due-date-value'),

  initDueDate(callback) {
    // DateTimePickerの設定（外部ライブラリ）
    flatpickr(this.CARD_DUE_DATE_BTN, {
      locale: 'ja',
      dateFormat: 'Y-m-d',
      onChange: (selectedDates, dateStr) => {
        const [year, month, day] = dateStr.split('-');

        this.dueDate.textContent = `${year}年${month}月${day}日`;
        // date-time属性に日付を設定
        this.dueDate.setAttribute('datetime', dateStr);

        // 呼び出された際データを返すためもの
        if (callback) callback(dateStr);
      }
    });
  }
}

// 使用例
// DueDateManager.initDueDate((date) => {
//   console.log('受け取った日付:', date);
// });

export const TodoView = {
  selectors: {
    sortBtn: '.main-header__sort-btn'
  },

  el: {},

  init() {
    Object.keys(this.selectors).forEach((key) => {
      this.el[key] = document.querySelector(this.selectors[key]);
    });

    DueDateManger.initDueDate();
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
