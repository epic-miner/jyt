import axios from 'axios';

const API_URL = 'https://polished-river-de65.ahf626085.workers.dev/api';
const API_KEY = '7291826614';

// Regular API client
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API client with authentication for operations that require an API key
const apiWithAuth = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

export const fetchAllAnime = async () => {
  const response = await api.get('/anime');
  return response.data;
};

export const fetchAnimeById = async (id: string) => {
  const response = await api.get(`/anime/${id}`);
  return response.data;
};

export const fetchEpisodesByAnimeId = async (animeId: string) => {
  const response = await api.get(`/episodes?anime_id=${animeId}`);
  return response.data;
};

export const fetchEpisodeById = async (id: string) => {
  const response = await api.get(`/episodes/${id}`);
  return response.data;
};

export const searchAnime = async (query: string, type: string = 'all') => {
  const response = await api.get(`/search?q=${query}&type=${type}`);
  return response.data;
};

export const fetchAnimeByGenre = async (genre: string) => {
  const response = await api.get(`/search?genre=${genre}&type=anime`);
  return response.data;
};

export default {
  fetchAllAnime,
  fetchAnimeById,
  fetchEpisodesByAnimeId,
  fetchEpisodeById,
  searchAnime,
  fetchAnimeByGenre,
};
