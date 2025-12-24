FROM node:18-slim

ENV LANG C.UTF-8
WORKDIR /opt

# Install tools and ffmpeg (phonikud may need audio conversion)
RUN apt-get update && apt-get install -y --no-install-recommends git ffmpeg ca-certificates && rm -rf /var/lib/apt/lists/*

# Clone phonikud and try to install globally (best-effort)
RUN git clone https://github.com/thewh1teagle/phonikud.git /opt/phonikud || true
RUN if [ -f /opt/phonikud/package.json ]; then cd /opt/phonikud && npm ci --silent && npm install -g . || true; fi

# Application
WORKDIR /opt/app
COPY package.json package-lock.json* ./
RUN npm ci --only=production --silent || true

COPY index.js ./

EXPOSE 5000
CMD ["node", "index.js"]
