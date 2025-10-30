# Database Configuration

Awesome Comment supports TiDB Cloud (recommended) and PostgreSQL for data storage.

## Database Schema

### Tables Overview

The database consists of the following main tables:

- `comments` - Store all comments
- `users` - User information
- `posts` - Post/page metadata
- `reactions` - Likes and reactions
- `translations` - Cached translations
- `spam_detection` - Spam detection records

## TiDB Cloud Setup (Recommended)

TiDB Cloud offers excellent scalability and MySQL compatibility.

### 1. Create a Cluster

1. Go to [TiDB Cloud Console](https://tidbcloud.com/)
2. Click "Create Cluster"
3. Choose "Serverless" tier (free tier available)
4. Select a region close to your users
5. Wait for cluster creation (~2-3 minutes)

### 2. Get Connection Credentials

From your cluster dashboard:

1. Click "Connect"
2. Copy the connection string
3. Get your Public Key and Private Key

### 3. Configure Environment Variables

Add to your `.env`:

```bash
TIDB_HOST=gateway01.your-region.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your-username
TIDB_PASSWORD=your-password
TIDB_DATABASE=awesome_comment
TIDB_PUBLIC_KEY=your-public-key
TIDB_PRIVATE_KEY=your-private-key

# SSL is required for TiDB Cloud
TIDB_SSL_CA=true
```

### 4. Run Migrations

```bash
cd packages/admin
pnpm run db:migrate
```

## PostgreSQL Setup

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Docker:**
```bash
docker run --name awesome-comment-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=awesome_comment \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE awesome_comment;

# Create user (optional)
CREATE USER awesome_comment_user WITH PASSWORD 'your-secure-password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE awesome_comment TO awesome_comment_user;

\q
```

### 3. Configure Connection

Add to `.env`:

```bash
DATABASE_URL=postgresql://awesome_comment_user:your-secure-password@localhost:5432/awesome_comment
```

### 4. Run Migrations

```bash
pnpm run db:migrate
```

## Database Schema Details

### Comments Table

```sql
CREATE TABLE comments (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  parent_id VARCHAR(36),
  status ENUM('pending', 'approved', 'spam', 'deleted') DEFAULT 'pending',
  language VARCHAR(10),
  translated_content JSON,
  likes_count INT DEFAULT 0,
  replies_count INT DEFAULT 0,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### Users Table

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  avatar_url TEXT,
  auth_provider ENUM('auth0', 'google', 'github') DEFAULT 'auth0',
  is_admin BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  comment_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_auth_provider (auth_provider)
);
```

### Posts Table

```sql
CREATE TABLE posts (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500),
  url TEXT,
  comment_count INT DEFAULT 0,
  last_comment_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_comment_count (comment_count),
  INDEX idx_last_comment_at (last_comment_at)
);
```

### Reactions Table

```sql
CREATE TABLE reactions (
  id VARCHAR(36) PRIMARY KEY,
  comment_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  type ENUM('like', 'love', 'laugh', 'sad', 'angry') DEFAULT 'like',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_reaction (comment_id, user_id, type),
  INDEX idx_comment_id (comment_id),
  INDEX idx_user_id (user_id),
  
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);
```

### Translations Cache Table

```sql
CREATE TABLE translations (
  id VARCHAR(36) PRIMARY KEY,
  comment_id VARCHAR(36) NOT NULL,
  source_language VARCHAR(10) NOT NULL,
  target_language VARCHAR(10) NOT NULL,
  translated_content TEXT NOT NULL,
  translator ENUM('openai', 'gemini', 'manual') DEFAULT 'openai',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_translation (comment_id, target_language),
  INDEX idx_comment_id (comment_id),
  
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);
```

## Migrations

### Running Migrations

```bash
# Run all pending migrations
pnpm run db:migrate

# Rollback last migration
pnpm run db:rollback

# Check migration status
pnpm run db:status
```

### Creating New Migrations

```bash
# Create a new migration file
pnpm run db:migration:create add_new_feature

# Edit the migration file in migrations/
# Then run: pnpm run db:migrate
```

## Indexes and Performance

### Recommended Indexes

The schema includes essential indexes. For high-traffic sites, consider:

```sql
-- Composite index for comment queries
CREATE INDEX idx_post_status_created ON comments(post_id, status, created_at DESC);

-- Index for user comments
CREATE INDEX idx_user_created ON comments(user_id, created_at DESC);

-- Full-text search index (MySQL/TiDB)
CREATE FULLTEXT INDEX idx_content_fulltext ON comments(content);

-- Full-text search index (PostgreSQL)
CREATE INDEX idx_content_search ON comments USING GIN(to_tsvector('english', content));
```

### Query Optimization

**Get comments for a post:**
```sql
-- Optimized query
SELECT * FROM comments 
WHERE post_id = ? 
  AND status = 'approved' 
ORDER BY created_at DESC 
LIMIT 50;
```

**Get user's comment history:**
```sql
SELECT c.*, p.title 
FROM comments c
JOIN posts p ON c.post_id = p.id
WHERE c.user_id = ?
ORDER BY c.created_at DESC
LIMIT 20;
```

## Backup and Restore

### TiDB Cloud Backups

TiDB Cloud automatically backs up your data:
- Point-in-time recovery available
- Backups retained for 7 days (free tier)
- Manual backups can be triggered from console

### PostgreSQL Backups

**Create Backup:**
```bash
pg_dump -U awesome_comment_user awesome_comment > backup.sql
```

**Restore Backup:**
```bash
psql -U awesome_comment_user awesome_comment < backup.sql
```

**Automated Backups:**
```bash
# Add to crontab for daily backups
0 2 * * * pg_dump -U awesome_comment_user awesome_comment > /backups/ac_$(date +\%Y\%m\%d).sql
```

## Data Retention

Configure automatic cleanup of old data:

```sql
-- Delete old spam comments (older than 30 days)
DELETE FROM comments 
WHERE status = 'spam' 
  AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Delete orphaned reactions
DELETE FROM reactions 
WHERE comment_id NOT IN (SELECT id FROM comments);
```

Schedule this with a cron job or Cloudflare Worker.

## Monitoring

### TiDB Cloud Dashboard

Monitor your cluster:
- Query performance
- Connection count
- Storage usage
- Slow queries

### PostgreSQL Monitoring

**Check database size:**
```sql
SELECT pg_size_pretty(pg_database_size('awesome_comment'));
```

**Find slow queries:**
```sql
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Active connections:**
```sql
SELECT count(*) FROM pg_stat_activity;
```

## Scaling Considerations

### When to Scale

Consider scaling when:
- Database response time > 100ms
- CPU usage consistently > 70%
- Storage > 80% capacity
- Concurrent connections near limit

### Scaling Options

**TiDB Cloud:**
- Upgrade to Dedicated tier
- Increase compute units
- Add read replicas
- Enable auto-scaling

**PostgreSQL:**
- Vertical scaling (more CPU/RAM)
- Read replicas for read-heavy workloads
- Connection pooling (PgBouncer)
- Partitioning large tables

## Troubleshooting

### Connection Issues

```bash
# Test database connection
pnpm run db:test

# Check if database is accessible
mysql -h <host> -P 4000 -u <user> -p  # TiDB
psql -h <host> -U <user> -d awesome_comment  # PostgreSQL
```

### Migration Errors

```bash
# Reset database (WARNING: deletes all data)
pnpm run db:reset

# Manually run SQL
mysql -h <host> -u <user> -p < migrations/001_init.sql
```

### Performance Issues

1. Check slow query log
2. Verify indexes are being used: `EXPLAIN SELECT ...`
3. Monitor connection pool usage
4. Consider adding more indexes
5. Check Redis cache hit rate

## Next Steps

- [Authentication Setup](/setup/authentication) - Configure user authentication
- [Backend Setup](/setup/backend) - Complete server configuration
- [Self-Hosting](/setup/self-hosting) - Deploy to production

## Resources

- [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Best Practices](https://github.com/awesome-comment/awesome-comment/wiki/Database-Best-Practices)
