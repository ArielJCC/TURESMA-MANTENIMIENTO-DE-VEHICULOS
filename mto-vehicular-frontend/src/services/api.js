import axios from 'axios';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  // Para dispositivos físicos usando localtunnel 
  return 'https://stale-geese-obey.loca.lt/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;