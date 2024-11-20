export class User {
    firstname: string | null;
    lastname: string | null;
    email: string | null;
    password: string | null;

    public constructor({firstname = null, lastname = null, email = null, password = null}) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
    }
}