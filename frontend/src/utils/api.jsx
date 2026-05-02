// src/utils/api.js
import { io } from 'socket.io-client';
export const socket = io('http://localhost:5000'); // Your backend URL
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default API;
