import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import { authenticate } from '../services/authenticate';
import { loginLocal } from '../services/api';
import { AUTH_MODE } from '../config';

const validateLogin = ({ username, password }) => {
  const errors = {};
  if (!username.trim()) {
    errors.username = 'Username is required';
  }
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must contain at least 6 characters';
  }
  return errors;
};

const Login = () => {
  const [, setCookie] = useCookies(['user-token', 'username']);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateLogin({ username, password });
    setErrors(validationErrors);
    setLoginError('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const data = AUTH_MODE === 'cognito'
        ? await authenticate(username, password)
        : await loginLocal(username, password);

      setCookie('user-token', data.accessToken.jwtToken, { path: '/', maxAge: 3600 * 24 * 30 });
      setCookie('username', username, { path: '/', maxAge: 3600 * 24 * 30 });
      navigate('/');
    } catch (error) {
      setLoginError(error.response?.data?.error || error.message || 'Could not log in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-view app-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Welcome back</p>
        <h1>Login</h1>
        <TextField
          error={Boolean(errors.username)}
          helperText={errors.username}
          label="Username"
          onChange={(event) => setUsername(event.target.value)}
          required
          value={username}
        />
        <TextField
          error={Boolean(errors.password)}
          helperText={errors.password}
          label="Password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        <Button disabled={isSubmitting} type="submit" variant="contained">
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
        {loginError && <Typography className="form-error">{loginError}</Typography>}
        <button className="link-button" onClick={() => navigate('/signup')} type="button">
          Create account
        </button>
      </form>
    </main>
  );
};

export default Login;
