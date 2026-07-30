import React, { useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { useNavigate } from 'react-router-dom';

import { AUTH_MODE } from '../config';
import { createProfile, signupLocal } from '../services/api';
import userPool from '../userpool';

const validateSignup = ({ username, email, password, avatar }) => {
  const errors = {};
  if (!username.trim()) {
    errors.username = 'Username is required';
  }
  if (!email.trim()) {
    errors.email = 'Email is required';
  }
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must contain at least 8 characters';
  }
  if (!avatar) {
    errors.avatar = 'Avatar is required';
  }
  return errors;
};

const getResponseError = (error, fallback) => {
  const responseError = error.response?.data?.error;
  return Array.isArray(responseError) ? responseError.join(' ') : responseError || fallback;
};

const buildProfileFormData = ({ username, email, avatar, password }) => {
  const formData = new FormData();
  formData.append('avatar', avatar);
  formData.append('username', username);
  formData.append('email', email);
  if (password) {
    formData.append('password', password);
  }
  return formData;
};

const signupCognito = (username, password, email) => new Promise((resolve, reject) => {
  const attributes = [new CognitoUserAttribute({ Name: 'email', Value: email })];
  userPool.signUp(username, password, attributes, null, (error, data) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(data);
  });
});

const Signup = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [signupError, setSignupError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateSignup({ username, email, password, avatar: selectedImage });
    setErrors(validationErrors);
    setSignupError('');
    setSuccessMessage('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (AUTH_MODE === 'cognito') {
        await signupCognito(username, password, email);
        await createProfile(buildProfileFormData({ username, email, avatar: selectedImage }));
        setSuccessMessage('Account created. You can log in after confirming it in Cognito.');
      } else {
        await signupLocal(buildProfileFormData({ username, email, avatar: selectedImage, password }));
        setSuccessMessage('Account created. You can log in now.');
        navigate('/login');
      }
    } catch (error) {
      setSignupError(getResponseError(error, "Couldn't sign up."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-view app-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">New player</p>
        <h1>Create account</h1>

        <label className="avatar-picker">
          <span>Avatar</span>
          {previewUrl ? (
            <img alt="Selected avatar preview" src={previewUrl} />
          ) : (
            <div className="avatar-placeholder">Choose image</div>
          )}
          <input
            accept="image/*"
            onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
            type="file"
          />
        </label>
        {errors.avatar && <p className="form-error">{errors.avatar}</p>}

        <TextField
          error={Boolean(errors.username)}
          helperText={errors.username}
          label="Username"
          onChange={(event) => setUsername(event.target.value)}
          required
          value={username}
        />
        <TextField
          error={Boolean(errors.email)}
          helperText={errors.email}
          label="Email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
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
          {isSubmitting ? 'Creating...' : 'Sign up'}
        </Button>
        {signupError && <p className="form-error">{signupError}</p>}
        {successMessage && <p className="form-success">{successMessage}</p>}
        <button className="link-button" onClick={() => navigate('/login')} type="button">
          Back to login
        </button>
      </form>
    </main>
  );
};

export default Signup;
