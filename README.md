# Planova

Planova is a simple and elegant productivity web app that helps users organize their tasks and track upcoming events in one place. It combines a task manager, event countdown, and interactive calendar with a soft and modern user interface.

## Features

- Add, edit, delete, and complete tasks
- Add, edit, and delete events with date and time
- Event countdown timer
- Interactive monthly calendar
- Display both tasks and events inside the calendar
- Click on a calendar day to view all tasks and events for that date
- Personalized welcome message with typing effect
- Saves data using localStorage
- Responsive and clean UI design
- Soft pastel theme with glass-effect calendar

## Technologies Used

- HTML
- CSS
- JavaScript
- localStorage

## How It Works

When the user opens Planova for the first time, the app asks for their name and shows a personalized welcome message with a typing animation.  
Users can then:

- add tasks with due dates
- add events with dates and times
- see all tasks and events displayed on the calendar
- click any day in the calendar to view that day's details
- track how much time is left until an event starts

All tasks, events, and the user's name are saved in the browser using localStorage, so the data remains available after refreshing the page.

## Project Structure

```bash
Planova/
│── index.html
│── style.css
│── script.js
│── README.md
