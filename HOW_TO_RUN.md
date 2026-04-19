# How to Run QualityVoice

## Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

## Start the Backend
```bash
cd server
npm run dev
```
Server runs on http://localhost:5000

## Start the Frontend
```bash
cd client
npm start
```
App opens at http://localhost:3000

## Common Issues

### "Server error" on signup/login
The backend isn't running. Start it first with `npm run dev` in the `server/` folder.

### MongoDB connection failed
Make sure MongoDB is running:
- Windows: Start "MongoDB" service in Services, or run `mongod`
- Mac: `brew services start mongodb-community`

### Port already in use
Change the port in `server/.env`:
```
PORT=5001
```
Then update `client/src/utils/api.js`:
```js
export const API_URL = 'http://localhost:5001';
```
