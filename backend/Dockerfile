FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production || npm install --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Set environment variable for port
ENV PORT=3001

# Start the server
CMD ["node", "index.js"]
