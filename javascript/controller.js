const TodoController = {
  init: () => {
    document.getElementById("save").addEventListener("click", () => {
      const input = document.getElementById("todo");
      if (input.value.trim() !== "") {
        TodoModel.add(input.value);
        input.value = "";
        TodoController.loadTodos();
      }
    });

    document.getElementById("delete").addEventListener("click", () => {
      TodoModel.clear();
      TodoController.loadTodos();
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