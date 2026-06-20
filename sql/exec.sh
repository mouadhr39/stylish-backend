#!/bin/bash
echo "Cleaning up PostgreSQL database and schema..."
psql -U hayabusa -d stylish -f clean.db.sql
echo "Setting up PostgreSQL database and schema..."
psql -U hayabusa -d stylish -f db.schema.sql
echo "Inserting sample data into the database..."
psql -U hayabusa -d stylish -f sample.shoes.data.sql
echo "Inserting user data into the database..."
psql -U hayabusa -d stylish -f sample.user.data.sql
echo "Database setup complete."