#!/bin/bash

echo "🎓 Alumni Management System Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 14+ first."
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo ""

# Backend setup
echo "🔧 Setting up Backend..."
cd backend

if [ ! -f .env ]; then
    echo "⚠️  Creating .env file..."
    cp .env.example .env
    echo "❗ Please edit the .env file with your database credentials before continuing."
    echo ""
    echo "Database setup instructions:"
    echo "1. Create a PostgreSQL database named 'alumni_db'"
    echo "2. Update DATABASE_URL in .env with your credentials"
    echo "3. Run: npx prisma db push"
    echo ""
    read -p "Press Enter when you've configured the database..."
fi

echo "📦 Installing backend dependencies..."
npm install

echo "🔄 Setting up database..."
npx prisma generate

echo "✅ Backend setup complete!"
cd ..

# Frontend setup
echo ""
echo "🔧 Setting up Frontend..."
cd frontend

echo "📦 Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete!"
cd ..

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "2. Start the frontend (Terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - API docs: ./docs/API.md"
echo "   - Setup guide: ./docs/README.md"
echo ""
echo "🔑 Default Admin Account:"
echo "   You can create an admin user by manually setting the role to 'ADMIN' in the database."