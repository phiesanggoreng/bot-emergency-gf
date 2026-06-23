#!/bin/bash
set -e
echo "🔧 Setting up PostgreSQL for Sweety Bot..."

# Step 1: Clean & re-init
echo "→ Removing old data..."
rm -rf /var/lib/pgsql/data
mkdir -p /var/lib/pgsql/data
chown postgres:postgres /var/lib/pgsql/data
chmod 700 /var/lib/pgsql/data

echo "→ Initializing database..."
postgresql-setup --initdb

# Step 2: Fix pg_hba.conf PROPERLY (only change auth method lines)
echo "→ Configuring authentication..."
PG_HBA="/var/lib/pgsql/data/pg_hba.conf"
cat > "$PG_HBA" << 'EOF'
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
EOF
chown postgres:postgres "$PG_HBA"

# Step 3: Start PostgreSQL
echo "→ Starting PostgreSQL..."
systemctl restart postgresql
sleep 2

# Step 4: Create user password & database
echo "→ Creating database..."
su - postgres -c "psql -c \"ALTER USER postgres PASSWORD 'postgres';\""
su - postgres -c "psql -c \"CREATE DATABASE sweety_bot;\""

echo ""
echo "✅ PostgreSQL siap! Database 'sweety_bot' berhasil dibuat."
