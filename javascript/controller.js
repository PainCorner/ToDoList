const TodoController = {
  init: () => {
    const addBtn = document.querySelector(
      ".task-actions__btn--add"
    );

    addBtn.addEventListener("click", () => {
      const text = prompt("タスクを追加");
      if (text && text.trim() !== "") {
        TodoModel.add(text);
        TodoController.loadTodos();
      }
    });

    TodoController.loadTodos();
  },

  loadTodos: () => {
    const todos = TodoModel.getAll();
    TodoView.render(todos);
  },

  deleteTodo: (id) => {
    TodoModel.remove(id);
    TodoController.loadTodos();
  },

  updateTodo: (id, text) => {
    TodoModel.update(id, text);
    TodoController.loadTodos();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  TodoController.init();
});