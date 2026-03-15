const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskList = document.getElementById("taskList");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const taskSubmitBtn = document.querySelector("#taskForm button[type='submit']");

const taskDayToggle = document.getElementById("taskDayToggle");
const taskMonthToggle = document.getElementById("taskMonthToggle");
const taskYearToggle = document.getElementById("taskYearToggle");

const taskDayDropdown = document.getElementById("taskDayDropdown");
const taskMonthDropdown = document.getElementById("taskMonthDropdown");
const taskYearDropdown = document.getElementById("taskYearDropdown");

const taskDayOptions = document.getElementById("taskDayOptions");
const taskMonthOptions = document.getElementById("taskMonthOptions");
const taskYearOptions = document.getElementById("taskYearOptions");

const eventForm = document.getElementById("eventForm");
const eventTitle = document.getElementById("eventTitle");
const eventList = document.getElementById("eventList");
const eventSubmitBtn = document.querySelector("#eventForm button[type='submit']");

const dayToggle = document.getElementById("dayToggle");
const monthToggle = document.getElementById("monthToggle");
const yearToggle = document.getElementById("yearToggle");

const dayDropdown = document.getElementById("dayDropdown");
const monthDropdown = document.getElementById("monthDropdown");
const yearDropdown = document.getElementById("yearDropdown");

const dayOptions = document.getElementById("dayOptions");
const monthOptions = document.getElementById("monthOptions");
const yearOptions = document.getElementById("yearOptions");

const hourUp = document.getElementById("hourUp");
const hourDown = document.getElementById("hourDown");
const minuteUp = document.getElementById("minuteUp");
const minuteDown = document.getElementById("minuteDown");
const periodToggle = document.getElementById("periodToggle");
const hourDisplay = document.getElementById("hourDisplay");
const minuteDisplay = document.getElementById("minuteDisplay");

const calendarGrid = document.getElementById("calendarGrid");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

const selectedDatePanel = document.getElementById("selectedDatePanel");
const selectedDateTitle = document.getElementById("selectedDateTitle");
const selectedDateItems = document.getElementById("selectedDateItems");

const welcomeMessage = document.getElementById("welcomeMessage");

let tasks = JSON.parse(localStorage.getItem("planovaTasks")) || [];
let events = JSON.parse(localStorage.getItem("planovaEvents")) || [];


const now = new Date();

let selectedTaskDay = String(now.getDate()).padStart(2, "0");
let selectedTaskMonth = String(now.getMonth() + 1).padStart(2, "0");
let selectedTaskYear = String(now.getFullYear());

let selectedDay = String(now.getDate()).padStart(2, "0");
let selectedMonth = String(now.getMonth() + 1).padStart(2, "0");
let selectedYear = String(now.getFullYear());
let selectedHour = 9;
let selectedMinute = 0;
let selectedPeriod = "AM";

let currentCalendarMonth = now.getMonth();
let currentCalendarYear = now.getFullYear();

let editingTaskId = null;
let editingEventId = null;
let selectedCalendarDateKey = null;

function typeText(element, text, speed = 55) {
  if (!element) return;

  element.textContent = "";
  let index = 0;

  function typeNextLetter() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(typeNextLetter, speed);
    }
  }

  typeNextLetter();
}

function setupWelcomeMessage() {
  if (!welcomeMessage) return;

  let userName = localStorage.getItem("planovaUserName");

  if (!userName) {
    userName = prompt("Welcome! What is your name?");

    if (userName) {
      userName = userName.trim();
    }

    if (!userName) {
      userName = "there";
    }

    localStorage.setItem("planovaUserName", userName);
  }

  const message = `Welcome, ${userName}! Organize your tasks and track your upcoming events.`;
  typeText(welcomeMessage, message, 45);
}

function saveTasks() {
  localStorage.setItem("planovaTasks", JSON.stringify(tasks));
}

function saveEvents() {
  localStorage.setItem("planovaEvents", JSON.stringify(events));
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function updateTaskStats() {
  totalTasks.textContent = `Total: ${tasks.length}`;
  completedTasks.textContent = `Completed: ${
    tasks.filter((task) => task.completed).length
  }`;
}

function formatTaskDate(dateString) {
  if (!dateString) return "No due date";

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventDate(dateString) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function renderTasks() {
  taskList.innerHTML = "";

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed - b.completed;
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });

  sortedTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed-task-item" : "";

    li.innerHTML = `
      <div class="task-item">
        <div class="task-info">
          <label class="task-check-label">
            <input
              type="checkbox"
              ${task.completed ? "checked" : ""}
              onchange="toggleTask(${task.id})"
            />
            <span class="task-title ${task.completed ? "completed" : ""}">
              ${task.title}
            </span>
          </label>
          <div class="task-date">
            ${task.date ? `Due: ${formatTaskDate(task.date)}` : "No due date"}
          </div>
        </div>

        <div class="actions">
          <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
          <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        </div>
      </div>
    `;

    taskList.appendChild(li);
  });

  updateTaskStats();
}

function addTask(e) {
  e.preventDefault();

  const title = taskTitle.value.trim();
  if (!title) return;

  const taskDate = getSelectedTaskDate();

  if (editingTaskId) {
    tasks = tasks.map((task) =>
      task.id === editingTaskId ? { ...task, title, date: taskDate } : task
    );
    editingTaskId = null;
    taskSubmitBtn.textContent = "Add Task";
  } else {
    const newTask = {
      id: Date.now(),
      title,
      date: taskDate,
      completed: false,
    };

    tasks.push(newTask);
  }

  saveTasks();
  renderTasks();
  renderCalendar();
  resetTaskForm();
}

function resetTaskForm() {
  taskTitle.value = "";
  selectedTaskDay = String(now.getDate()).padStart(2, "0");
  selectedTaskMonth = String(now.getMonth() + 1).padStart(2, "0");
  selectedTaskYear = String(now.getFullYear());
  populateTaskDatePickers();
  taskSubmitBtn.textContent = "Add Task";
  editingTaskId = null;
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  editingTaskId = id;
  taskTitle.value = task.title;

  if (task.date) {
    const dateObj = new Date(task.date);
    selectedTaskDay = String(dateObj.getDate()).padStart(2, "0");
    selectedTaskMonth = String(dateObj.getMonth() + 1).padStart(2, "0");
    selectedTaskYear = String(dateObj.getFullYear());
    populateTaskDatePickers();
  }

  taskSubmitBtn.textContent = "Save Task";
  taskTitle.focus();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
  renderCalendar();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
  renderCalendar();

  if (editingTaskId === id) {
    resetTaskForm();
  }
}

/* =========================
   TASK DATE PICKERS
========================= */

function updateTaskDateButtons() {
  taskDayToggle.textContent = selectedTaskDay;
  taskMonthToggle.textContent = new Date(
    `${selectedTaskYear}-${selectedTaskMonth}-01`
  ).toLocaleString("en-US", { month: "short" });
  taskYearToggle.textContent = selectedTaskYear;
}

function populateTaskDatePickers() {
  if (!taskDayOptions || !taskMonthOptions || !taskYearOptions) return;

  taskDayOptions.innerHTML = "";
  taskMonthOptions.innerHTML = "";
  taskYearOptions.innerHTML = "";

  const daysInMonth = getDaysInMonth(
    Number(selectedTaskYear),
    Number(selectedTaskMonth)
  );

  if (Number(selectedTaskDay) > daysInMonth) {
    selectedTaskDay = String(daysInMonth).padStart(2, "0");
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const value = String(i).padStart(2, "0");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "picker-option";
    btn.textContent = value;

    if (value === selectedTaskDay) btn.classList.add("active");

    btn.addEventListener("click", () => {
      selectedTaskDay = value;
      populateTaskDatePickers();
      taskDayDropdown.classList.add("hidden");
    });

    taskDayOptions.appendChild(btn);
  }

  const months = [
    { value: "01", label: "Jan" },
    { value: "02", label: "Feb" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Apr" },
    { value: "05", label: "May" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Aug" },
    { value: "09", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ];

  months.forEach((month) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "picker-option";
    btn.textContent = month.label;

    if (month.value === selectedTaskMonth) btn.classList.add("active");

    btn.addEventListener("click", () => {
      selectedTaskMonth = month.value;

      const maxDays = getDaysInMonth(
        Number(selectedTaskYear),
        Number(selectedTaskMonth)
      );

      if (Number(selectedTaskDay) > maxDays) {
        selectedTaskDay = String(maxDays).padStart(2, "0");
      }

      populateTaskDatePickers();
      taskMonthDropdown.classList.add("hidden");
    });

    taskMonthOptions.appendChild(btn);
  });

  for (let i = now.getFullYear(); i <= now.getFullYear() + 10; i++) {
    const value = String(i);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "picker-option";
    btn.textContent = value;

    if (value === selectedTaskYear) btn.classList.add("active");

    btn.addEventListener("click", () => {
      selectedTaskYear = value;

      const maxDays = getDaysInMonth(
        Number(selectedTaskYear),
        Number(selectedTaskMonth)
      );

      if (Number(selectedTaskDay) > maxDays) {
        selectedTaskDay = String(maxDays).padStart(2, "0");
      }

      populateTaskDatePickers();
      taskYearDropdown.classList.add("hidden");
    });

    taskYearOptions.appendChild(btn);
  }

  updateTaskDateButtons();
}

function getSelectedTaskDate() {
  return `${selectedTaskYear}-${selectedTaskMonth}-${selectedTaskDay}`;
}

/* =========================
   EVENT DATE PICKERS
========================= */

function updateDateButtons() {
  dayToggle.textContent = selectedDay;
  monthToggle.textContent = new Date(
    `${selectedYear}-${selectedMonth}-01`
  ).toLocaleString("en-US", { month: "short" });
  yearToggle.textContent = selectedYear;
}

function populateDatePickers() {
  if (!dayOptions || !monthOptions || !yearOptions) return;

  dayOptions.innerHTML = "";
  monthOptions.innerHTML = "";
  yearOptions.innerHTML = "";

  const daysInMonth = getDaysInMonth(Number(selectedYear), Number(selectedMonth));

  if (Number(selectedDay) > daysInMonth) {
    selectedDay = String(daysInMonth).padStart(2, "0");
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const value = String(i).padStart(2, "0");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "picker-option";
    btn.textContent = value;

    if (value === selectedDay) btn.classList.add("active");

    btn.addEventListener("click", () => {
      selectedDay = value;
      populateDatePickers();
      dayDropdown.classList.add("hidden");
    });

    dayOptions.appendChild(btn);
  }

  const months = [
    { value: "01", label: "Jan" },
    { value: "02", label: "Feb" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Apr" },
    { value: "05", label: "May" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Aug" },
    { value: "09", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ];

  months.forEach((month) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "picker-option";
    btn.textContent = month.label;

    if (month.value === selectedMonth) btn.classList.add("active");

    btn.addEventListener("click", () => {
      selectedMonth = month.value;

      const maxDays = getDaysInMonth(Number(selectedYear), Number(selectedMonth));
      if (Number(selectedDay) > maxDays) {
        selectedDay = String(maxDays).padStart(2, "0");
      }

      populateDatePickers();
      monthDropdown.classList.add("hidden");
    });

    monthOptions.appendChild(btn);
  });

  for (let i = now.getFullYear(); i <= now.getFullYear() + 10; i++) {
    const value = String(i);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "picker-option";
    btn.textContent = value;

    if (value === selectedYear) btn.classList.add("active");

    btn.addEventListener("click", () => {
      selectedYear = value;

      const maxDays = getDaysInMonth(Number(selectedYear), Number(selectedMonth));
      if (Number(selectedDay) > maxDays) {
        selectedDay = String(maxDays).padStart(2, "0");
      }

      populateDatePickers();
      yearDropdown.classList.add("hidden");
    });

    yearOptions.appendChild(btn);
  }

  updateDateButtons();
}

function updateTimeDisplay() {
  hourDisplay.textContent = String(selectedHour).padStart(2, "0");
  minuteDisplay.textContent = String(selectedMinute).padStart(2, "0");
  periodToggle.textContent = selectedPeriod;
}

function getSelectedEventDateTime() {
  let hour24 = selectedHour;

  if (selectedPeriod === "PM" && hour24 !== 12) hour24 += 12;
  if (selectedPeriod === "AM" && hour24 === 12) hour24 = 0;

  const formattedHour = String(hour24).padStart(2, "0");
  const formattedMinute = String(selectedMinute).padStart(2, "0");

  return `${selectedYear}-${selectedMonth}-${selectedDay}T${formattedHour}:${formattedMinute}`;
}

function getCountdown(targetDate) {
  const nowTime = new Date().getTime();
  const eventTime = new Date(targetDate).getTime();
  const gap = eventTime - nowTime;

  if (gap <= 0) {
    return "Event started or expired";
  }

  const days = Math.floor(gap / (1000 * 60 * 60 * 24));
  const hours = Math.floor((gap / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((gap / (1000 * 60)) % 60);
  const seconds = Math.floor((gap / 1000) % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s left`;
}

/* =========================
   CALENDAR
========================= */

function formatDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

function getEventsByDateKey(dateKey) {
  return events.filter((event) => event.date.startsWith(dateKey));
}

function getTasksByDateKey(dateKey) {
  return tasks.filter((task) => task.date === dateKey);
}

function getCalendarItemsByDateKey(dateKey) {
  const dayEvents = getEventsByDateKey(dateKey).map((event) => ({
    type: "event",
    title: event.title,
    date: event.date,
  }));

  const dayTasks = getTasksByDateKey(dateKey).map((task) => ({
    type: "task",
    title: task.title,
    date: task.date,
    completed: task.completed,
  }));

  return [...dayEvents, ...dayTasks];
}
function formatDateTitleFromKey(dateKey) {
  const dateObj = new Date(`${dateKey}T00:00`);
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function renderSelectedDateItems(dateKey) {
  if (!selectedDateTitle || !selectedDateItems) return;

  if (!dateKey) {
    selectedDateTitle.textContent = "Select a day";
    selectedDateItems.innerHTML =
      '<p class="empty-day-message">No day selected yet.</p>';
    return;
  }

  const dateEvents = getEventsByDateKey(dateKey).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const dateTasks = getTasksByDateKey(dateKey).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  selectedDateTitle.textContent = formatDateTitleFromKey(dateKey);

  const items = [];

  dateEvents.forEach((event) => {
    items.push(`
      <div class="selected-date-card">
        <div class="selected-date-type event">Event</div>
        <div class="selected-date-title">${event.title}</div>
        <div class="selected-date-meta">${formatEventDate(event.date)}</div>
      </div>
    `);
  });

  dateTasks.forEach((task) => {
    items.push(`
      <div class="selected-date-card">
        <div class="selected-date-type task">Task</div>
        <div class="selected-date-title">${task.title}</div>
        <div class="selected-date-meta">
          ${task.completed ? "Completed" : "Pending"} • Due ${formatTaskDate(task.date)}
        </div>
      </div>
    `);
  });

  if (items.length === 0) {
    selectedDateItems.innerHTML =
      '<p class="empty-day-message">No events or tasks for this day.</p>';
    return;
  }

  selectedDateItems.innerHTML = items.join("");
}

function renderCalendar() {
  if (!calendarGrid || !calendarMonthLabel) return;

  calendarGrid.innerHTML = "";

  const firstDayOfMonth = new Date(currentCalendarYear, currentCalendarMonth, 1);
  const lastDayOfMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
  const firstWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(currentCalendarYear, currentCalendarMonth, 0).getDate();

  calendarMonthLabel.textContent = new Date(
    currentCalendarYear,
    currentCalendarMonth
  ).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const dayNumber = prevMonthLastDay - i;
    const dayBox = document.createElement("div");
    dayBox.className = "calendar-day other-month";
    dayBox.innerHTML = `<div class="calendar-day-number">${dayNumber}</div>`;
    calendarGrid.appendChild(dayBox);
  }

  const today = new Date();
  const todayKey = formatDateKey(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(
      currentCalendarYear,
      currentCalendarMonth + 1,
      day
    );

    const calendarItems = getCalendarItemsByDateKey(dateKey).sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return aTime - bTime;
    });

    const dayBox = document.createElement("div");
    dayBox.className = "calendar-day";

    if (dateKey === todayKey) {
      dayBox.classList.add("today");
    }

    if (selectedCalendarDateKey === dateKey) {
      dayBox.classList.add("selected-day");
    }

    const itemsHtml = calendarItems
      .slice(0, 3)
      .map((item) => {
        if (item.type === "event") {
          return `
            <div class="calendar-event-pill" title="${item.title}">
              ${item.title}
            </div>
          `;
        }

        return `
          <div class="calendar-task-pill ${item.completed ? "completed-pill" : ""}" title="${item.title}">
            ${item.title}
          </div>
        `;
      })
      .join("");

    const moreHtml =
      calendarItems.length > 3
        ? `<div class="calendar-more">+${calendarItems.length - 3} more</div>`
        : "";

    dayBox.innerHTML = `
      <div class="calendar-day-number">${day}</div>
      <div class="calendar-events">
        ${itemsHtml}
        ${moreHtml}
      </div>
    `;

    dayBox.addEventListener("click", () => {
      selectedCalendarDateKey = dateKey;
      renderCalendar();
      renderSelectedDateItems(dateKey);
    });

    calendarGrid.appendChild(dayBox);
  }

  const totalCells = firstWeekday + daysInMonth;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  for (let i = 1; i <= remainingCells; i++) {
    const dayBox = document.createElement("div");
    dayBox.className = "calendar-day other-month";
    dayBox.innerHTML = `<div class="calendar-day-number">${i}</div>`;
    calendarGrid.appendChild(dayBox);
  }
}

function renderEvents() {
  eventList.innerHTML = "";

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  sortedEvents.forEach((event) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="event-item">
        <div class="event-info">
          <div><strong>${event.title}</strong></div>
          <div class="event-date">${formatEventDate(event.date)}</div>
          <div class="countdown">${getCountdown(event.date)}</div>
        </div>
        <div class="actions">
          <button class="edit-btn" onclick="editEvent(${event.id})">Edit</button>
          <button class="delete-btn" onclick="deleteEvent(${event.id})">Delete</button>
        </div>
      </div>
    `;

    eventList.appendChild(li);
  });
}

function addEvent(e) {
  e.preventDefault();

  const title = eventTitle.value.trim();
  if (!title) return;

  const eventDateTime = getSelectedEventDateTime();

  if (editingEventId) {
    events = events.map((event) =>
      event.id === editingEventId
        ? { ...event, title, date: eventDateTime }
        : event
    );
    editingEventId = null;
    eventSubmitBtn.textContent = "Add Event";
  } else {
    const newEvent = {
      id: Date.now(),
      title,
      date: eventDateTime,
    };

    events.push(newEvent);
  }

  saveEvents();
  renderEvents();
  renderCalendar();
  resetEventForm();
}

function resetEventForm() {
  eventTitle.value = "";
  selectedDay = String(now.getDate()).padStart(2, "0");
  selectedMonth = String(now.getMonth() + 1).padStart(2, "0");
  selectedYear = String(now.getFullYear());
  selectedHour = 9;
  selectedMinute = 0;
  selectedPeriod = "AM";
  populateDatePickers();
  updateTimeDisplay();
  eventSubmitBtn.textContent = "Add Event";
  editingEventId = null;
}

function editEvent(id) {
  const event = events.find((e) => e.id === id);
  if (!event) return;

  editingEventId = id;
  eventTitle.value = event.title;

  const dateObj = new Date(event.date);
  selectedDay = String(dateObj.getDate()).padStart(2, "0");
  selectedMonth = String(dateObj.getMonth() + 1).padStart(2, "0");
  selectedYear = String(dateObj.getFullYear());

  let hour = dateObj.getHours();
  selectedMinute = dateObj.getMinutes();

  selectedPeriod = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  selectedHour = hour === 0 ? 12 : hour;

  populateDatePickers();
  updateTimeDisplay();

  eventSubmitBtn.textContent = "Save Event";
  eventTitle.focus();
}

function deleteEvent(id) {
  events = events.filter((event) => event.id !== id);
  saveEvents();
  renderEvents();
  renderCalendar();

  if (editingEventId === id) {
    resetEventForm();
  }
}

/* =========================
   TASK PICKER TOGGLES
========================= */

if (taskDayToggle) {
  taskDayToggle.addEventListener("click", () => {
    taskDayDropdown.classList.toggle("hidden");
    taskMonthDropdown.classList.add("hidden");
    taskYearDropdown.classList.add("hidden");
  });
}

if (taskMonthToggle) {
  taskMonthToggle.addEventListener("click", () => {
    taskMonthDropdown.classList.toggle("hidden");
    taskDayDropdown.classList.add("hidden");
    taskYearDropdown.classList.add("hidden");
  });
}

if (taskYearToggle) {
  taskYearToggle.addEventListener("click", () => {
    taskYearDropdown.classList.toggle("hidden");
    taskDayDropdown.classList.add("hidden");
    taskMonthDropdown.classList.add("hidden");
  });
}

/* =========================
   EVENT PICKER TOGGLES
========================= */

if (dayToggle) {
  dayToggle.addEventListener("click", () => {
    dayDropdown.classList.toggle("hidden");
    monthDropdown.classList.add("hidden");
    yearDropdown.classList.add("hidden");
  });
}

if (monthToggle) {
  monthToggle.addEventListener("click", () => {
    monthDropdown.classList.toggle("hidden");
    dayDropdown.classList.add("hidden");
    yearDropdown.classList.add("hidden");
  });
}

if (yearToggle) {
  yearToggle.addEventListener("click", () => {
    yearDropdown.classList.toggle("hidden");
    dayDropdown.classList.add("hidden");
    monthDropdown.classList.add("hidden");
  });
}

/* =========================
   GLOBAL CLOSE
========================= */

document.addEventListener("click", (e) => {
  if (!e.target.closest(".picker-field")) {
    if (dayDropdown) dayDropdown.classList.add("hidden");
    if (monthDropdown) monthDropdown.classList.add("hidden");
    if (yearDropdown) yearDropdown.classList.add("hidden");

    if (taskDayDropdown) taskDayDropdown.classList.add("hidden");
    if (taskMonthDropdown) taskMonthDropdown.classList.add("hidden");
    if (taskYearDropdown) taskYearDropdown.classList.add("hidden");
  }
});

/* =========================
   TIME CONTROLS
========================= */

if (hourUp) {
  hourUp.addEventListener("click", () => {
    selectedHour = selectedHour === 12 ? 1 : selectedHour + 1;
    updateTimeDisplay();
  });
}

if (hourDown) {
  hourDown.addEventListener("click", () => {
    selectedHour = selectedHour === 1 ? 12 : selectedHour - 1;
    updateTimeDisplay();
  });
}

if (minuteUp) {
  minuteUp.addEventListener("click", () => {
    selectedMinute = selectedMinute === 59 ? 0 : selectedMinute + 1;
    updateTimeDisplay();
  });
}

if (minuteDown) {
  minuteDown.addEventListener("click", () => {
    selectedMinute = selectedMinute === 0 ? 59 : selectedMinute - 1;
    updateTimeDisplay();
  });
}

if (periodToggle) {
  periodToggle.addEventListener("click", () => {
    selectedPeriod = selectedPeriod === "AM" ? "PM" : "AM";
    updateTimeDisplay();
  });
}

/* =========================
   CALENDAR NAV
========================= */

if (prevMonthBtn) {
  prevMonthBtn.addEventListener("click", () => {
    currentCalendarMonth--;

    if (currentCalendarMonth < 0) {
      currentCalendarMonth = 11;
      currentCalendarYear--;
    }

    renderCalendar();
  });
}

if (nextMonthBtn) {
  nextMonthBtn.addEventListener("click", () => {
    currentCalendarMonth++;

    if (currentCalendarMonth > 11) {
      currentCalendarMonth = 0;
      currentCalendarYear++;
    }

    renderCalendar();
  });
}

if (taskForm) {
  taskForm.addEventListener("submit", addTask);
}

if (eventForm) {
  eventForm.addEventListener("submit", addEvent);
}

populateTaskDatePickers();
populateDatePickers();
updateTimeDisplay();
renderTasks();
renderEvents();
renderCalendar();
renderSelectedDateItems(selectedCalendarDateKey);
setupWelcomeMessage();

setInterval(() => {
  renderEvents();
}, 1000);