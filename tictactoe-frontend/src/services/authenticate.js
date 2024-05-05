import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import userPool from '../userpool';
import { useCookies } from 'react-cookie';


export const authenticate = (username, password) => {
    return new Promise((resolve, reject) => {
        const user = new CognitoUser({
            Username: username,
            Pool: userPool
        });

        const authDetails = new AuthenticationDetails({
            Username: username,
            Password: password,
        });

        user.authenticateUser(authDetails, {
            onSuccess: (result) => {
                console.log('login result:', result);
                resolve(result);
            },
            onFailure: (err) => {
                console.error('onFailure:', err);
                reject(err);
            },
        });
    });

};


// export const logout = () => {
//     const user = userPool.getCurrentUser();
//     user.signOut();
//     window.location.href = '/';
// }