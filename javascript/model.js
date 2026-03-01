const STORAGE_KEY = "todos";

export const TodoModel = {
  get todos() {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  },

  set todos(value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
