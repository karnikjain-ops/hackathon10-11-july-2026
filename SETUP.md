# Project Setup Instructions

Welcome to the Emergency Medical Response System (EMRS). This guide will help you set up and run the project locally on your machine.

The project is split into two parts:
1. **Backend**: Built with Python and FastAPI.
2. **Frontend**: Built with React and Vite.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Python](https://www.python.org/) (v3.9 or higher recommended)
- Git

---

## 1. Clone the Repository

If you haven't already, clone the repository to your local machine:

```bash
git clone <YOUR_REPOSITORY_URL>
cd healthcare
```

---

## 2. Setting up the Backend

The backend is a FastAPI application that serves the APIs and connects to a MongoDB database.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (Recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - On **Windows**:
     ```bash
     venv\Scripts\activate
     ```
   - On **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```

4. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Environment Variables:**
   Create a `.env` file in the `backend` folder (if it doesn't already exist) and configure your environment variables. It usually requires:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

6. **Run the backend server:**
   ```bash
   uvicorn main:app --reload
   ```
   The backend will now be running on `http://127.0.0.1:8000`. You can view the interactive API documentation at `http://127.0.0.1:8000/docs`.

---

## 3. Setting up the Frontend

The frontend is a React application powered by Vite.

1. **Open a new terminal window** (leave the backend running in the first one).

2. **Navigate to the frontend directory:**
   ```bash
   cd healthcare/frontend
   ```

3. **Install the dependencies:**
   ```bash
   npm install
   ```

4. **Environment Variables (Optional):**
   If you need to configure the API URL, you can create a `.env` file in the `frontend` folder:
   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```

5. **Run the frontend development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   Vite will provide a local URL in the terminal (usually `http://localhost:5173`). Open this URL in your browser to view the app!

---

## Troubleshooting

- **Backend Connection Refused:** Make sure your backend server is running and the `.env` file in the frontend is pointing to the correct API URL.
- **Port already in use:** If port 8000 or 5173 is in use, stop the service running on that port or change the port via command-line arguments.
