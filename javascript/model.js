const TodoModel = {
  STORAGE_KEY: "todos",

  getAll: () => {
    const json = localStorage.getItem(TodoModel.STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  },

  saveAll: (todos) => {
    localStorage.setItem(
      TodoModel.STORAGE_KEY,
      JSON.stringify(todos)
    );
  },

  add: (text) => {
    const todos = TodoModel.getAll();
    todos.push({
      id: Date.now(),
      text: text
    });
    TodoModel.saveAll(todos);
  },

  remove: (id) => {
    const todos = TodoModel
      .getAll()
      .filter(todo => todo.id !== id);
    TodoModel.saveAll(todos);
  },

  update: (id, newText) => {
    const todos = TodoModel.getAll();
    const target = todos.find(todo => todo.id === id);
    if (target) {
      target.text = newText;
      TodoModel.saveAll(todos);
    }
  },

  clear: () => {
    localStorage.removeItem(TodoModel.STORAGE_KEY);
  }
};