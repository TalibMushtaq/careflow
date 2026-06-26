# CareFlow - Hospital Appointment & Patient Queue Management

CareFlow is a hospital appointment booking and patient queue management web application. It allows patients to browse doctors and schedule consultations, while providing doctors with a real-time console to call next patients, check them in, and track queue statuses in real time.

---

## Tech Stack

### Frontend
- **React 19** & **TypeScript**
- **Vite** (Build Tool & Dev Server)
- **TailwindCSS** (Custom Hospital Dashboard Design)
- **TanStack Query** (React Query v5 for API caching)
- **Axios** (API Client with JWT token interceptors)
- **React Router v6** (Auth guards & layout routing)
- **React Hook Form** + **Zod** (Frontend Form validation)
- **Recharts** (Interactive metrics charts)
- **React Hot Toast** (Toast notifications)

### Backend
- **Python 3.12+**
- **Flask** (Microframework)
- **SQLAlchemy ORM** + **Flask-Migrate** (Alembic)
- **Flask-JWT-Extended** (JWT Authentication)
- **Flask-CORS** (Cross-Origin Resource Sharing)
- **Marshmallow** (Request/Response validation and serialization)
- **Bcrypt** (Secure password hashing)

### Database
- **MySQL 8+** (Dockerized for development/production)
- *SQLite* (Fallback configuration for unit tests)

---

## Folder Structure

```
careflow/
├── backend/
│   ├── app/
│   │   ├── config.py           # Configuration classes (Dev, Test, Prod)
│   │   ├── extensions.py       # Extensions initialization (DB, Migrate, JWT)
│   │   ├── models/             # SQLAlchemy Models (User, Doctor, Appointment)
│   │   ├── schemas/            # Marshmallow Schemas for input validation
│   │   ├── routes/             # Blueprints (auth, doctors, appointments)
│   │   ├── services/           # Business logic (QueueService)
│   │   └── utils/              # Authorizations & response formatters
│   ├── tests/                  # Pytest unit tests
│   ├── run.py                  # Backend entry point
│   ├── seed.py                 # DB Seeder script (10 doctors, 50 patients)
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Backend containerization
│   ├── .env                    # Backend environment config
│   └── .env.example            # Backend env template
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios API instance
│   │   ├── components/         # Protected routes, loading states, error fallbacks
│   │   ├── context/            # AuthContext (token/user sessions)
│   │   ├── layouts/            # DashboardLayout (Sidebar, header, dark mode toggle)
│   │   ├── pages/              # Dashboards, Directory, Bookings, Profile
│   │   ├── types/              # TypeScript definitions
│   │   ├── App.tsx             # React routes & Providers
│   │   ├── main.tsx            # React bootstrap
│   │   └── index.css           # Tailwind + global animations
│   ├── package.json            # Node dependencies
│   ├── vite.config.ts          # Vite configuration
│   ├── Dockerfile              # Frontend containerization
│   ├── .env                    # Frontend environment config
│   └── .env.example            # Frontend env template
├── docker-compose.yml          # DB, Backend & Frontend Orchestration
├── openapi.yaml                # Swagger OpenAPI 3.0 specification
└── README.md                   # Documentation
```

---

## Setup & Running

CareFlow is fully containerized. You can launch the database, backend API server, and frontend web client in a single command.

### 1. Prerequisite
Ensure you have **Docker** and **Docker Compose** installed.

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both directories:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
*(The default values are pre-configured to work out of the box).*

### 3. Launch via Docker Compose
Run the following command at the project root:
```bash
docker compose up --build
```
This builds and starts:
- **MySQL DB** at `localhost:3306`
- **Flask REST API** at `localhost:5000`
- **React Frontend** at `localhost:3000`

---

## Database Seeding

Once the containers are running (specifically `db` and `backend`), you can run the seeder script to populate **10 Doctors**, **50 Patients**, and a series of test appointments:

### Inside Docker Container:
```bash
docker compose exec backend python seed.py
```

### Or Locally (if running without Docker):
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python seed.py
```

**Seed Credentials:**
- Patients: `patient1@careflow.com` to `patient50@careflow.com` (password: `password123`)
- Doctors: `doctor1@careflow.com` to `doctor10@careflow.com` (password: `password123`)

---

## Running the Unit Tests

The pytest suite tests registration/login, database relationships, and the queue logic (daily queue resets per doctor).

To run backend tests locally:
```bash
cd backend
source venv/bin/activate
pytest tests/
```

---

## REST API Endpoints

Check [openapi.yaml](openapi.yaml) for full Swagger/OpenAPI documentation.

### Authentication
- `POST /api/v1/auth/register` - Register a patient or doctor
- `POST /api/v1/auth/login` - Authenticate credentials and return JWT bearer token

### Doctors
- `GET /api/v1/doctors` - Public directory listing with optional specialty or query search

### Appointments
- `POST /api/v1/appointments/book` - Book appointment slot (Patient only)
- `GET /api/v1/appointments/me` - List logged-in patient's appointments (Patient only)
- `GET /api/v1/appointments/doctor/today` - Today's appointments sorted by queue number (Doctor only)
- `PATCH /api/v1/appointments/<id>/status` - Update status to `serving`, `completed`, `absent`, or `cancelled`

---

## Troubleshooting

### Port 3306 Is Already Allocated

If you get a bind error on port 3306 (e.g., `Bind for 0.0.0.0:3306 failed: port is already allocated`):

1. **Stop the conflicting container**:
   If you have a conflicting container running (like `careflow-mysql`), you can stop it using:
   ```bash
   docker stop careflow-mysql
   ```
   Or if it's a native MySQL instance on your host:
   ```bash
   sudo systemctl stop mysql
   ```

2. **Or, run the database on a different host port**:
   If you want to keep your existing container running, you can launch the docker compose services with a different host port using:
   ```bash
   DB_HOST_PORT=3307 docker compose up --build
   ```
   *(The backend container will still communicate with the database internally inside the docker network, so no other settings need to be changed.)*
