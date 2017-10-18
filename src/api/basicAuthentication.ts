import { System, Inject, Injectable, DefaultServiceNames, LifeTime, IAuthenticationStrategy, IRequestContext, UserContextData } from "vulcain-corejs";
import { QueryUserService } from "./handlers/userHandler";


@Injectable(LifeTime.Singleton, DefaultServiceNames.AuthenticationStrategy )
export class BasicAuthentication implements IAuthenticationStrategy {

    public readonly name = "basic";

    constructor() {
        System.log.info(null, () => `Basic authentication is enabled.`);
    }

    async verifyTokenAsync(ctx: IRequestContext, accessToken: string, tenant: string): Promise<UserContextData> {
        let username: string;
        let password: string;
        try {
            let credentials = new Buffer(accessToken, 'base64').toString();
            if (credentials) {
                const pos = credentials.indexOf(':');
                if (pos >= 0) {
                    username = credentials.substr(0, pos);
                    password = credentials.substr(pos + 1);
                }
            }
            if (!username || !password) {
                return null;
            }

            let users = ctx.container.get<QueryUserService>("QueryUserService");
            if (username === "admin" && password === "admin") {
                // Works only on bootstrap when there is no users yet
                let hasUsers = (users && await users.hasUsersAsync(tenant));
                if (!hasUsers) {
                    System.log.info(ctx, ()=> `User authentication: Connected with default admin profile`);
                    return  { claims: {}, name: "admin", displayName: "admin", scopes: ["*"], tenant};
                }
            }

            if (!users) {
                return null;
            }

            let user = await users.getUserByNameAsync(tenant, username);
            // No user found with that username
            if (!user || user.disabled) {
                System.log.info(ctx, ()=>`User authentication: Invalid profile ${username} tenant ${tenant}`);
                return null;
            }

            // Make sure the password is correct
            let isMatch = users.verifyPassword(user.password, password);

            // Password did not match
            if (!isMatch) {
                System.log.info(ctx, ()=>`User authentication: Invalid password for ${username} tenant ${tenant}`);
                return null;
            }

            // Success
            return <any>user;
        }
        catch (err) {
            System.log.error(ctx, err, ()=>`User authentication: Error for profile ${username} tenant ${tenant}`);
            return null;
        }
    }
}