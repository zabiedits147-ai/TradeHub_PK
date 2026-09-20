import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const sendOTP = async (mobileNumber) => {
  const response = await api.post('/auth/send-otp', { mobileNumber });
  return response.data;
};

export const verifyOTP = async (mobileNumber, otp) => {
  const response = await api.post('/auth/verify-otp', { mobileNumber, otp });
  const { token, user } = response.data;

  // Save token + user data locally for persistent login
  await AsyncStorage.setItem('authToken', token);
  await AsyncStorage.setItem('userData', JSON.stringify(user));

  return response.data;
};

export const verifyBusiness = async (shopName, ntnCnic, shopAddress) => {
  const response = await api.post('/auth/verify-business', { shopName, ntnCnic, shopAddress });
  const { user } = response.data;
  if (user) {
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  }
  return response.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('userData');
};
export const updateProfile = async (shopName, shopAddress) => {
  const response = await api.put('/auth/profile', { shopName, shopAddress });
  const { user } = response.data;
  await AsyncStorage.setItem('userData', JSON.stringify(user));
  return response.data;
};

export const requestNumberChange = async (newMobileNumber) => {
  const response = await api.post('/auth/change-number/request', { newMobileNumber });
  return response.data;
};

export const confirmNumberChange = async (otp) => {
  const response = await api.post('/auth/change-number/confirm', { otp });
  const { user } = response.data;
  await AsyncStorage.setItem('userData', JSON.stringify(user));
  return response.data;
};