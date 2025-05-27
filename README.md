# TaskFlow - Task Management Application

A full-stack task management application built with React, Node.js, Express, and PostgreSQL.


## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Weekly Task Management**: Organize tasks by week with automatic archiving
- **Priority System**: Set task priorities (Low, Medium, High)
- **Family Collaboration**: Create families and assign tasks to members
- **Progress Tracking**: Visual dashboards and completion analytics
- **Weekly Reports**: Generate PDF reports of your progress
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

## Frontend
- React
- Tailwind
- Context API 

## Backend
- Node.js
- Express
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Tasks
- `GET /api/tasks` - Get current week's tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/archive` - Archive old tasks

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Family Management
- `POST /api/family/create` - Create a family
- `POST /api/family/join` - Join a family with invitation code
- `GET /api/family/members` - Get family members

## Usage

1. **Registration/Login**: Create an account or log in with existing credentials
2. **Create Tasks**: Add tasks for the current week with priorities
3. **Manage Tasks**: Mark tasks as complete, edit, or delete them
4. **Family Collaboration**: Create a family and invite members with invitation codes
5. **Track Progress**: View your dashboard for completion statistics
6. **Generate Reports**: Create weekly PDF reports of your progress