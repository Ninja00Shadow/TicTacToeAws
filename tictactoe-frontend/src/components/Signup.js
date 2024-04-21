import { Button, TextField } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';


import userpool from '../userpool';

const Signup = () => {

    const Navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [usernameErr, setUsernameErr] = useState('');
    const [emailErr, setEmailErr] = useState('');
    const [passwordErr, setPasswordErr] = useState('');

    const formInputChange = (formField, value) => {
        if (formField === "username") {
            setUsername(value);
        }
        if (formField === "email") {
            setEmail(value);
        }
        if (formField === "password") {
            setPassword(value);
        }
    };

    const validation = () => {
        return new Promise((resolve, reject) => {
            if (username === '' && email === '' && password === '') {
                setUsernameErr("Username is Required");
                setEmailErr("Email is Required");
                setPasswordErr("Password is required")
                resolve({ username: "Username is Required", email: "Email is Required", password: "Password is required" });
            }
            else if (username === '') {
                setUsernameErr("Username is Required")
                resolve({ username: "Username is Required", email: "", password: "" });
            }
            else if (email === '') {
                setEmailErr("Email is Required")
                resolve({ username: "", email: "Email is Required", password: "" });
            }
            else if (password === '') {
                setPasswordErr("Password is required")
                resolve({ username: "", email: "", password: "Password is required" });
            }
            else if (password.length < 6) {
                setPasswordErr("must be 6 character")
                resolve({ username: "", email: "", password: "must be 6 character" });
            }
            else {
                resolve({ username: "", email: "", password: "" });
            }
            reject('')
        });
    };

    const handleClick = (e) => {
        setUsernameErr("");
        setEmailErr("");
        setPasswordErr("");
        validation()
            .then((res) => {
                console.log(res);
                if (res.username === '' && res.email === '' && res.password === '') {
                    console.log('clicked');
                    const attributeList = [];
                    // attributeList.push(
                    //     new CognitoUserAttribute({
                    //         Name: 'username',
                    //         Value: username,
                    //     })
                    // );
                    attributeList.push(
                        new CognitoUserAttribute({
                            Name: 'email',
                            Value: email,
                        })
                    );
                    userpool.signUp(username, password, attributeList, null, (err, data) => {
                        if (err) {
                            console.log(err);
                            alert("Couldn't sign up");
                        } else {
                            console.log(data);
                            alert('User Added Successfully');
                            Navigate('/');
                        }
                    });
                }
            }, err => console.log(err))
            .catch(err => console.log(err));
    }

    return (
        <div className="signup">

            <div className='form'>
            <div className="formfield">
                    <TextField
                        value={username}
                        onChange={(e) => formInputChange("username", e.target.value)}
                        label="Username"
                        helperText={usernameErr}
                    />
                </div>
                <div className="formfield">
                    <TextField
                        value={email}
                        onChange={(e) => formInputChange("email", e.target.value)}
                        label="Email"
                        helperText={emailErr}
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
                    <Button type='submit' variant='contained' onClick={handleClick}>Signup</Button>
                </div>
            </div>

        </div>
    )
}

export default Signup