#!/bin/bash

# Deploy Script for Ubuntu VPS

echo "🚀 Deploying DSS Video Games..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python & Node.js
sudo apt install -y python3 python3-pip nodejs npm nginx

# Clone repository
cd /var/www
git clone https://github.com/Hafizh220705/decision-support-system-game.git
cd decision-support-system-game

# Setup Backend
cd backend
pip3 install -r requirements.txt
pip3 install gunicorn

# Create systemd service for backend
sudo tee /etc/systemd/system/dss-backend.service > /dev/null <<EOF
[Unit]
Description=DSS Video Games Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/decision-support-system-game/backend
ExecStart=/usr/local/bin/gunicorn --bind 0.0.0.0:5000 --workers 2 api:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable dss-backend
sudo systemctl start dss-backend

# Setup Frontend
cd ../frontend
npm install
npm run build

# Create systemd service for frontend
sudo tee /etc/systemd/system/dss-frontend.service > /dev/null <<EOF
[Unit]
Description=DSS Video Games Frontend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/decision-support-system-game/frontend
ExecStart=/usr/bin/npm start
Restart=always
Environment=NEXT_PUBLIC_API_URL=http://localhost:5000

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable dss-frontend
sudo systemctl start dss-frontend

# Configure Nginx
sudo tee /etc/nginx/sites-available/dss-video-games > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/dss-video-games /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "✅ Deployment completed!"
echo "🌐 Access your app at: http://your-domain.com"
