#!/bin/bash

# SecureAuth AI - Database Setup Script
# This script helps you set up your Supabase database

echo "🔒 SecureAuth AI - Database Setup"
echo "=================================="
echo ""

# Check if schema file exists
if [ ! -f "supabase/schema.sql" ]; then
    echo "❌ Error: supabase/schema.sql not found!"
    echo "Please make sure you're running this script from the project root directory."
    exit 1
fi

echo "📋 Database Setup Instructions:"
echo ""
echo "1. Go to your Supabase project dashboard:"
echo "   https://supabase.com/dashboard"
echo ""
echo "2. Select your project: eociqzjowzjfxpvpupjr"
echo ""
echo "3. Navigate to SQL Editor (left sidebar)"
echo ""
echo "4. Create a new query and copy the contents of supabase/schema.sql"
echo ""
echo "5. Click 'Run' to execute the schema"
echo ""
echo "6. Verify the tables were created in Table Editor"
echo ""

# Show the schema file
echo "📄 Schema file contents (supabase/schema.sql):"
echo "-----------------------------------------------"
cat supabase/schema.sql
echo ""
echo "-----------------------------------------------"
echo ""

echo "✅ After running the schema:"
echo "   - Refresh your application"
echo "   - The database setup alert should disappear"
echo "   - You can now register users and use biometric authentication"
echo ""

echo "🔗 Useful Links:"
echo "   - Supabase Dashboard: https://supabase.com/dashboard"
echo "   - Project URL: https://eociqzjowzjfxpvpupjr.supabase.co"
echo "   - Setup Guide: SUPABASE_SETUP.md"
echo ""

echo "🚀 Ready to set up your database? Follow the steps above!"
echo ""
echo "Press Enter to continue..."
read
