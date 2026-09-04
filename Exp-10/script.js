/* =========================================
   ELEMENTS
========================================= */

const taskInput = document.getElementById("taskInput");

const deadlineInput =
    document.getElementById("deadlineInput");

const addButton =
    document.getElementById("addButton");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressText");

const taskCount =
    document.getElementById("taskCount");

const todayDate =
    document.getElementById("todayDate");


/* =========================================
   TASKS
========================================= */

let tasks = [];


/* =========================================
   LOAD TASKS
========================================= */

function loadTasks() {

    try {

        const savedTasks =
            localStorage.getItem("todoTasks");

        if (!savedTasks) {
            tasks = [];
            return;
        }

        const parsed =
            JSON.parse(savedTasks);

        if (!Array.isArray(parsed)) {
            tasks = [];
            return;
        }

        /*
            Clean old/broken data so the app
            doesn't crash if localStorage has
            unexpected values.
        */

        tasks = parsed
            .filter(task =>
                task &&
                typeof task.text === "string"
            )
            .map(task => ({
                id: task.id ?? Date.now() + Math.random(),

                text: task.text,

                completed:
                    Boolean(task.completed),

                deadline:
                    typeof task.deadline === "string"
                        ? task.deadline
                        : ""
            }));

    } catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );

        tasks = [];
    }
}


/* =========================================
   SAVE TASKS
========================================= */

function saveTasks() {

    try {

        localStorage.setItem(
            "todoTasks",
            JSON.stringify(tasks)
        );

    } catch (error) {

        console.error(
            "Could not save tasks:",
            error
        );

    }
}


/* =========================================
   GET TODAY
========================================= */

function getToday() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =========================================
   DISPLAY TODAY
========================================= */

function displayToday() {

    const date = new Date();

    todayDate.textContent =
        date.toLocaleDateString(
            "en-US",
            {
                weekday: "short",
                month: "short",
                day: "numeric"
            }
        );
}


/* =========================================
   SET CALENDAR MINIMUM DATE
========================================= */

function setupCalendar() {

    /*
        Prevent selecting dates before today.
    */

    deadlineInput.min = getToday();

    /*
        Do NOT set opacity or manipulate the
        native date picker here.

        The browser handles the date picker.
    */

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(value) {

    if (!value) {
        return "";
    }

    /*
        Using T00:00:00 prevents timezone
        shifting the selected date.
    */

    const date =
        new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}


/* =========================================
   DEADLINE INFORMATION
========================================= */

function deadlineInfo(value) {

    if (!value) {
        return null;
    }

    const today =
        new Date(`${getToday()}T00:00:00`);

    const deadline =
        new Date(`${value}T00:00:00`);

    if (
        Number.isNaN(
            deadline.getTime()
        )
    ) {
        return null;
    }

    const difference =
        deadline.getTime() -
        today.getTime();

    const days =
        Math.round(
            difference / 86400000
        );


    /* OVERDUE */

    if (days < 0) {

        return {

            text:
                `Deadline passed • ${formatDate(value)}`,

            className:
                "overdue"
        };
    }


    /* TODAY */

    if (days === 0) {

        return {

            text:
                `Due today • ${formatDate(value)}`,

            className:
                "today"
        };
    }


    /* TOMORROW */

    if (days === 1) {

        return {

            text:
                `1 day left • ${formatDate(value)}`,

            className:
                "normal"
        };
    }


    /* FUTURE */

    return {

        text:
            `${days} days left • ${formatDate(value)}`,

        className:
            "normal"
    };
}


/* =========================================
   ADD TASK
========================================= */

function addTask() {

    const text =
        taskInput.value.trim();

    const deadline =
        deadlineInput.value;


    /*
        Don't add empty tasks.
    */

    if (!text) {

        taskInput.focus();

        return;
    }


    /*
        Create task.
    */

    const task = {

        id:
            `${Date.now()}-${Math.random()}`,

        text:
            text,

        completed:
            false,

        deadline:
            deadline || ""
    };


    tasks.push(task);

    saveTasks();


    /*
        Clear inputs.
    */

    taskInput.value = "";

    deadlineInput.value = "";


    /*
        Update UI.
    */

    renderTasks();

    taskInput.focus();
}


/* =========================================
   TOGGLE TASK
========================================= */

function toggleTask(id) {

    tasks =
        tasks.map(task => {

            if (task.id === id) {

                return {
                    ...task,
                    completed:
                        !task.completed
                };
            }

            return task;
        });


    saveTasks();

    renderTasks();
}


/* =========================================
   DELETE TASK
========================================= */

function deleteTask(id) {

    tasks =
        tasks.filter(
            task => task.id !== id
        );


    saveTasks();

    renderTasks();
}


/* =========================================
   CREATE CHECK BUTTON
========================================= */

function createCheckButton(task) {

    const check =
        document.createElement("button");

    check.type = "button";

    check.className =
        "check-button";

    check.textContent = "✓";

    check.setAttribute(
        "aria-label",
        task.completed
            ? "Mark task as incomplete"
            : "Mark task as completed"
    );

    check.addEventListener(
        "click",
        () => toggleTask(task.id)
    );

    return check;
}


/* =========================================
   CREATE TASK INFO
========================================= */

function createTaskInfo(task) {

    const info =
        document.createElement("div");

    info.className =
        "task-info";


    /* TITLE */

    const title =
        document.createElement("p");

    title.className =
        "task-title";

    title.textContent =
        task.text;


    /* STATUS */

    const status =
        document.createElement("small");

    status.className =
        "task-status";

    status.textContent =
        task.completed
            ? "Completed"
            : "Not completed";


    info.appendChild(title);

    info.appendChild(status);


    /* DEADLINE */

    if (task.deadline) {

        const deadline =
            deadlineInfo(task.deadline);

        if (deadline) {

            const deadlineElement =
                document.createElement("span");

            deadlineElement.className =
                `deadline ${deadline.className}`;

            deadlineElement.textContent =
                `📅 ${deadline.text}`;

            info.appendChild(
                deadlineElement
            );
        }
    }


    return info;
}


/* =========================================
   CREATE DELETE BUTTON
========================================= */

function createDeleteButton(task) {

    const button =
        document.createElement("button");

    button.type = "button";

    button.className =
        "delete-button";

    button.textContent = "×";

    button.setAttribute(
        "aria-label",
        `Delete task: ${task.text}`
    );

    button.addEventListener(
        "click",
        () => deleteTask(task.id)
    );

    return button;
}


/* =========================================
   CREATE TASK ELEMENT
========================================= */

function createTaskElement(task) {

    const taskElement =
        document.createElement("div");

    taskElement.className =
        "task";


    if (task.completed) {

        taskElement.classList.add(
            "completed"
        );
    }


    /* LEFT */

    const left =
        document.createElement("div");

    left.className =
        "task-left";


    /* CHECK */

    const check =
        createCheckButton(task);


    /* INFO */

    const info =
        createTaskInfo(task);


    /* DELETE */

    const deleteButton =
        createDeleteButton(task);


    /* BUILD */

    left.appendChild(check);

    left.appendChild(info);

    taskElement.appendChild(left);

    taskElement.appendChild(
        deleteButton
    );


    return taskElement;
}


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

    taskList.innerHTML = "";


    /*
        Empty state.
    */

    if (tasks.length === 0) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";
    }


    /*
        Render every task.
    */

    tasks.forEach(task => {

        const taskElement =
            createTaskElement(task);

        taskList.appendChild(
            taskElement
        );

    });


    updateProgress();
}


/* =========================================
   UPDATE PROGRESS
========================================= */

function updateProgress() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const percentage =
        total === 0
            ? 0
            : (completed / total) * 100;


    progressBar.style.width =
        `${percentage}%`;


    progressText.textContent =
        `${completed} of ${total} completed`;


    taskCount.textContent =
        total === 1
            ? "1 task"
            : `${total} tasks`;
}


/* =========================================
   ADD BUTTON
========================================= */

addButton.addEventListener(
    "click",
    addTask
);


/* =========================================
   ENTER TO ADD
========================================= */

taskInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            addTask();
        }

    }
);


/* =========================================
   CALENDAR CLICK
========================================= */

/*
    Clicking the calendar box opens the
    native date picker where supported.

    The input itself is still a real date input,
    so mobile browsers will also use their
    native calendar interface.
*/

const calendarBox =
    document.querySelector(".calendar-box");

calendarBox.addEventListener(
    "click",
    event => {

        /*
            If the actual input was clicked,
            let the browser handle it normally.
        */

        if (
            event.target === deadlineInput
        ) {
            return;
        }

        /*
            Modern browsers support showPicker().
        */

        if (
            typeof deadlineInput.showPicker ===
            "function"
        ) {

            try {

                deadlineInput.showPicker();

            } catch (error) {

                /*
                    Some browsers block
                    showPicker in certain cases.
                    The input itself remains usable.
                */

                deadlineInput.focus();
            }

        } else {

            deadlineInput.focus();
        }

    }
);


/* =========================================
   INITIALIZE
========================================= */

loadTasks();

displayToday();

setupCalendar();

renderTasks();


/* =========================================
   UPDATE DATE DISPLAY
========================================= */

setInterval(
    () => {

        displayToday();

        /*
            Re-render so deadline labels
            update when the day changes.
        */

        renderTasks();

    },
    60000
);