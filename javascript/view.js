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

let itemTemplate = null;
let dropBound = false;

const getListByStatus = (status) => {
  return document.querySelector(STATUS_TO_SELECTOR[status]);
};

const getItemTemplate = () => {
  if (itemTemplate) return itemTemplate;

  const base = document.querySelector(".card--todo .card__list .card__item");
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
  li.style.display = "flex";
  li.style.alignItems = "center";

  let textNode = li.querySelector(".card__text");
  if (!textNode) {
    textNode = document.createElement("span");
    textNode.className = "card__text";
    li.appendChild(textNode);
  }

  textNode.textContent = todo.text;
  textNode.style.cursor = "pointer";
  textNode.addEventListener("click", () => {
    const newText = prompt("タスクを更新", todo.text);
    if (newText !== null) {
      handlers.onUpdate(todo.id, newText);
    }
  });

  let delBtn = li.querySelector(".card__del-btn");
  if (!delBtn) {
    delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "card__del-btn";
    delBtn.textContent = "削除";
    li.appendChild(delBtn);
  }

  delBtn.style.marginLeft = "auto";
  delBtn.style.display = "inline-flex";
  delBtn.style.alignItems = "center";
  delBtn.style.justifyContent = "center";
  delBtn.addEventListener("click", () => {
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

    const content = list.closest(".card__content");
    list.style.minHeight = "96px";

    attachDropHandlers(list, status, handlers);
    if (content) {
      attachDropHandlers(content, status, handlers);
    }
  });

  dropBound = true;
};

export const TodoView = {
  render(todos, handlers) {
    const todoList = getListByStatus("todo");
    const doingList = getListByStatus("doing");
    const doneList = getListByStatus("done");
    if (!todoList || !doingList || !doneList) return;

    // Capture initial index.html item markup (including delete button SVG).
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
