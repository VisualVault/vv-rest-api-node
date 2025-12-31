export class SessionToken {
    constructor() {
        this.isAuthenticated = false;
        this.apiUrl = null;
        this.baseUrl = null;
        this.authenticationUrl = null;
        this.customerAlias = null;
        this.databaseAlias = null;
        this.expirationDate = null;
        this.accessToken = null;
        this.tokenType = null;
        this.refreshToken = null;
        this.expiresIn = 0;
        this.clientId = null;
        this.clientSecret = null;
        this.userId = null;
        this.password = null;
        this.audience = null;
    }

    createCopy() {
        const newSession = new SessionToken();
        newSession.isAuthenticated = this.isAuthenticated;
        newSession.apiUrl = this.apiUrl;
        newSession.baseUrl = this.baseUrl;
        newSession.authenticationUrl = this.authenticationUrl;
        newSession.customerAlias = this.customerAlias;
        newSession.databaseAlias = this.databaseAlias;
        newSession.expirationDate = this.expirationDate;
        newSession.accessToken = this.accessToken;
        newSession.tokenType = this.tokenType;
        newSession.refreshToken = this.refreshToken;
        newSession.expiresIn = this.expiresIn;
        newSession.clientId = this.clientId;
        newSession.clientSecret = this.clientSecret;
        newSession.userId = this.userId;
        newSession.password = this.password;
        newSession.audience = this.audience;
        return newSession;
    }

    convertToJwt(jwt) {
        this.tokenType = 'jwt';
        this.accessToken = jwt["token"];
        this.expirationDate = new Date(jwt["expires"]);
        this.expiresIn = 0;
    }
}

export default SessionToken;
