import { CognitoUserPool } from 'amazon-cognito-identity-js';
const poolData = {
    UserPoolId: process.env.REACT_APP_USER_POOL_ID,
    ClientId: process.env.REACT_APP_CLIENT_ID
};

const userPool = poolData.UserPoolId && poolData.ClientId
    ? new CognitoUserPool(poolData)
    : {
        getCurrentUser: () => null,
        signUp: (_username, _password, _attributes, _validationData, callback) => {
            callback(new Error('Cognito is not configured.'));
        }
    };

export default userPool;
