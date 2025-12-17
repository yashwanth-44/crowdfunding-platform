# Quick Start Guide

## Prerequisites
- Docker & Docker Compose installed
- Git

## 30-Second Setup

```bash
# 1. Clone and navigate
git clone https://github.com/yashwanth-44/crowdfunding-platform.git
cd crowdfunding-platform

# 2. Start all services
docker-compose up -d

# 3. Wait for services to be healthy
sleep 10

# 4. Run migrations and seed database
docker-compose exec -T backend npm run prisma:migrate -- --skip-generate
docker-compose exec -T backend npm run prisma:seed

# 5. Access the application
# Frontend: http://localhost:3000
# API: http://localhost:3001/api
```

## Demo Credentials

```
Admin Account
Email: admin@crowdfunding.com
Password: Admin@123

Campaign Creator
Email: creator@example.com
Password: Creator@123

Lender
Email: lender@example.com
Password: Lender@123

Borrower
Email: borrower@example.com
Password: Borrower@123
```

## Access Points

| Service       | URL                          | Purpose         |
|---------------|------------------------------|-----------------|
| Frontend      | http://localhost:3000        | Web application |
| API           | http://localhost:3001/api    | REST API        |
| Health Check  | http://localhost:3001/health | Service status  |
| MinIO Console | http://localhost:9001        | S3 file storage |
| PostgreSQL    | localhost:5432               | Database        |
| Redis         | localhost:6379               | Cache           |

## Development Workflow

### Backend Development

```bash
# Terminal 1: Start backend in watch mode
cd backend
npm install
npm run dev

# Backend will be at http://localhost:3001
```

### Frontend Development

```bash
# Terminal 2: Start frontend in watch mode
cd frontend
npm install
npm run dev

# Frontend will be at http://localhost:5173
```

### Database Migrations

```bash
# Create a new migration
cd backend
npm run prisma:migrate -- --name migration_name

# Reset database (careful!)
npm run prisma:migrate reset
```

## Docker Compose Services

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Stop Services
```bash
docker-compose down
```

### Remove Everything (including volumes)
```bash
docker-compose down -v
```

## Common Issues

### Port Already in Use
```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different ports in docker-compose.yml
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Redis Connection Failed
```bash
# Restart Redis
docker-compose restart redis
```

## Testing the API

### Using curl

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crowdfunding.com","password":"Admin@123"}'

# Get campaigns
curl http://localhost:3001/api/campaigns

# Get user profile (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/auth/profile
```

### Using Postman

1. Import the API endpoints from `/docs/postman-collection.json`
2. Set environment variable `base_url` to `http://localhost:3001/api`
3. Set `auth_token` after login response

## Next Steps

1. **Explore the codebase** - Start with backend `src/index.ts` and frontend `src/App.tsx`
2. **Read the documentation** - Check `README.md` for architecture details
3. **Run the seed script** - Database is pre-populated with demo data
4. **Try the API** - Use Postman or curl to test endpoints
5. **Customize** - Modify campaigns, loans, and features for your needs

## Production Deployment

See `README.md` for detailed deployment instructions.

## Support

- [Full Documentation](./README.md)
- [Report Issues](https://github.com/yashwanth-44/crowdfunding-platform/issues)
- [Discussions](https://github.com/yashwanth-44/crowdfunding-platform/discussions)