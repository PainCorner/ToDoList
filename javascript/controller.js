import { TodoModel } from "./model.js";
import { TodoView } from "./view.js";

export const TodoController = {
  init() {
    const addBtn = document.querySelector(".task-actions__btn--add");

    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const text = prompt("タスクを追加");
        if (text && text.trim() !== "") {
          this.addTodo(text.trim());
        }
      });
    }

    this.loadTodos();
  },

  loadTodos() {
    const todos = TodoModel.todos.map((todo) => ({
      ...todo,
      status: todo.status || "todo"
    }));

    TodoView.render(todos, {
      onDelete: (id) => this.deleteTodo(id),
      onUpdate: (id, newText) => this.updateTodo(id, newText),
      onMove: (id, status) => this.moveTodo(id, status)
    });
  },

  addTodo(text) {
    const todos = TodoModel.todos;

    todos.push({
      id: Date.now(),
      text,
      status: "todo"
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
    if (!["todo", "doing", "done"].includes(status)) return;

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
