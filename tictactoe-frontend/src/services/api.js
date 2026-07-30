import axios from '../axiosConfig';

export const joinMatch = (username) => axios.post('', { 'player-name': username });

export const loginLocal = async (username, password) => {
  const response = await axios.post('/login', { username, password });
  return response.data;
};

export const signupLocal = (formData) => axios.post('/signup', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const createProfile = (formData) => axios.post('/signup', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const fetchMatches = async (username) => {
  const response = await axios.get('/matches', { params: { username } });
  return response.data.matches;
};
