#!/bin/bash

# Docker Development Environment Setup Script
# Usage: ./scripts/docker-setup.sh [dev|prod|test]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-dev}

echo -e "${BLUE}🐳 Real Estate DX - Docker Environment Setup${NC}"
echo -e "${BLUE}================================================${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    print_status "Docker is installed and running"
}

# Check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    print_status "Docker Compose is available"
}

# Create necessary directories
create_directories() {
    echo -e "${BLUE}📁 Creating necessary directories...${NC}"
    
    directories=(
        "infrastructure/nginx/sites-available"
        "infrastructure/ssl"
        "infrastructure/monitoring"
        "credentials"
        "logs"
    )

    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_status "Created directory: $dir"
        fi
    done
}

# Create environment files if they don't exist
create_env_files() {
    echo -e "${BLUE}📄 Creating environment files...${NC}"

    # .env for API
    if [ ! -f "apps/api/.env" ]; then
        cat > apps/api/.env << EOF
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/real_estate_dx

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10MB

# API Configuration
PORT=8000
NODE_ENV=development

# Google Cloud (AI Services)
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-service-account.json

# External APIs
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Logging
LOG_LEVEL=debug
EOF
        print_status "Created apps/api/.env"
    fi

    # .env.local for Web
    if [ ! -f "apps/web/.env.local" ]; then
        cat > apps/web/.env.local << EOF
# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production

# API Configuration
API_BASE_URL=http://localhost:8000

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EOF
        print_status "Created apps/web/.env.local"
    fi

    # .env for AI Worker
    if [ ! -f "apps/ai-worker/.env" ]; then
        cat > apps/ai-worker/.env << EOF
# Python Environment
PYTHON_ENV=development

# Redis
REDIS_URL=redis://localhost:6379

# API
API_URL=http://localhost:8000

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-service-account.json

# AI Models
GEMINI_API_KEY=your-gemini-api-key

# Logging
LOG_LEVEL=debug
EOF
        print_status "Created apps/ai-worker/.env"
    fi

    print_warning "Please update the environment files with your actual credentials!"
}

# Build and start services based on environment
start_services() {
    echo -e "${BLUE}🚀 Starting services for ${ENVIRONMENT} environment...${NC}"

    case $ENVIRONMENT in
        "dev")
            echo "Starting development environment..."
            docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
            ;;
        "prod")
            echo "Starting production environment..."
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
            ;;
        "test")
            echo "Starting test environment..."
            docker-compose -f docker-compose.yml --profile test up --build -d
            ;;
        *)
            print_error "Invalid environment. Use: dev, prod, or test"
            exit 1
            ;;
    esac
}

# Run database migrations
run_migrations() {
    if [ "$ENVIRONMENT" = "dev" ]; then
        echo -e "${BLUE}🗄️ Running database migrations...${NC}"
        
        # Wait for database to be ready
        echo "Waiting for database to be ready..."
        sleep 10
        
        # Run Prisma migrations
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml --profile migration up migration
        print_status "Database migrations completed"
    fi
}

# Display service information
show_services() {
    echo -e "${BLUE}📋 Service Information${NC}"
    echo -e "${BLUE}=====================${NC}"
    
    case $ENVIRONMENT in
        "dev")
            echo -e "🌐 Web Frontend:     ${GREEN}http://localhost:3000${NC}"
            echo -e "🔧 API Server:       ${GREEN}http://localhost:8000${NC}"
            echo -e "🤖 AI Worker:        ${GREEN}http://localhost:8001${NC}"
            echo -e "🗄️ Database:         ${GREEN}localhost:5432${NC}"
            echo -e "🔴 Redis:            ${GREEN}localhost:6379${NC}"
            echo -e "📊 PgAdmin:          ${GREEN}http://localhost:5050${NC} (admin@example.com / admin)"
            echo -e "🔍 Redis Commander:  ${GREEN}http://localhost:8081${NC}"
            ;;
        "prod")
            echo -e "🌐 Web Frontend:     ${GREEN}http://localhost:3000${NC}"
            echo -e "🔧 API Server:       ${GREEN}http://localhost:8000${NC}"
            echo -e "🤖 AI Worker:        ${GREEN}http://localhost:8001${NC}"
            ;;
    esac
    
    echo ""
    echo -e "${BLUE}📝 Useful Commands${NC}"
    echo -e "${BLUE}==================${NC}"
    echo -e "View logs:           ${YELLOW}docker-compose logs -f [service]${NC}"
    echo -e "Stop services:       ${YELLOW}docker-compose down${NC}"
    echo -e "Restart service:     ${YELLOW}docker-compose restart [service]${NC}"
    echo -e "Execute in container:${YELLOW}docker-compose exec [service] sh${NC}"
    echo -e "View container status:${YELLOW}docker-compose ps${NC}"
}

# Health check
health_check() {
    echo -e "${BLUE}🔍 Performing health check...${NC}"
    sleep 15  # Wait for services to start
    
    # Check API health
    if curl -f http://localhost:8000/health &> /dev/null; then
        print_status "API server is healthy"
    else
        print_warning "API server health check failed"
    fi
    
    # Check Web frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        print_status "Web frontend is accessible"
    else
        print_warning "Web frontend health check failed"
    fi
}

# Cleanup function
cleanup() {
    echo -e "${BLUE}🧹 Cleanup options:${NC}"
    echo "1. Stop all services: docker-compose down"
    echo "2. Remove all data: docker-compose down -v"
    echo "3. Remove images: docker-compose down --rmi all"
    echo "4. Full cleanup: docker system prune -a --volumes"
}

# Main execution
main() {
    echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
    echo ""
    
    check_docker
    check_docker_compose
    create_directories
    create_env_files
    start_services
    run_migrations
    health_check
    show_services
    
    echo ""
    print_status "Docker environment setup completed!"
    print_warning "Remember to update environment files with actual credentials"
    
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Update environment files with your credentials"
    echo "2. Place Google Cloud service account key in credentials/"
    echo "3. Access the application at http://localhost:3000"
    echo ""
    echo "For cleanup options, run: $0 cleanup"
}

# Handle cleanup command
if [ "$1" = "cleanup" ]; then
    cleanup
    exit 0
fi

# Run main function
main