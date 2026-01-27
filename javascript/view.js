const TodoView = {
  render: (todos) => {
    const list = document.getElementById("list");
    list.innerHTML = "";

    todos.forEach(todo => {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.textContent = todo.text;
      span.style.cursor = "pointer";

      span.addEventListener("click", () => {
        const newText = prompt("更新", todo.text);
        if (newText !== null) {
          TodoController.updateTodo(todo.id, newText);
        }
      });

      const btn = document.createElement("button");
      btn.textContent = "削除";

      btn.addEventListener("click", () => {
        TodoController.deleteTodo(todo.id);
      });

      li.appendChild(span);
      li.appendChild(btn);
      list.appendChild(li);
    });
  }
};