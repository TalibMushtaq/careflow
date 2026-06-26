# CareFlow - Local Installation (Non-Docker Version)

CareFlow is a hospital appointment booking and patient queue management web application. It allows patients to browse doctors and schedule consultations, while providing doctors with a real-time console to check in patients and track queue status.

This version is pre-configured to run directly on your host machine without Docker.

---

## Prerequisites

Before starting, make sure you have the following installed on your system:
- **Python 3.12+**
- **Node.js 18+ & npm**
- **Database Options**:
  - **SQLite** (Recommended for quick testing - zero configuration required)
  - **MySQL 8+** (If you prefer running a local MySQL server instance)

---

## Project Structure

```text
manual/
├── backend/
│   ├── app/                    # Flask Application core
│   ├── tests/                  # Backend unit tests
│   ├── run.py                  # Server entrypoint
│   ├── seed.py                 # Database seeder script
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/                    # React TS Source
│   ├── package.json            # Node dependencies
│   ├── vite.config.ts          # Vite configuration
│   └── index.html              # HTML Entry point
├── openapi.yaml                # OpenAPI Swagger Spec
└── README.md                   # This documentation
```

---

## Getting Started

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a Python Virtual Environment**:
   ```bash
   python3 -m venv venv
   ```

3. **Activate the Virtual Environment**:
   - **Linux/macOS**:
     ```bash
     source venv/bin/activate
     ```
   - **Windows**:
     ```cmd
     venv\Scripts\activate
     ```

4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure Environment Variables**:
   Create a `.env` file by copying the template:
   ```bash
   cp .env.example .env
   ```

   Open the newly created `.env` file. You can choose to use either SQLite or MySQL:

   - **Option A: SQLite (Quickest, Recommended)**
     Change/add the `DATABASE_URL` environment variable to point to a local SQLite file:
     ```env
     DATABASE_URL=sqlite:///careflow.db
     ```
     *(This requires no external database servers to be installed or running.)*

   - **Option B: MySQL (Standard)**
     Ensure you have a local MySQL server running. Create a database named `careflow_db` and update the connection details in `.env`:
     ```env
     DB_USER=your_mysql_user
     DB_PASSWORD=your_mysql_password
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=careflow_db
     ```

6. **Seed the Database**:
   Run the seeder script to initialize tables and populate them with test accounts (10 Doctors, 50 Patients, and test appointments):
   ```bash
   python seed.py
   ```

7. **Start the Backend Server**:
   ```bash
   python run.py
   ```
   The backend Flask REST API will start running at `http://localhost:5000`.

---

### 2. Frontend Setup

1. **Open a new terminal session** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. **Install Node Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file by copying the template:
   ```bash
   cp .env.example .env
   ```
   *(By default, it is configured with `VITE_API_URL=http://localhost:5000/api/v1` to point to the local Flask backend).*

4. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   The React frontend will start running at `http://localhost:3000`. Open this address in your web browser.

---

## Seed Accounts & Credentials

The database is pre-seeded with the following credentials (all using the password `password123`):

- **Doctors**:
  - `doctor1@careflow.com` to `doctor10@careflow.com`
- **Patients**:
  - `patient1@careflow.com` to `patient50@careflow.com`

---

## Running Tests

To run the Flask backend unit test suite:
1. Ensure you are in the `backend` directory.
2. Make sure the virtual environment is activated (`source venv/bin/activate`).
3. Run:
   ```bash
   pytest tests/
   ```
