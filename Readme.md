# BrightSphere Backend

Backend service for BrightSphere.

## Setup & Run

### Local Development
npm install  
npm run dev

### Production (Server with PM2)
npm install  pm2
npx pm2 start server.js --name BrightSphereBackend

### PM2 Commands
npx pm2 restart BrightSphereBackend   # Restart  
npx pm2 stop BrightSphereBackend      # Stop  
npx pm2 logs BrightSphereBackend      # View logs  
npx pm2 list                           # List processes  
npx pm2 startup                        # Enable auto-start on reboot  
npx pm2 save                           # Save PM2 process list  

### Fixing PM2 Issues:
If the app fails to start with PM2 (e.g., "Cannot find module ProcessContainerFork.js"):
1. Remove broken local PM2: npm uninstall pm2
2. Reinstall PM2 locally: npm install pm2 --save
3. Clean node modules (optional but recommended): rm -rf node_modules package-lock.json && npm install
4. Start the app with PM2: npx pm2 start server.js --name BrightSphereBackend
5. Verify PM2 status and logs: npx pm2 list && npx pm2 logs BrightSphereBackend
⚠️ Always use npx pm2 if PM2 is installed locally.

<!-- db.createUser({  user: "brightUser", pwd: "BrightUser@StrongPassword123!", roles: [{ role: "readWrite", db: "BrightSphere" }]}); -->

mongodump --db RationCardGenerator --out /path/to/backup/
mongorestore --db RationCardGenerator /path/to/backup/your_database_name/


