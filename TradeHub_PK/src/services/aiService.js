import axios from 'axios';

// Python Flask AI Predictor microservice runs on a separate port (5001)
const AI_BASE_URL = 'http://192.168.10.12:5001/api';
const aiApi = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 15000, // Prophet forecasting can take a few seconds
});

export const getSalesForecast = async (periods = 30) => {
  const response = await aiApi.post('/predict', { periods });
  return response.data;
};