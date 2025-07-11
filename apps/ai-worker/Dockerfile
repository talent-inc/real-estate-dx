# AI Worker Service Dockerfile
# For OCR and AI processing services

# Development stage
FROM python:3.11-slim AS development
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 8001

# Development command
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]

# Production stage
FROM python:3.11-slim AS production
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --gid 1001 --system python \
    && adduser --uid 1001 --system --group python

# Copy requirements and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=python:python . .

# Switch to non-root user
USER python

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Production command
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]