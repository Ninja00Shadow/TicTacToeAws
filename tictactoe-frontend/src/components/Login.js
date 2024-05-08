import React, { useState } from 'react'
import { Button, TextField,Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import { authenticate } from '../services/authenticate';
import { useCookies } from 'react-cookie';

const Login = () => {
  const [cookies, setCookie] = useCookies(['user-token','username']);

  const Navigate = useNavigate();

  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [usernameErr, setUsernameErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [loginErr,setLoginErr]=useState('');

  const formInputChange = (formField, value) => {
    if (formField === "username") {
      setUserName(value);
    }
    if (formField === "password") {
      setPassword(value);
    }
  };

  const validation = () => {
    return new Promise((resolve, reject) => {
      if (username === '' && password === '') {
        setUsernameErr("Username is Required");
        setPasswordErr("Password is required")
        resolve({ username: "Username is Required", password: "Password is required" });
      }
      else if (username === '') {
        setUsernameErr("Username is Required")
        resolve({ username: "Username is Required", password: "" });
      }
      else if (password === '') {
        setPasswordErr("Password is required")
        resolve({ username: "", password: "Password is required" });
      }
      else if (password.length < 6) {
        setPasswordErr("must be 6 character")
        resolve({ username: "", password: "must be 6 character" });
      }
      else {
        resolve({ username: "", password: "" });
      }
    });
  };

  const handleClick = () => {
    setUsernameErr("");
    setPasswordErr("");
    validation()
      .then((res) => {
        if (res.username === '' && res.password === '') {
          authenticate(username,password)
          .then((data)=>{
            setLoginErr('');
            setCookie('user-token',data.accessToken.jwtToken,{path:'/', maxAge:3600 * 24 * 30});
            setCookie('username',username,{path:'/', maxAge:3600 * 24 * 30});
            Navigate('/');
          },(err)=>{
            console.log(err);
            setLoginErr(err.message)
          })
          .catch(err=>console.log(err))
        }
      }, err => console.log(err))
      .catch(err => console.log(err));
  }

  const goTosignup = () => {
    Navigate('/signup');
  }

  return (
    <div className="login">

      <div className='form'>
        <div className="formfield">
          <TextField
            value={username}
            onChange={(e) => formInputChange("username", e.target.value)}
            label="Username"
            helperText={usernameErr}
          />
        </div>
        <div className='formfield'>
          <TextField
            value={password}
            onChange={(e) => { formInputChange("password", e.target.value) }}
            type="password"
            label="Password"
            helperText={passwordErr}
          />
        </div>
        <div className='formfield'>
          <Button type='submit' variant='contained' onClick={handleClick}>Login</Button>
        </div>
        <Typography variant="body">{loginErr}</Typography>
      </div>
      <button onClick={goTosignup} className='signupButton'>Signup</button>

    </div>
  )
}

export default Login