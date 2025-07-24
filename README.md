# Resource Management Backend

This is the backend for the Engineering Resource Management System. It provides RESTful APIs for authentication, user management, project management, and engineer assignments.

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

## Folder Structure
```
backend/
├── Server.js                # Main entry point
├── package.json             # Backend dependencies
├── config/
│   └── db.js                # MongoDB connection
├── middlewares/
│   └── auth.js              # Auth and role-based middleware
├── src/
│   ├── controllers/         # Route controllers
│   │   ├── assignment.controller.js
│   │   ├── project.controller.js
│   │   └── user.controller.js
│   ├── models/              # Mongoose models
│   │   ├── Assignment.js
│   │   ├── project.js
│   │   └── user.js
│   ├── routes/              # Express routes
│   │   ├── assignment.routes.js
│   │   ├── project.routes.js
│   │   └── user.routes.js
│   └── services/            # Business logic
│       ├── assignment.service.js
│       ├── project.service.js
│       └── user.service.js
├── utils/                   # Utility functions
│   └── calculations.js
└── seed/                    # (Optional) Seed scripts
```

## Setup & Run
1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Set up environment variables:**
   - Create a `.env` file in `backend/` with:
     ```env
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=5000
     ```
3. **Start the server:**
   ```sh
   npm run dev
   # or
   node Server.js
   ```

## API Overview
- **Auth:** `/api/auth/register`, `/api/auth/login`
- **Users:** `/api/users/me`, `/api/users/search`, `/api/engineers`, `/api/engineers/:id/capacity`
- **Projects:** `/api/projects`, `/api/projects/:id`, `/api/projects/search`
- **Assignments:** `/api/assignments`, `/api/assignments/engineer/:engineerId`, `/api/assignments/project/:projectId`

## Notes
- All protected routes require a JWT token in the `Authorization` header: `Bearer <token>`
- Manager-only actions (create/edit/delete projects, assign engineers) require a manager role
- See controllers and routes for detailed API usage

--- 