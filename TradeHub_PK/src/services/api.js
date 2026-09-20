import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Android emulator ke liye 'localhost' kaam nahi karta,
// 10.0.2.2 use karo (yeh emulator ka special alias hai jo host machine ko point karta hai).
// Agar REAL DEVICE pe test kar rahe ho (USB se), to apne PC ka local IP address use karo
// (jaise 192.168.x.x — 'ipconfig' se PowerShell mein check kar sakte ho).
const BASE_URL = 'http://192.168.1.74:5000/api';
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Automatically attach saved token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;