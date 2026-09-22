// --- состояние приложения ---
// единственный источник правды: массив объектов задач
let tasks = [];
let nextId = 1;          // счётчик для уникальных id
let currentFilter = "all"; // "all" | "active" | "completed"

// --- элементы DOM ---
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const warningEl = document.getElementById("warning");
const taskListEl = document.getElementById("taskList");
const statsEl = document.getElementById("stats");
const filterBtns = document.querySelectorAll(".filter-btn");

// --- добавление задачи ---
function addTask() {
  const text = taskInput.value.trim();

  if (text === "") {
    warningEl.textContent = "Введите текст задачи";
    return;
  }

  tasks.push({ id: nextId++, text: text, completed: false });

  taskInput.value = "";
  warningEl.textContent = "";
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.completed = !task.completed;
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  render();
}

// --- рендер: единственное место, где список рисуется на экране ---
// вызывается после любого изменения данных, DOM всегда строится заново из tasks[]
function render() {
  // какие задачи показывать при текущем фильтре
  const visibleTasks = tasks.filter((t) => {
    if (currentFilter === "active") return !t.completed;
    if (currentFilter === "completed") return t.completed;
    return true;
  });

  taskListEl.innerHTML = "";

  if (visibleTasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Список пуст";
    taskListEl.appendChild(empty);
  }

  visibleTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const span = document.createElement("span");
    span.className = "task-text" + (task.completed ? " completed" : "");
    span.textContent = task.text;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Удалить";
    delBtn.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, span, delBtn);
    taskListEl.appendChild(li);
  });

  // счётчик: считаем через filter, а не храним отдельно, чтобы не рассинхронизироваться
  const activeCount = tasks.filter((t) => !t.completed).length;
  const doneCount = tasks.filter((t) => t.completed).length;
  statsEl.textContent = `Осталось: ${activeCount}, Выполнено: ${doneCount}`;
}

// --- обработчики событий ---
addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

render();
