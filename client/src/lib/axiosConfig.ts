import axios from 'axios';

const API_URL = 'https://polished-river-de65.ahf626085.workers.dev/api';
const API_KEY = '7291826614';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// For requests that require API key (POST, PUT, DELETE operations)
export const apiWithAuth = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});