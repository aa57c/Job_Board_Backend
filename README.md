Job Board Backend

This is the backend for the Graduate Teaching Assistant Job Board web application built using Node.js, Express, and MongoDB. It provides APIs for user authentication, job management, and data interaction with a MongoDB database.

✅ Live Deployment: This backend server is up and running on Render: https://job-board-backend-yq3b.onrender.com/

📁 Project Structure
```bash
Job_Board_Backend/
├── config/           # Configuration files (e.g., passport strategy, keys)
├── db/               # Database connection logic
├── routes/           # Express route handlers
├── userModel/        # Mongoose models
├── validation/       # Input validation logic
├── server.js         # Entry point for the Node server
├── package.json      # Project metadata and dependencies
```

🚀 Features

1. User registration and login with JWT authentication
2. MongoDB integration via Mongoose
3. Passport-based authentication middleware
4. Validation for user inputs

🛠️ Installation

Clone the repo

```bash
git clone <repo-url>
cd Job_Board_Backend
```

Install dependencies

```bash
npm install
```

Set environment variables
- Create a .env file with your MongoDB URI.

Run the server
```bash
npm start
```

📬 API Endpoints

Typical routes might include:
- POST /register – Register a new user
- POST /login – Authenticate and get token
- GET /postings – Get job listings (example)

🧪 Testing

You can test the endpoints using Postman or similar tools.

📄 License
This project is for educational and demonstration purposes.
