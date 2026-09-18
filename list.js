const inputBox = document.getElementById("input-box");
const dueDateInput = document.getElementById("due-date");
const listContainer = document.getElementById("list-container");
const todoHeader = document.getElementById("todo-header");
const userId = localStorage.getItem("userId");

async function loadUserName(){
    if(!userId){
        window.location.href = "login.html";
        return;
    }

    try {
        const user = await requestJson(`/users/${userId}`);
        if(todoHeader){
            todoHeader.innerHTML = '<img src="images/butterflyright.gif" alt="blue butterfly"> ' + user.username + "'s To-Do List <img src=\"images/butterflyright.gif\" alt=\"blue butterfly\">";
        }
    } catch (error) {
        if(todoHeader){
            todoHeader.innerHTML = '<img src="images/butterflyright.gif" alt="blue butterfly"> My To-Do List <img src="images/butterflyright.gif" alt="blue butterfly">';
        }
    }
}

async function requestJson(url, options){
    const response = await fetch(url, options);
    const responseText = await response.text();
    let data;

    try {
        data = responseText ? JSON.parse(responseText) : {};
    } catch {
        throw new Error("The todo API returned HTML instead of JSON. Open todo.html at http://localhost:3000/todo.html and restart the server.");
    }

    if(!response.ok){
        throw new Error(data.message || "The todo request failed");
    }

    return data;
}

function getDaysLeft(dueDate){
    const [month, day, year] = dueDate.split("/").map(Number);
    const due = new Date(year, month - 1, day);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function formatCountdownText(dueDate){
    const daysLeft = getDaysLeft(dueDate);

    if(daysLeft < 0){
        return "Overdue by " + Math.abs(daysLeft) + " day" +
            (Math.abs(daysLeft) === 1 ? "" : "s");
    }

    return daysLeft + " day" +
        (daysLeft === 1 ? "" : "s") + " left";
}

function updateCountdowns(){
    listContainer.querySelectorAll("li[data-due-date]").forEach(function(li){
        const countdown = li.querySelector(".due-countdown");
        if(!countdown){
            return;
        }

        countdown.textContent = formatCountdownText(li.dataset.dueDate);
    });
}

//add a task to the database
function addTask(){
    const text = inputBox.value.trim();
    const dueDate = dueDateInput.value.trim();

    if(text === ""){
        alert("Silly! You have to write a task!");
        return;
    }

    if(!/^\d{2}\/\d{2}\/\d{4}$/.test(dueDate)){
        alert("Silly! You have to enter a valid due date!");
        return;
    }

    requestJson(`/users/${userId}/todos`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({text, dueDate, completed: false})
    })
        .then(data => {
            addTaskToScreen(data);
            inputBox.value = "";
            dueDateInput.value = "";
        })
        .catch(error => alert(error.message));
}

//update/save a task to the database
function saveData(todoElement){
    if(!todoElement || !todoElement.dataset.todoId){
        return;
    }

    requestJson(`/users/${userId}/todos/${todoElement.dataset.todoId}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            text: todoElement.firstChild.textContent.trim(),
            dueDate: todoElement.dataset.dueDate,
            completed: todoElement.classList.contains("checked")
        })
    });
}

//display a task from the database
function showTask(){
    if(!userId){
        window.location.href = "login.html";
        return;
    }

    requestJson(`/users/${userId}/todos`)
        .then(todos => {
            listContainer.innerHTML = "";
            todos.forEach(addTaskToScreen);
            updateCountdowns();
        })
        .catch(error => alert(error.message));
}

function addTaskToScreen(todo){
    const li = document.createElement("li");
    li.dataset.todoId = todo._id;
    li.dataset.dueDate = todo.dueDate;
    li.append(document.createTextNode(todo.text));

    const countdown = document.createElement("small");
    countdown.className = "due-countdown";
    countdown.textContent = formatCountdownText(todo.dueDate);
    li.append(countdown);

    const deleteButton = document.createElement("span");
    deleteButton.textContent = "\u00d7";
    li.append(deleteButton);

    if(todo.completed){
        li.classList.add("checked");
    }

    listContainer.appendChild(li);
    updateCountdowns();
}

//delete the task from the database and remove it from the screen
listContainer.addEventListener("click", function(event){
    const deleteButton = event.target.closest("span");
    if(deleteButton && listContainer.contains(deleteButton)){
        const todo = deleteButton.parentElement;
        requestJson(`/users/${userId}/todos/${todo.dataset.todoId}`, {method: "DELETE"})
            .then(() => todo.remove())
            .catch(error => alert(error.message));
        return;
    }

    const li = event.target.closest("li");
    if(!li){
        return;
    }

    li.classList.toggle("checked");
    saveData(li);
}, false);

inputBox.addEventListener("keydown", function(event){
    if(event.key === "Enter"){
        event.preventDefault();
        addTask();
    }
});

dueDateInput.addEventListener("keydown", function(event){
    if(event.key === "Enter"){
        event.preventDefault();
        addTask();
    }
}); 

dueDateInput.addEventListener("input", function(){
    const digits = dueDateInput.value.replace(/\D/g, "").slice(0, 8);
    const parts = [];

    if(digits.length > 0) parts.push(digits.slice(0, 2));
    if(digits.length > 2) parts.push(digits.slice(2, 4));
    if(digits.length > 4) parts.push(digits.slice(4, 8));

    dueDateInput.value = parts.join("/");
});


listContainer.addEventListener("dblclick", function(e){
    if(e.target.tagName !== "LI"){
        return;
    }

    const li = e.target;
    const textNode = li.firstChild;
    const originalText = textNode ? textNode.textContent : "";
    const editBox = document.createElement("input");

    editBox.type = "text";
    editBox.className = "edit-input";
    editBox.value = originalText.trim();
    textNode.textContent = "";
    li.insertBefore(editBox, li.firstChild);
    editBox.focus();
    editBox.select();

    function finishEditing(save){
        if(save && editBox.value.trim() !== ""){
            textNode.textContent = editBox.value.trim();
        } else {
            textNode.textContent = originalText;
        }

        editBox.remove();
        saveData(li);
    }

    editBox.addEventListener("blur", function(){
        finishEditing(true);
    });

    editBox.addEventListener("keydown", function(event){
        if(event.key === "Enter"){
            finishEditing(true);
        } else if(event.key === "Escape"){
            finishEditing(false);
        }
    });
}, false);

loadUserName();
showTask();