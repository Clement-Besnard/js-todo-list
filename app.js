class Task {
    constructor(name, content, columnId, priority) {
        this.id = Math.random().toString(36).substr(2, 9); 
        this.name = name;
        this.content = content;
        this.columnId = columnId;
        this.priority = priority;
    }

    createElement() {
        const taskElement = document.createElement('div');
        taskElement.className = `task ${this.columnId}`;
        taskElement.draggable = true;
        taskElement.addEventListener('dragstart', handleDragStart);
        taskElement.addEventListener('dragend', handleDragEnd);
        taskElement.setAttribute('data-task-id', this.id);

        if (this.priority === 'urgent') {
            taskElement.style.backgroundColor = '#ffcccc';
            taskElement.style.borderLeft = '5px solid #ff0000';
        } else if (this.priority === 'normal') {
            taskElement.style.backgroundColor = '#ffffcc';
            taskElement.style.borderLeft = '5px solid #ffcc00';
        } else if (this.priority === 'relax') {
            taskElement.style.backgroundColor = '#ccffcc';
            taskElement.style.borderLeft = '5px solid #00cc00';
        }

        const taskInfo = document.createElement('div');
        taskInfo.innerHTML = `<strong>${this.name}</strong><br>${this.content}`;

        const taskActions = document.createElement('div');
        taskActions.innerHTML = `
            <button onclick="editTask(this)">✏️</button>
            <button onclick="deleteTask(this)">❌</button>
        `;

        taskElement.appendChild(taskInfo);
        taskElement.appendChild(taskActions);
        return taskElement;
    }
}


let tasks = [];
let draggedTask = null;
let editingTaskId = null;

function addTask(columnId) {
    openTaskForm(columnId);
}

function deleteTask(button) {
    const taskElement = button.parentElement.parentElement;
    const taskId = taskElement.getAttribute('data-task-id');

    const newTasks = [];
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id !== taskId) {
            newTasks.push(tasks[i]);
        }
    }

    tasks = newTasks;
    renderTasks();
}

function editTask(button) {
    const taskElement = button.parentElement.parentElement;
    const taskId = taskElement.getAttribute('data-task-id');

    let task = null;

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
            task = tasks[i];
            break;
        }
    }

    if (task) {
        openTaskForm(task.columnId, task);
    }
}

function handleDragStart(e) {
    draggedTask = e.target.getAttribute('data-task-id');
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const column = e.target.closest('.column');
    if (!column){
        return;
    };

    const columnId = column.id;
    let task = null;

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === draggedTask) {
            task = tasks[i];
            break;
        }
    }

    if (task) {
        task.columnId = columnId;
        renderTasks();
    }
}

function renderTasks() {
    const columns = {
        'todo': document.querySelector('#todo .task-list'),
        'in-progress': document.querySelector('#in-progress .task-list'),
        'done': document.querySelector('#done .task-list')
    };

    const columnValues = Object.values(columns);
    for (let i = 0; i < columnValues.length; i++) {
        columnValues[i].innerHTML = '';
    }

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const taskElement = task.createElement();
        columns[task.columnId].appendChild(taskElement);
    }
}


let enterKeyListenerAdded = false;

function openTaskForm(columnId, task = null) {
    const formElement = document.getElementById('taskForm');

    if (!enterKeyListenerAdded) {
        formElement.addEventListener('keydown', handleEnterKey);
        enterKeyListenerAdded = true;
    }

    if (task) {
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskContent').value = task.content;
        document.getElementById('taskPriority').value = task.priority;
        editingTaskId = task.id;
    } else {
        document.getElementById('taskForm').reset();
        editingTaskId = null;
    }

    document.getElementById('taskColumnId').value = columnId;
    document.getElementById('taskFormPopup').style.display = 'flex';
}

function handleEnterKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        submitTaskForm();
    }
}

function closeTaskForm() {
    document.getElementById('taskForm').reset();
    document.getElementById('taskFormPopup').style.display = 'none';
}

function submitTaskForm() {
    const taskName = document.getElementById('taskName').value.trim();
    const taskContent = document.getElementById('taskContent').value.trim();
    const columnId = document.getElementById('taskColumnId').value;
    const taskPriority = document.getElementById('taskPriority').value;

    if (!taskName || !taskContent || !taskPriority) {
        alert("Tous les champs doivent être remplis avant d'ajouter une tâche.");
        return;
    }

    let taskExists = false;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].name.toLowerCase() === taskName.toLowerCase()) {
            taskExists = true;
            break;
        }
    }

    if (taskExists && !editingTaskId) {
        alert("Une tâche avec ce nom existe déjà. Veuillez choisir un autre nom.");
        return;
    }

    let task = null;
    if (editingTaskId) {
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].id === editingTaskId) {
                task = tasks[i];
                break;
            }
        }

        if (task) {
            task.name = taskName;
            task.content = taskContent;
            task.priority = taskPriority;
        }
    } else {
        task = new Task(taskName, taskContent, columnId);
        task.priority = taskPriority;
        tasks.push(task);
    }

    renderTasks();
    closeTaskForm();
}

document.addEventListener('DOMContentLoaded', () => {
    const formElement = document.getElementById('taskForm');
    formElement.addEventListener('keydown', handleEnterKey);
    enterKeyListenerAdded = true;
});

const columns = document.querySelectorAll('.column');

for (let i = 0; i < columns.length; i++) {
    const column = columns[i];
    const taskList = column.querySelector('.task-list');
    taskList.addEventListener('dragover', handleDragOver);
    taskList.addEventListener('drop', handleDrop);
}

