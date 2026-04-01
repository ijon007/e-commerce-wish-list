export class User {
    uid: string | null;
    name: string | null;
    email: string | null;

    constructor({
        uid,
        name,
        email,
    }: {
        uid: string | null;
        name: string | null;
        email: string | null;
    }) {
        this.uid = uid;
        this.name = name;
        this.email = email;
    }

    static fromJSON(json: any): User {
        const user: User = {
            uid: json.uid ?? "",
            name: json.name ?? "",
            email: json.email ?? "",
        };
        return user;
    }
}
