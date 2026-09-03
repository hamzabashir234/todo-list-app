const todoForm = document.getElementById("todoForm");
const inp = document.getElementById("input");
const ul = document.getElementById("todoList");
const counter = document.getElementById("taskCounter");

const search = document.getElementById("search");

const allBtn = document.getElementById("allBtn");
const activeBtn = document.getElementById("activeBtn");
const completedBtn = document.getElementById("completedBtn");
const filterBtns = [allBtn, activeBtn, completedBtn];

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

let tasks = []; 
let currentFilter = "all";
let editingId = null;

const loadTasks = () => {
    const stored = localStorage.getItem("tasks");
    tasks = stored ? JSON.parse(stored) : [];
};

const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};
const generateId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const resetInput = () => {
    inp.value = "";
    inp.focus();
};

const updateCounter = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;

    if (total === 0) {
        counter.textContent = "No tasks yet";
    } else if (completed === total) {
        counter.textContent = "All Tasks Completed";
    } else {
        counter.textContent = `${completed} out of ${total} completed!`;
    }
};

const matchesFilter = (task) => {
    if (currentFilter === "completed") return task.completed;
    if (currentFilter === "active") return !task.completed;
    return true;
};

const matchesSearch = (task) => {
    const term = search.value.trim().toLowerCase();
    return !term || task.text.toLowerCase().includes(term);
};

const setFilter = (filter, btn) => {
    currentFilter = filter;
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render();
};

const saveEdit = (id, newText) => {
    const trimmed = newText.trim();
    const task = tasks.find(t => t.id === id);
    if (task && trimmed) {
        task.text = trimmed;
    }
    editingId = null;
    saveTasks();
    render();
};

const render = () => {
    ul.innerHTML = "";

    const visibleTasks = tasks.filter(t => matchesFilter(t) && matchesSearch(t));

    if (tasks.length && !visibleTasks.length) {
        const empty = document.createElement("li");
        empty.className = "empty";
        empty.textContent = "No matching tasks";
        ul.append(empty);
    }

    visibleTasks.forEach(task => {
        const li = document.createElement("li");

        const leftDiv = document.createElement("div");
        leftDiv.classList.add("task-left");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        if (task.id === editingId) {
            const editInput = document.createElement("input");
            editInput.type = "text";
            editInput.value = task.text;
            editInput.classList.add("edit-input");

            editInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") saveEdit(task.id, editInput.value);
                if (e.key === "Escape") { editingId = null; render(); }
            });
            editInput.addEventListener("blur", () => saveEdit(task.id, editInput.value));

            leftDiv.append(checkbox, editInput);
        } else {
            const span = document.createElement("span");
            span.textContent = task.text;
            span.classList.toggle("completed", task.completed);
            leftDiv.append(checkbox, span);
        }
        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("task-actions");

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.classList.add("edit-btn");
        editBtn.textContent = task.id === editingId ? "Save" : "Edit";

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.classList.add("dlt-btn");
        delBtn.textContent = "Delete";

        actionsDiv.append(editBtn, delBtn);
        li.append(leftDiv, actionsDiv);
        ul.append(li);

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            render();
        });

        editBtn.addEventListener("click", () => {
            if (task.id === editingId) {
                const editInput = leftDiv.querySelector(".edit-input");
                saveEdit(task.id, editInput.value);
            } else {
                editingId = task.id;
                render();
            }
        });

        delBtn.addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            if (editingId === task.id) editingId = null;
            saveTasks();
            render();
        });

        if (task.id === editingId) {
            const editInput = leftDiv.querySelector(".edit-input");
            editInput.focus();
            editInput.select();
        }
    });

    updateCounter();
};

const createTask = (text) => {
    tasks.push({ id: generateId(), text, completed: false });
    saveTasks();
    render();
};

const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

const getStoredTheme = () => localStorage.getItem("theme"); // "light" | "dark" | null

const getEffectiveTheme = () =>
    getStoredTheme() || (systemPrefersDark.matches ? "dark" : "light");

const updateThemeIcon = () => {
    themeIcon.textContent = getEffectiveTheme() === "dark" ? "light_mode" : "dark_mode";
};

const applyStoredTheme = () => {
    const stored = getStoredTheme();
    if (stored) {
        document.documentElement.setAttribute("data-theme", stored);
    } else {
        document.documentElement.removeAttribute("data-theme");
    }
    updateThemeIcon();
};

themeToggle.addEventListener("click", () => {
    const next = getEffectiveTheme() === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyStoredTheme();
});

systemPrefersDark.addEventListener("change", () => {
    if (!getStoredTheme()) {
        updateThemeIcon();
    }
});

todoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const value = inp.value.trim();
    if (!value) {
        resetInput();
        return;
    }

    createTask(value);
    resetInput();
});

search.addEventListener("input", render);

allBtn.addEventListener("click", () => setFilter("all", allBtn));
activeBtn.addEventListener("click", () => setFilter("active", activeBtn));
completedBtn.addEventListener("click", () => setFilter("completed", completedBtn));

applyStoredTheme();
allBtn.classList.add("active");
loadTasks();
render();
