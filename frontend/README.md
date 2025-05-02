# TaskFlow - Project Management Application

TaskFlow is a modern, full-stack project management application designed to help teams collaborate efficiently. It provides a clean, intuitive interface for managing workspaces, boards, and tasks.

## Features

- **User Authentication**: Secure login and registration system
- **Workspaces**: Create and manage multiple workspaces
- **Team Collaboration**: Invite members to workspaces with different roles (Owner, Admin, Member)
- **Boards**: Organize work into visual boards
- **Tasks**: Create, assign, and track tasks through customizable workflows
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React 19
- React Router 7
- Tailwind CSS 4
- Vite 6 (for build and development)
- React Icons

### Backend
- Django 5.2
- Django REST Framework 3.16
- Simple JWT for authentication
- SQLite (development) / PostgreSQL (production)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- pip

### Installation

#### Backend Setup
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/taskflow.git
   cd taskflow
   ```

2. Set up a virtual environment
   ```bash
   cd Backend
   python -m venv venv
   ```

3. Activate the virtual environment
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

5. Run migrations
   ```bash
   python manage.py migrate
   ```

6. Start the backend server
   ```bash
   python manage.py runserver
   ```
   The backend will be available at http://localhost:8000/

#### Frontend Setup
1. Navigate to the frontend directory
   ```bash
   cd frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```
   The frontend will be available at http://localhost:5173/

## Project Structure

```
taskflow/
├── Backend/                # Django backend
│   ├── backend/            # Main Django project
│   ├── user/               # User authentication app
│   ├── workspace/          # Workspace management app
│   ├── board/              # Board management app
│   ├── task/               # Task management app
│   └── home/               # Home page app
│
├── frontend/               # React frontend
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       │   ├── Authentification/  # Login and registration
│       │   ├── home/       # Home page
│       │   ├── workspace/  # Workspace management
│       │   └── board/      # Board and task management
│       ├── App.jsx         # Main application component
│       └── main.jsx        # Application entry point
```

## API Endpoints

### Authentication
- `POST /user/register/` - Register a new user
- `POST /user/login/` - Login and get JWT token

### Workspaces
- `GET /workspace/` - List all workspaces
- `POST /workspace/` - Create a new workspace
- `GET /workspace/:id` - Get workspace details
- `PUT /workspace/:id` - Update workspace
- `DELETE /workspace/:id` - Delete workspace
- `GET /workspace/members/:id` - Get workspace members
- `PUT /workspace/new-member/:id` - Add member to workspace
- `DELETE /workspace/remove-member/:id/:memberId` - Remove member from workspace

### Boards
- `GET /board/` - List all boards
- `POST /board/` - Create a new board
- `GET /board/:id` - Get board details
- `PUT /board/:id` - Update board
- `DELETE /board/:id` - Delete board

### Tasks
- `GET /task/` - List all tasks
- `POST /task/` - Create a new task
- `GET /task/:id` - Get task details
- `PUT /task/:id` - Update task
- `DELETE /task/:id` - Delete task

## User Roles and Permissions

- **Owner**: Full control over workspace, can add/remove members, change roles
- **Admin**: Can manage boards and tasks, add members
- **Member**: Can view and interact with boards and tasks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Django](https://www.djangoproject.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

