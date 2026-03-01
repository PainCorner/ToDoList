const STATUS_TO_CLASS = {
  todo: "card__item--todo",
  doing: "card__item--doing",
  done: "card__item--done"
};

const STATUS_TO_SELECTOR = {
  todo: ".card--todo .card__list",
  doing: ".card--doing .card__list",
  done: ".card--done .card__list"
};
const EMPTY_TASK_LABEL = "（未記入タスク）";

let itemTemplate = null;
let dropBound = false;

const getListByStatus = (status) => {
  return document.querySelector(STATUS_TO_SELECTOR[status]);
};

const getItemTemplate = () => {
  if (itemTemplate) return itemTemplate;

  const base = document.querySelector(".card__list .card__item");
  if (base) {
    itemTemplate = base.cloneNode(true);
    return itemTemplate;
  }

  return null;
};

const createListItem = (todo, handlers) => {
  const template = getItemTemplate();
  const li = template ? template.cloneNode(true) : document.createElement("li");

  li.className = `card__item ${STATUS_TO_CLASS[todo.status] || STATUS_TO_CLASS.todo}`;
  li.draggable = true;
  li.dataset.id = String(todo.id);

  let label = li.querySelector(".card__label");
  if (!label) {
    label = document.createElement("label");
    label.className = "card__label";
    li.appendChild(label);
  }

  let checkbox = li.querySelector(".card__checkbox");
  if (!checkbox) {
    checkbox = document.createElement("input");
    checkbox.className = "card__checkbox";
    checkbox.type = "checkbox";
    label.prepend(checkbox);
  }

  checkbox.checked = todo.status === "done";
  checkbox.addEventListener("change", () => {
    handlers.onMove(todo.id, checkbox.checked ? "done" : "todo");
  });

  let textNode = li.querySelector(".card__text");
  if (!textNode) {
    textNode = document.createElement("span");
    textNode.className = "card__text";
    label.appendChild(textNode);
  }

  textNode.textContent = todo.text && todo.text.trim() !== "" ? todo.text : EMPTY_TASK_LABEL;
  textNode.style.cursor = "pointer";
  textNode.addEventListener("click", () => {
    const newText = prompt("タスクを更新", todo.text);
    if (newText !== null) {
      handlers.onUpdate(todo.id, newText);
    }
  });

  let menuBtn = li.querySelector(".card__menu-btn");
  if (!menuBtn) {
    menuBtn = document.createElement("button");
    menuBtn.type = "button";
    menuBtn.className = "card__menu-btn";
    menuBtn.textContent = "削除";
    li.appendChild(menuBtn);
  }

  menuBtn.addEventListener("click", () => {
    handlers.onDelete(todo.id);
  });

  li.addEventListener("dragstart", (event) => {
    if (!event.dataTransfer) return;
    event.dataTransfer.setData("text/plain", String(todo.id));
    event.dataTransfer.effectAllowed = "move";
  });

  return li;
};

const attachDropHandlers = (target, status, handlers) => {
  target.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  });

  target.addEventListener("drop", (event) => {
    event.preventDefault();
    if (!event.dataTransfer) return;

    const id = event.dataTransfer.getData("text/plain");
    if (id !== "") {
      handlers.onMove(id, status);
    }
  });
};

const bindDropZones = (handlers) => {
  if (dropBound) return;

  Object.keys(STATUS_TO_SELECTOR).forEach((status) => {
    const list = getListByStatus(status);
    if (!list) return;

    list.style.minHeight = "96px";
    attachDropHandlers(list, status, handlers);
  });

  dropBound = true;
};

export const TodoView = {
  render(todos, handlers) {
    const todoList = getListByStatus("todo");
    const doingList = getListByStatus("doing");
    const doneList = getListByStatus("done");
    if (!todoList || !doingList || !doneList) return;

    getItemTemplate();
    bindDropZones(handlers);

    todoList.innerHTML = "";
    doingList.innerHTML = "";
    doneList.innerHTML = "";

    todos.forEach((todo) => {
      const status = todo.status || "todo";
      const list = getListByStatus(status);
      if (!list) return;

      const li = createListItem({ ...todo, status }, handlers);
      list.appendChild(li);
    });
  }
};
