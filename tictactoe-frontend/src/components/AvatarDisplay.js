import React, { useEffect, useState } from 'react';
import { API_URL, AUTH_MODE } from '../config';

const AVATAR_BASE_URL = process.env.REACT_APP_AVATAR_BASE_URL;

const AvatarDisplay = ({ username }) => {
    const [avatarSrc, setAvatarSrc] = useState('');

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                if (AUTH_MODE === 'cognito') {
                    setAvatarSrc(AVATAR_BASE_URL ? `${AVATAR_BASE_URL}/avatars/${username}.png` : '');
                } else {
                    setAvatarSrc(`${API_URL}/avatar/${username}`);
                }
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
