# Architecture & Scalability Guide

## System Architecture

### Monolithic with Service-Oriented Design

The current architecture is a well-structured monolithic application with clear service boundaries, making it easy to transition to microservices later.

```
┌──────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  React 18 + TypeScript + Tailwind + React Query          │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│              API Gateway (Nginx)                         │
│  - Request routing                                       │
│  - Load balancing                                        │
│  - SSL termination                                       │
│  - Rate limiting (via middleware)                        │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│            Backend API Server (Node.js)                  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐     │
│  │         Controllers (Request Handlers)          │     │
│  │  - AuthController                               │     │
│  │  - CampaignController                           │     │
│  │  - DonationController                           │     │
│  │  - LoanController                               │     │
│  │  - AdminController                              │     │
│  └────────────┬────────────────────────────────────┘     │
│               │                                          │
│  ┌────────────▼────────────────────────────────────┐     │
│  │        Services (Business Logic)                │     │
│  │  - AuthService                                  │     │
│  │  - CampaignService                              │     │
│  │  - DonationService                              │     │
│  │  - LoanService                                  │     │
│  └────────────┬────────────────────────────────────┘     │
│               │                                          │
│  ┌────────────▼────────────────────────────────────┐     │
│  │    Repositories (Data Access)                   │     │
│  │  - PrismaClient                                 │     │
│  └────────────┬────────────────────────────────────┘     │
│               │                                          │
└───────────────┼──────────────────────────────────────────┘
                │
     ┌──────────┴────────┬────────────────┐
     │                   │                │
┌────▼─────┐        ┌────▼────┐        ┌──▼────┐
│PostgreSQL│        │  Redis  │        │MinIO  │
│  (Data)  │        │ (Cache) │        │(File) │
└──────────┘        └─────────┘        └───────┘
```

### Service Layer Architecture

Each service follows the Service → Repository pattern:

```
Request
  ↓
Controller (Route Handler)
  ↓
Service (Business Logic)
  ├─ Validation
  ├─ Caching
  ├─ Business Rules
  └─ Error Handling
  ↓
Repository (Data Access)
  ├─ Prisma ORM
  └─ Database Queries
  ↓
Database
  ↓
Response
```

## Data Flow Examples

### Campaign Creation Flow

```
1. POST /api/campaigns
     ↓
2. CampaignController.createCampaign()
   - Validates request (Zod schema)
   - Extracts user from JWT
     ↓
3. CampaignService.createCampaign()
   - Validates business rules
   - Checks creator authorization
   - Creates campaign record
   - Clears related caches
     ↓
4. Prisma ORM
   - Executes INSERT query
   - Returns created record
     ↓
5. Response sent to client
   - 201 Created status
   - Campaign data
```

### Donation & Campaign Update Flow

```
1. POST /api/donations/campaign/{campaignId}
     ↓
2. DonationController.createDonation()
     ↓
3. DonationService.createDonation()
   - Validates campaign status
   - Validates amount
   - Creates transaction (Prisma transaction)
     ↓
4. Within Database Transaction:
   - Insert donation record
   - Insert transaction record
   - Update campaign stats (raisedAmount, totalDonors, progressPercentage)
   - Update user wallet if applicable
     ↓
5. Cache Invalidation
   - Clear campaign cache
   - Clear campaign stats cache
   - Clear user donation history cache
     ↓
6. Response
   - Donation created
   - Campaign updated
```

## Scalability Patterns

### 1. Horizontal Scaling

#### Current Setup (Single Instance)
```
Request
  ↓
  └─→ Node.js Server Instance
        │
        ├─→ PostgreSQL
        ├─→ Redis
        └─→ MinIO
```

#### Scaled Setup (Multiple Instances)
```
Requests
  ↓
Nginx Load Balancer
  ├─→ Node Server Instance 1
  ├─→ Node Server Instance 2
  ├─→ Node Server Instance 3
  └─→ Node Server Instance N
        │
        └─→ PostgreSQL (with read replicas)
        ├─→ Redis (cluster)
        └─→ MinIO (distributed)
```

#### Docker Compose Scaling Example
```yaml
backend:
  deploy:
    replicas: 3  # Run 3 instances
    resources:
      limits:
        cpus: '1'
        memory: 512M
```

### 2. Database Optimization

#### Read Replicas
```
Write Operations:  ─→ Primary PostgreSQL Server
Read Operations:   ─→ Read Replica 1, 2, 3
```

#### Connection Pooling
```
App Server ─→ PgBouncer (Pool Manager)
              ├─→ Connection 1
              ├─→ Connection 2
              ├─→ Connection 3
              └─→ Connection N
              ├─→ PostgreSQL Server
```

### 3. Caching Strategy

#### Redis Cache Layers

```
1. Session Cache
   - User sessions
   - Authentication tokens
   - TTL: 24 hours

2. Data Cache
   - Campaign listings
   - User profiles
   - Campaign stats
   - TTL: 15 minutes to 1 hour

3. Computed Cache
   - Analytics data
   - Dashboard stats
   - Reports
   - TTL: 1 hour
```

#### Cache Invalidation Patterns

```
Pattern 1: Time-based (TTL)
- Automatic expiration
- Simple but may serve stale data

Pattern 2: Event-based
- Update campaign → Clear campaign cache
- Donate → Clear stats cache
- More accurate but requires coordination

Pattern 3: Hybrid
- Short TTL + event-based invalidation
- Best for frequently changing data
```

### 4. Microservices Migration Path

Current monolith can evolve to microservices:

```
Phase 1 (Current): Monolithic
├─ Auth Service
├─ Campaign Service
├─ Loan Service
├─ Donation Service
└─ Admin Service
   All in one codebase

Phase 2: Modular Monolith
├─ auth-module/
├─ campaign-module/
├─ loan-module/
├─ donation-module/
└─ admin-module/
   Still one app, better organization

Phase 3: Microservices
├─ auth-service (separate deployment)
├─ campaign-service (separate deployment)
├─ loan-service (separate deployment)
├─ donation-service (separate deployment)
└─ admin-service (separate deployment)
   Independent scaling
```

## Performance Optimization

### Database Query Optimization

```typescript
// ❌ Bad: N+1 query problem
const campaigns = await prisma.campaign.findMany();
campaigns.forEach(async (c) => {
  const creator = await prisma.user.findUnique({
    where: { id: c.creatorId }
  }); // N additional queries
});

// ✅ Good: Single query with includes
const campaigns = await prisma.campaign.findMany({
  include: {
    creator: {
      select: { id: true, firstName: true, lastName: true }
    }
  }
});
```

### Pagination Implementation

```typescript
// ✅ Always paginate list endpoints
const skip = (page - 1) * limit;
const [items, total] = await Promise.all([
  prisma.item.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' }
  }),
  prisma.item.count()
]);
```

### Index Strategy

```sql
-- Campaign queries
CREATE INDEX idx_campaign_status_created 
  ON "Campaign"("status", "createdAt" DESC);

CREATE INDEX idx_campaign_creator 
  ON "Campaign"("creatorId");

-- Loan queries
CREATE INDEX idx_loan_borrower_status 
  ON "Loan"("borrowerId", "status");

-- Donation queries
CREATE INDEX idx_donation_campaign_created 
  ON "Donation"("campaignId", "createdAt" DESC);

-- User queries
CREATE INDEX idx_user_email_active 
  ON "User"("email", "isActive");
```

## Security at Scale

### Rate Limiting Tiers

```
User Type        Requests/Minute    Window
─────────────────────────────────────────
Anonymous        30                 1 min
Authenticated    100                5 min
Premium          500                5 min
Admin            Unlimited          -
```

### API Key Management

```typescript
// For external API access
const createApiKey = async (userId: string) => {
  const key = generateSecureKey(); // 32+ chars
  const hash = hashKey(key);
  
  await db.apiKey.create({
    userId,
    keyHash: hash,
    isActive: true,
    lastUsed: null
  });
  
  return key; // Return once
};
```

## Monitoring & Logging

### Application Metrics to Track

```
Performance:
- Response time (p50, p95, p99)
- Database query time
- Cache hit rate
- Request per second

Business:
- Campaign creation rate
- Donation count and total
- Loan approval rate
- User registration rate

System:
- CPU usage
- Memory usage
- Disk I/O
- Network I/O
```

### Logging Strategy

```typescript
// Structured logging
logger.info('campaign_created', {
  campaignId: campaign.id,
  creatorId: creator.id,
  goalAmount: campaign.goalAmount,
  duration: Date.now() - startTime,
  timestamp: new Date()
});

logger.error('payment_failed', {
  campaignId,
  donorId,
  amount,
  error: error.message,
  errorCode: error.code,
  timestamp: new Date()
});
```

## Deployment Strategies

### Blue-Green Deployment

```
Current (Blue):  v1.0 ─→ 100% traffic
                        ↓
Prepared (Green): v1.1 ─→ 0% traffic
                        ↓
After validation: v1.1 ─→ 100% traffic
                  v1.0 ─→ 0% traffic (standby)
```

### Canary Deployment

```
v1.0 ─→ 95% traffic
v1.1 ─→ 5% traffic (monitor)
       ↓
v1.0 ─→ 80% traffic
v1.1 ─→ 20% traffic (monitor)
       ↓
v1.0 ─→ 0% traffic
v1.1 ─→ 100% traffic
```

## Scalability Checklist

- [ ] Implement Redis caching for hot data
- [ ] Add database read replicas
- [ ] Set up connection pooling (PgBouncer)
- [ ] Implement proper pagination on all endpoints
- [ ] Add database indexes for common queries
- [ ] Set up CDN for static assets
- [ ] Implement rate limiting
- [ ] Add application monitoring (New Relic, DataDog)
- [ ] Set up log aggregation (ELK stack)
- [ ] Implement database query optimization
- [ ] Configure horizontal auto-scaling
- [ ] Set up load balancing (Nginx or AWS ELB)
- [ ] Implement health checks
- [ ] Add database backup and recovery
- [ ] Set up disaster recovery plan

---

For production deployment with these patterns, refer to the main README.md file. 