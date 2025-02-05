#!/bin/bash

# Load environment variables from .env file
set -o allexport
source .env.db.local
set +o allexport

# Dump only the data from production
PGPASSWORD=$POSTGRES_PASSWORD pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DATABASE --data-only -Fc -f $DUMP_FILE

# Truncate all tables in local DB before restoring
psql -h $LOCAL_HOST -U $LOCAL_USER -d $LOCAL_DATABASE -c "
DO \$\$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE;';
    END LOOP;
END
\$\$;"

# Restore only the data to local database
pg_restore --no-owner --no-acl -h $LOCAL_HOST -U $LOCAL_USER -d $LOCAL_DATABASE $DUMP_FILE

echo "Database sync complete!"
