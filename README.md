# job_tracker-backend
A simple Job Application Tracker API built with Node.js, Express, Prisma, and PostgreSQL. This backend handles authentication, job tracking, and password reset functionality.
Features

* User Registration & Login (JWT authentication)

* Forgot/Reset Password with secure tokens

* CRUD operations for job applications

* Secure password hashing (bcrypt)

* Prisma ORM with PostgreSQL

 Tech Stack

# Backend: Node.js, Express

# Database: PostgreSQL + Prisma

# Auth: JWT, bcrypt

# Email: Nodemailer / SendGrid (for password reset)

Installation
# Clone repo
git clone https://github.com/deji06/job-tracker-api.git
cd job-tracker-api

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Start server
npm run dev

🔑 Environment Variables

Create a .env file with:

DATABASE_URL="postgresql://user:password@localhost:5432/jobtracker"
JWT_SECRET="your_jwt_secret_here"
EMAIL_USER="your_email@example.com"
EMAIL_PASS="your_email_password_or_app_key"

API Endpoints
Auth
Method	Endpoint	Description
POST	/auth/register	Register new user
POST	/auth/login	Login user & get JWT
POST	/auth/forgot_password	Send reset link
POST	/auth/reset_password	Reset password

Jobs
Method	Endpoint	Description
POST	/jobs	Create new job
GET	/jobs	Get all jobs for logged-in user
PUT	/jobs/:id	Update job status/details
DELETE	/jobs/:id	Delete a job

Example Requests
Register
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d '{"name":"John Doe","email":"john@example.com","password":"Password123!"}'

Create Job
curl -X POST http://localhost:3000/jobs \
-H "Authorization: Bearer <jwt_token>" \
-H "Content-Type: application/json" \
-d '{"title":"Frontend Developer","company":"Google","status":"applied","location":"Remote"}'


 Add job filtering & search

 Add analytics/dashboard endpoint

 Deploy to Render/Heroku with PostgreSQL

📄 License

MIT License. Free to use and modify.
