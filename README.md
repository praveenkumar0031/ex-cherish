🚀 Excherish API Documentation
Excherish is a 1-on-1 skill exchange platform. This backend handles user authentication, profile management with image uploads, and unique room-based private chats using WebSockets.

🛠 Tech Stack
Server: Node.js, Express.js

Database: MongoDB (Mongoose)

Real-time: Socket.io

File Handling: Multer

🔐 Authentication & Users
Base URL: /api/users
| Feature  | Method | Endpoint    | Body (JSON)                 | Auth |
| -------- | ------ | ----------- | --------------------------- | ---- |
| Register | POST   | `/register` | `{ name, email, password }` | ❌    |
| Login    | POST   | `/login`    | `{ email, password }`       | ❌    |


👤 Profile Management
Base URL: /api/profile
| Feature        | Method | Endpoint   | Data Type                        | Auth |
| -------------- | ------ | ---------- | -------------------------------- | ---- |
| Get Profile    | GET    | `/:userId` | URL Params                       | ❌    |
| Update Profile | PUT    | `/:userId` | FormData (Supports `profilePic`) | ✅    |


🤝 Skill Exchange Rooms (Core Logic)
These endpoints manage the unique "Skill Cards" and 1-on-1 private connections.

Base URL: /api/rooms
| Feature        | Method | Endpoint            | Description                                  | Auth |
| -------------- | ------ | ------------------- | -------------------------------------------- | ---- |
| Discover Cards | GET    | `/discover`         | List cards with only 1 member (Landing Page) | ❌    |
| Create Card    | POST   | `/create`           | Post a unique skill exchange card            | ✅    |
| Connect (Join) | POST   | `/:roomId/connect`  | Join exchange to start a 1-on-1 chat         | ✅    |
| My Chats       | GET    | `/my-chats`         | List all active 1-on-1 connections           | ✅    |
| Room Messages  | GET    | `/:roomId/messages` | Fetch chat history for a specific room       | ✅    |


💬 Personal Messaging (Direct)
Base URL: /api/messages
| Feature      | Method | Endpoint | Data                         | Auth |
| ------------ | ------ | -------- | ---------------------------- | ---- |
| Send Message | POST   | `/send`  | `{ sender, receiver, text }` | ✅    |
| Get History  | GET    | `/get`   | `?sender=ID1&receiver=ID2`   | ✅    |


📁 Media & Standalone Uploads
Base URL: /api/upload
| Feature      | Method | Endpoint | Payload                 | Response Example                          |
| ------------ | ------ | -------- | ----------------------- | ----------------------------------------- |
| Upload Image | POST   | `/`      | FormData (`key: image`) | `{ "imageUrl": "/uploads/filename.jpg" }` |


⚡ Socket.io Events (Real-Time)
Real-time communication is handled via WebSockets on the same server port.
| Event Name        | Type   | Payload                  | Description                          |
| ----------------- | ------ | ------------------------ | ------------------------------------ |
| `join_room`       | Emit   | `roomId`                 | User joins a 1-on-1 chat room        |
| `send_message`    | Emit   | `{ room, sender, text }` | Sends a message to the room          |
| `receive_message` | Listen | `messageObject`          | Triggered when a new message arrives |
 

📝 Implementation Notes
Auth Header: All routes marked with ✅ require an Authorization header:
Authorization: Bearer <your_jwt_token>

Static Assets: Uploaded files are served from http://localhost:5000/uploads/.

Unique Constraints: * Room names must be unique platform-wide.

A user cannot offer the same skill in multiple active cards.

1-on-1 Restriction: A room is automatically "closed" to public discovery once it has 2 members.

▶️ Running the Project
# Install dependencies
npm install

# Start development server
npm run dev

# OR
npm start

📌 Future Enhancements

Skill rating system

Chat notifications

Video call integration

Admin moderation panel