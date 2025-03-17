import axios from 'axios';
import { Anime, Episode } from '@shared/types';

const API_URL = 'https://polished-river-de65.ahf626085.workers.dev/api';
const API_KEY = '7291826614';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// For requests that require API key (POST, PUT, DELETE operations)
const apiWithAuth = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

export const fetchAllAnime = async (): Promise<Anime[]> => {
  const response = await api.get('/anime');
  return response.data;
};

export const fetchAnimeById = async (id: string): Promise<Anime> => {
  const response = await api.get(`/anime/${id}`);
  return response.data;
};

export const fetchEpisodesByAnimeId = async (animeId: string): Promise<Episode[]> => {
  const response = await api.get(`/episodes?anime_id=${animeId}`);
  return response.data;
};

export const fetchEpisodeById = async (id: string): Promise<Episode> => {
  const response = await api.get(`/episodes/${id}`);
  return response.data;
};

export const searchAnime = async (query: string, type: string = 'all'): Promise<Anime[]> => {
  const response = await api.get(`/search?q=${query}&type=${type}`);
  return response.data;
};

export const fetchAnimeByGenre = async (genre: string): Promise<Anime[]> => {
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
