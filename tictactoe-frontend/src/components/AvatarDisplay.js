import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AvatarDisplay = ({ username }) => {
    const [avatarSrc, setAvatarSrc] = useState('');

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                const response = await axios.get(`http://44.205.169.11:8000/avatar/${username}`, {
                    responseType: 'blob'
                });
                const imageBlob = response.data;
                const imageObjectURL = URL.createObjectURL(imageBlob);
                setAvatarSrc(imageObjectURL);
            } catch (error) {
                console.error('Error fetching avatar:', error);
            }
        };

        fetchAvatar();
    }, [username]);

    return (
        <div>
            {avatarSrc && (
            <img 
            src={avatarSrc} 
            width={"250px"}
            alt="User Avatar" 
            />
            )}
        </div>
    );
};

export default AvatarDisplay;