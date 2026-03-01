import { TodoModel } from "./model.js";
import { TodoView } from "./view.js";

const CARD_STATUS_BY_CLASS = {
  "card--todo": "todo",
  "card--doing": "doing",
  "card--done": "done"
};

const ALLOWED_STATUS = ["todo", "doing", "done"];

const getStatusFromButton = (button) => {
  const card = button.closest(".card");
  if (!card) return "todo";

  const className = Object.keys(CARD_STATUS_BY_CLASS).find((name) => card.classList.contains(name));
  return className ? CARD_STATUS_BY_CLASS[className] : "todo";
};

export const TodoController = {
  init() {
    const addBtns = document.querySelectorAll(".card__add-btn");

    addBtns.forEach((addBtn) => {
      addBtn.addEventListener("click", () => {
        const text = prompt("タスクを追加");
        if (text === null) return;

        const status = getStatusFromButton(addBtn);
        this.addTodo(text.trim(), status);
      });
    });

    this.loadTodos();
  },

  loadTodos() {
    const todos = TodoModel.todos.map((todo) => ({
      ...todo,
      status: ALLOWED_STATUS.includes(todo.status) ? todo.status : "todo"
    }));

    TodoView.render(todos, {
      onDelete: (id) => this.deleteTodo(id),
      onUpdate: (id, newText) => this.updateTodo(id, newText),
      onMove: (id, status) => this.moveTodo(id, status)
    });
  },

  addTodo(text, status = "todo") {
    const todos = TodoModel.todos;
    const nextStatus = ALLOWED_STATUS.includes(status) ? status : "todo";

    todos.push({
      id: Date.now(),
      text,
      status: nextStatus
    });

    TodoModel.todos = todos;
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

    if (target && newText && newText.trim() !== "") {
      target.text = newText.trim();
      TodoModel.todos = todos;
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
  }
};
