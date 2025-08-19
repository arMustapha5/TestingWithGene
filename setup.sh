#!/bin/bash

# SecureAuth AI - Complete Setup Script
# AI-Enhanced Bioauthentication Testing Framework

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    print_success "Node.js $(node --version) ✓"
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed."
        exit 1
    fi
    print_success "npm $(npm --version) ✓"
    
    # Check Python
    if ! command_exists python3; then
        print_error "Python 3 is not installed. Please install Python 3.8+ first."
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)
    
    if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 8 ]); then
        print_error "Python 3.8+ is required. Current version: $PYTHON_VERSION"
        exit 1
    fi
    print_success "Python $PYTHON_VERSION ✓"
    
    # Check pip
    if ! command_exists pip3; then
        print_error "pip3 is not installed."
        exit 1
    fi
    print_success "pip3 ✓"
    
    # Check Docker (optional)
    if command_exists docker; then
        print_success "Docker $(docker --version) ✓"
    else
        print_warning "Docker not found. Docker deployment will not be available."
    fi
    
    # Check Docker Compose (optional)
    if command_exists docker-compose; then
        print_success "Docker Compose ✓"
    else
        print_warning "Docker Compose not found. Docker deployment will not be available."
    fi
}

# Function to install frontend dependencies
install_frontend() {
    print_status "Installing frontend dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Frontend dependencies installed successfully"
    else
        print_error "package.json not found in current directory"
        exit 1
    fi
}

# Function to install backend dependencies
install_backend() {
    print_status "Installing backend dependencies..."
    
    if [ -d "server" ] && [ -f "server/package.json" ]; then
        cd server
        npm install
        cd ..
        print_success "Backend dependencies installed successfully"
    else
        print_error "Backend directory or package.json not found"
        exit 1
    fi
}

# Function to install Python dependencies
install_python_deps() {
    print_status "Installing Python dependencies..."
    
    if [ -f "tests/requirements.txt" ]; then
        cd tests
        pip3 install -r requirements.txt
        cd ..
        print_success "Python dependencies installed successfully"
    else
        print_error "Python requirements.txt not found"
        exit 1
    fi
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Create necessary directories
    mkdir -p reports screenshots logs
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# SecureAuth AI Environment Configuration
NODE_ENV=development
PORT=3001
VITE_API_URL=http://localhost:3001
VITE_WEBAUTHN_RP_ID=localhost

# Database Configuration (for production)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=secureauth
# DB_USER=secureauth_user
# DB_PASSWORD=secureauth_password

# Redis Configuration (for production)
# REDIS_HOST=localhost
# REDIS_PORT=6379

# Security Configuration
# JWT_SECRET=your-secret-key-here
# SESSION_SECRET=your-session-secret-here
EOF
        print_success "Environment file created"
    else
        print_warning "Environment file already exists"
    fi
}

# Function to setup database (optional)
setup_database() {
    if command_exists docker && command_exists docker-compose; then
        print_status "Setting up database with Docker..."
        
        # Start only the database services
        docker-compose up -d postgres redis
        
        print_status "Waiting for database to be ready..."
        sleep 10
        
        print_success "Database services started"
    else
        print_warning "Docker not available. Database setup skipped."
    fi
}

# Function to run initial tests
run_initial_tests() {
    print_status "Running initial tests to verify setup..."
    
    # Check if backend is running
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        print_success "Backend is running"
    else
        print_warning "Backend is not running. Start it with: npm run server"
    fi
    
    # Check if frontend is running
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        print_success "Frontend is running"
    else
        print_warning "Frontend is not running. Start it with: npm run dev"
    fi
}

# Function to display next steps
show_next_steps() {
    echo
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Start the backend server:"
    echo "   cd server && npm start"
    echo
    echo "2. Start the frontend application:"
    echo "   npm run dev"
    echo
    echo "3. Run the test suite:"
    echo "   npm run test:selenium"
    echo "   or"
    echo "   python tests/run_tests.py --comprehensive"
    echo
    echo "4. Access the application:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend API: http://localhost:3001"
    echo
    echo "5. For Docker deployment:"
    echo "   docker-compose up -d"
    echo
    echo -e "${YELLOW}Note:${NC} Make sure to have Chrome browser installed for WebAuthn testing."
    echo
}

# Function to check Chrome installation
check_chrome() {
    print_status "Checking Chrome installation for WebAuthn testing..."
    
    if command_exists google-chrome; then
        print_success "Google Chrome is installed"
    elif command_exists chromium-browser; then
        print_success "Chromium is installed"
    elif command_exists chrome; then
        print_success "Chrome is installed"
    else
        print_warning "Chrome/Chromium not found. WebAuthn testing may not work properly."
        print_warning "Please install Chrome or Chromium for full functionality."
    fi
}

# Main setup function
main() {
    echo -e "${BLUE}🔒 SecureAuth AI - Complete Setup Script${NC}"
    echo "AI-Enhanced Bioauthentication Testing Framework"
    echo "================================================"
    echo
    
    # Check system requirements
    check_requirements
    
    # Install dependencies
    install_frontend
    install_backend
    install_python_deps
    
    # Setup environment
    setup_environment
    
    # Check Chrome installation
    check_chrome
    
    # Setup database (optional)
    setup_database
    
    # Run initial tests
    run_initial_tests
    
    # Show next steps
    show_next_steps
}

# Check if script is run with sudo
if [ "$EUID" -eq 0 ]; then
    print_warning "Running with sudo. This is not recommended for development."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run main setup
main "$@"
