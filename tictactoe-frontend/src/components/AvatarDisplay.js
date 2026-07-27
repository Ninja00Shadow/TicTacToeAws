import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AvatarDisplay = ({ username }) => {
    const [avatarSrc, setAvatarSrc] = useState('');

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                const imageObjectURL = `https://tictactoe-avatars-317a48444b7c2a5b.s3.amazonaws.com/avatars/${username}.png`;
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