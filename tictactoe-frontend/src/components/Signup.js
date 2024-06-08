import { Button, TextField } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import axios from 'axios';


import userpool from '../userpool';

const Signup = () => {

    const Navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [usernameErr, setUsernameErr] = useState('');
    const [emailErr, setEmailErr] = useState('');
    const [passwordErr, setPasswordErr] = useState('');

    const [selectedImage, setSelectedImage] = useState(null);
    const [imageError, setImageError] = useState('');

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
            if (username === '' && email === '' && password === '' && selectedImage === null) {
                setUsernameErr("Username is Required");
                setEmailErr("Email is Required");
                setPasswordErr("Password is required")
                setImageError("Image is required")
                resolve({ username: "Username is Required", email: "Email is Required", password: "Password is required", image: "Image is required" });
            }
            else if (username === '') {
                setUsernameErr("Username is Required")
                resolve({ username: "Username is Required", email: "", password: "", image: "" });
            }
            else if (email === '') {
                setEmailErr("Email is Required")
                resolve({ username: "", email: "Email is Required", password: "", image: "" });
            }
            else if (password === '') {
                setPasswordErr("Password is required")
                resolve({ username: "", email: "", password: "Password is required", image: "" });
            }
            else if (password.length < 6) {
                setPasswordErr("must be 6 character")
                resolve({ username: "", email: "", password: "must be 6 character", image: "" });
            }
            else if (selectedImage === null) {
                setImageError("Image is required")
                resolve({ username: "", email: "", password: "", image: "Image is required" });
            }
            else {
                resolve({ username: "", email: "", password: "", image: "" });
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
                if (res.username === '' && res.email === '' && res.password === '' && res.image === '') {
                    console.log('clicked');
                    const attributeList = [];

                    attributeList.push(
                        new CognitoUserAttribute({
                            Name: 'email',
                            Value: email,
                        })
                    );
                    // userpool.signUp(username, password, attributeList, null, (err, data) => {
                    //     if (err) {
                    //         console.log(err);
                    //         alert("Couldn't sign up");
                    //     } else {
                    //         console.log(data);
                    //         alert('User Added Successfully');

                    //         let formData = new FormData();
                    //         formData.append('file', selectedImage);
                    //         axios.post('/upload', formData, {
                    //             headers: {
                    //                 'Content-Type': 'multipart/form-data'
                    //             }
                    //         }).then(res => {
                    //             console.log(res);
                    //             if (res.status === 200) {
                    //                 axios.post('/v1/signupdata', { username: username, email: email, avatar: res.data.data.Location })
                    //                 Navigate('/');
                    //             }})

                    //         // Navigate('/');
                    //     }
                    // });

                    let formData = new FormData();
                    formData.append('avatar', selectedImage);
                    formData.append('username', username);
                    formData.append('email', email);

                    axios.post('http://44.205.169.11:8000/signup', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }).then(res => {
                        console.log(res);
                        userpool.signUp(username, password, attributeList, null, (err, data) => {
                            if (err) {
                                console.log(err);
                                alert("Couldn't sign up");
                            } else {
                                console.log(data);
                                alert('User Added Successfully');
                            }
                        });
                    }).catch(error => {
                        console.error('Error uploading data:', error);
                    });
                }
            }, err => console.log(err))
            .catch(err => console.log(err));
    }

    return (
        <div className="signup">

            <div className='form'>
                <h1>Upload your avatar</h1>

                {selectedImage && (
                    <img
                        alt='not found'
                        width={"250px"}
                        src={URL.createObjectURL(selectedImage)}
                    />
                )}

                <br />
                <br />

                <input
                    type='file'
                    name='myImage'
                    onChange={(event) => {
                        console.log(event.target.files[0]);
                        setSelectedImage(event.target.files[0])
                    }}
                />
                {imageError && <div style={{ color: 'red' }}>{imageError}</div>}



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