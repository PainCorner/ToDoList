const TodoView = {
  render: (todos) => {
    // 「開始前」カラムの ul を取得
    const list = document.querySelector(
      ".card--todo .card__list"
    );
    list.innerHTML = "";

    todos.forEach(todo => {
      const li = document.createElement("li");
      li.className = "card__item";

      const label = document.createElement("label");
      label.className = "card__label";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "card__checkbox";

      const span = document.createElement("span");
      span.className = "card__text";
      span.textContent = todo.text;
      span.style.cursor = "pointer";

      span.addEventListener("click", () => {
        const newText = prompt("更新", todo.text);
        if (newText !== null) {
          TodoController.updateTodo(todo.id, newText);
        }
      });

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card__del-btn";
      btn.textContent = "削除";

      btn.addEventListener("click", () => {
        TodoController.deleteTodo(todo.id);
      });

      label.appendChild(checkbox);
      label.appendChild(span);

      li.appendChild(label);
      li.appendChild(btn);
      list.appendChild(li);
    });
  }
};