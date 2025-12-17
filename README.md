# CrowdFund - Crowdfunding & Peer-to-Peer Lending Platform

A production-ready, scalable fintech platform built with MERN stack, PostgreSQL, Docker, and cloud-ready architecture.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Features

### 1. **Authentication & User Management**
- Email/password signup and login
- JWT access + refresh token rotation
- Role-based access control (ADMIN, CAMPAIGN_CREATOR, LENDER, BORROWER)
- Password hashing with bcrypt
- Rate-limited auth endpoints
- Profile management and KYC verification

### 2. **Crowdfunding Module**
- Create, edit, and manage campaigns
- Campaign details: title, description, goal amount, deadline, category
- Campaign image upload to S3
- Real-time donation tracking
- Campaign progress visualization
- Campaign updates and comments
- Automated campaign status management

### 3. **Peer-to-Peer Lending Module**
- Borrower loan requests with detailed parameters
- Loan amount, interest rate, and duration configuration
- Lender funding with partial or full loan support
- Complete loan lifecycle management (Requested → Funded → Active → Completed → Defaulted)
- Automated EMI schedule generation
- Repayment tracking with due dates
- Credit score simulation logic

### 4. **Admin Dashboard**
- Real-time platform analytics
- Campaign and loan approval/rejection
- User moderation (block/unblock)
- Audit logs for all administrative actions
- Platform statistics and default rate tracking

### 5. **Security & Compliance**
- HTTPS-ready setup with Nginx reverse proxy
- SQL injection protection via Prisma ORM
- Secure headers (Helmet middleware)
- Encrypted environment variables
- JWT token management
- Rate limiting on auth endpoints
- CORS protection

### 6. **Performance & Scalability**
- Redis caching for frequently accessed data
- Pagination and filtering support
- Database indexing strategy
- Stateless backend design for horizontal scaling
- Connection pooling for database efficiency
- Async job handling for emails and payments

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for server state management
- **Zustand** for client state management
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **Node.js 20** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **PostgreSQL** for data persistence
- **Redis** for caching
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Zod** for input validation
- **Stripe** (test mode) for payments

### Infrastructure
- **Docker** & **Docker Compose** for containerization
- **Nginx** as reverse proxy and load balancer
- **MinIO** for S3-compatible storage
- **PostgreSQL 16** as primary database
- **Redis 7** for caching

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Frontend (TypeScript + Tailwind + React Query)    │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                    Reverse Proxy Layer                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Nginx (Load Balancing + CORS)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼───────────────────┐
        │                    │                   │
┌───────▼─────┐      ┌───────▼─────┐     ┌───────▼──────┐
│  Backend    │      │   Frontend  │     │   MinIO      │
│  Node+      │      │   (Static)  │     │   (S3-like)  │
│  Express    │      │             │     │              │
└───────┬─────┘      └─────────────┘     └──────────────┘
        │
        │  PostgreSQL Connection
        │  Redis Connection
        │
┌───────▼─────────────────────────────────────────┐
│         Data Layer                              │
│  ┌──────────────────┐  ┌─────────────────────┐  │
│  │  PostgreSQL 16   │  │   Redis 7 Cache     │  │
│  │  (Prisma ORM)    │  │                     │  │
│  └──────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Microservices Design (Ready for expansion)

```
Current Structure:
- Auth Service (user management, JWT)
- Campaign Service (crowdfunding)
- Donation Service (contributions)
- Loan Service (P2P lending)
- Admin Service (moderation & analytics)

Each service follows MVC pattern:
Service → Repository → Controller → Routes
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yashwanth-44/crowdfunding-platform.git
   cd crowdfunding-platform
   ```

2. **Setup environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - MinIO (ports 9000, 9001)
   - Backend API (port 3001)
   - Frontend (port 3000)
   - Nginx (port 80)

4. **Run database migrations and seeding**
   ```bash
   docker-compose exec backend npm run prisma:migrate
   docker-compose exec backend npm run prisma:seed
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - API Health: http://localhost:3001/health
   - MinIO Console: http://localhost:9001

### Demo Credentials

```
Email: admin@crowdfunding.com
Password: Admin@123
Role: Admin
```

## Project Structure

```
crowdfunding-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Data access layer
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── validators/       # Input validation (Zod)
│   │   ├── utils/            # Utilities (JWT, password, etc.)
│   │   ├── config/           # Configuration files
│   │   ├── app.ts            # Express app setup
│   │   └── index.ts          # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Database seeding
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # Zustand state management
│   │   ├── api/              # API client
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   ├── styles/           # Global styles
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── package.json
│   └── tailwind.config.js
│
├── docker-compose.yml        # Container orchestration
├── nginx.conf                # Nginx configuration
├── init-db.sql              # Database initialization
└── README.md
```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### Sign Up
```
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["CAMPAIGN_CREATOR", "LENDER"]
}

Response:
{
  "success": true,
  "statusCode": 201,
  "data": {
    "user": { ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  },
  "message": "User registered successfully"
}
```

#### Login
```
POST /auth/login
{
  "email": "admin@crowdfunding.com",
  "password": "Admin@123"
}
```

#### Get Profile
```
GET /auth/profile
Authorization: Bearer <accessToken>
```

### Campaign Endpoints

#### Create Campaign
```
POST /campaigns
Authorization: Bearer <accessToken>
{
  "title": "Revolutionary AI Healthcare",
  "description": "Building next-gen healthcare diagnostics...",
  "category": "TECHNOLOGY",
  "goalAmount": 50000,
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-03-15T00:00:00Z"
}
```

#### Get All Campaigns
```
GET /campaigns?status=ACTIVE&category=TECHNOLOGY&search=healthcare&page=1&limit=20
```

#### Get Campaign by ID
```
GET /campaigns/{campaignId}
```

#### Get Campaign Stats
```
GET /campaigns/{campaignId}/stats
```

### Donation Endpoints

#### Create Donation
```
POST /donations/campaign/{campaignId}
Authorization: Bearer <accessToken>
{
  "amount": 500,
  "isAnonymous": false,
  "message": "Great initiative!"
}
```

#### Get Campaign Donations
```
GET /donations/campaign/{campaignId}
```

#### Get User Donations
```
GET /donations/user/history?page=1&limit=20
Authorization: Bearer <accessToken>
```

### Loan Endpoints

#### Create Loan Request
```
POST /loans
Authorization: Bearer <accessToken>
{
  "title": "Business Expansion Loan",
  "description": "Need funds to expand my coffee shop...",
  "requestedAmount": 25000,
  "interestRate": 8.5,
  "duration": 24,
  "purpose": "Business expansion"
}
```

#### Get All Loans
```
GET /loans?status=ACTIVE&page=1&limit=20
```

#### Fund a Loan
```
POST /loans/{loanId}/fund
Authorization: Bearer <accessToken>
{
  "amount": 10000
}
```

#### Get Loan Repayments
```
GET /loans/{loanId}/repayments
```

### Admin Endpoints

#### Get Dashboard Stats
```
GET /admin/stats
Authorization: Bearer <admin_token>
```

#### Get Pending Campaigns
```
GET /admin/campaigns/pending
Authorization: Bearer <admin_token>
```

#### Approve Campaign
```
POST /admin/campaigns/{campaignId}/approve
Authorization: Bearer <admin_token>
```

#### Block User
```
POST /admin/users/{userId}/block
Authorization: Bearer <admin_token>
{
  "reason": "Suspicious activity"
}
```

## 🗄 Database Schema

### Key Tables

#### Users
- id (PK)
- email (unique)
- password (hashed)
- firstName, lastName
- roles (enum array)
- creditScore (simulated)
- walletBalance
- kycVerified
- isBlocked

#### Campaigns
- id (PK)
- title, description
- category (enum)
- status (enum: DRAFT, ACTIVE, COMPLETED, CANCELLED, EXPIRED)
- goalAmount, raisedAmount, currentAmount
- totalDonors, progressPercentage
- startDate, endDate
- creatorId (FK to Users)

#### Loans
- id (PK)
- title, description
- requestedAmount, fundedAmount
- interestRate, duration
- status (enum: REQUESTED, FUNDED, ACTIVE, COMPLETED, DEFAULTED)
- borrowerId (FK to Users)

#### Donations
- id (PK)
- amount
- donorId (FK to Users)
- campaignId (FK to Campaigns)

#### LoanRepayments
- id (PK)
- loanId (FK to Loans)
- emiNumber
- principal, interest, totalAmount
- dueDate, paidAt
- status (enum: PENDING, PAID, OVERDUE, DEFAULTED)

### Indexes

Strategic indexes for performance:

```sql
CREATE INDEX idx_campaign_status_created ON "Campaign"("status", "createdAt" DESC);
CREATE INDEX idx_loan_borrower_status ON "Loan"("borrowerId", "status");
CREATE INDEX idx_donation_campaign_created ON "Donation"("campaignId", "createdAt" DESC);
CREATE INDEX idx_user_email_active ON "User"("email", "isActive");
```

## Security Implementation

### Password Security
- Bcrypt hashing with 10 salt rounds
- Secure password validation
- Password change endpoint with old password verification

### JWT Security
- Separate access and refresh tokens
- Short-lived access tokens (15 minutes)
- Refresh token rotation
- Token validation on every protected request

### API Security
- Helmet.js for secure HTTP headers
- CORS protection
- Request body size limits
- Rate limiting on auth endpoints
- Input validation with Zod schemas

### Database Security
- Prisma ORM prevents SQL injection
- Parameterized queries
- Connection pooling
- Environment variable encryption

## Scalability Features

### Horizontal Scaling Ready
- Stateless backend design
- Database connection pooling
- Redis caching layer
- Nginx load balancing configuration
- Container orchestration with Docker Compose

### Performance Optimization
- Redis caching for:
  - Campaign listings
  - User sessions
  - Frequently accessed data
- Database indexing strategy
- Query optimization with includes/selects
- Pagination on all list endpoints
- Async error handling

### Monitoring & Logging
- Health check endpoint (`/health`)
- Request logging in development
- Error tracking and logging
- Database query logging

## Deployment

### Production Checklist

1. **Environment Variables**
   ```bash
   # Update all sensitive keys
   JWT_SECRET=<production-secret>
   STRIPE_SECRET_KEY=<production-key>
   DATABASE_URL=<production-db>
   S3_ACCESS_KEY=<production-key>
   ```

2. **SSL/TLS Setup**
   - Uncomment SSL configuration in nginx.conf
   - Add valid certificates
   - Configure domain name

3. **Database Setup**
   ```bash
   npm run prisma:migrate -- --name production_migration
   npm run prisma:seed
   ```

4. **Docker Build**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Scaling Strategies

#### Vertical Scaling
- Increase server resources (CPU, RAM)
- Upgrade database machine tier

#### Horizontal Scaling
- Run multiple backend instances behind Nginx
- Use database read replicas
- Implement Redis cluster
- Use managed database services (AWS RDS, Azure Database)

#### Database Optimization
- Add read replicas for read-heavy operations
- Implement connection pooling (pgBouncer)
- Archive old data
- Optimize slow queries

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---
