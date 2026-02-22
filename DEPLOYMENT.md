# AgriMachineHub Deployment Guide

## 1) Deploy Backend (Render)

1. Push this project to GitHub.
2. In Render, create a new `Web Service` from your repository.
3. Configure:
   - Root Directory: project root
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `MONGO_URI=<your-mongodb-atlas-uri>`
   - `JWT_SECRET=<strong-random-secret>`
   - `CORS_ORIGINS=https://<your-vercel-domain>`
5. Deploy and copy the backend URL, e.g. `https://agrimachinehub-backend.onrender.com`.

## 2) Deploy Frontend (Vercel)

1. Import repository into Vercel.
2. Set root directory to `agrimachine-frontend`.
3. Framework preset: `Vite`.
4. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-render-backend-domain>`
5. Deploy.

## 3) Final CORS Update

After frontend deployment, update backend Render env:
- `CORS_ORIGINS=https://<final-vercel-domain>`

Then redeploy backend.

## 4) Smoke Test

1. Open frontend URL.
2. Register owner.
3. Login owner.
4. Add machine.
5. Open `Find Machines`, create booking as farmer.
6. In owner dashboard, approve/reject/complete booking.
7. In `My Bookings`, verify updated status.
