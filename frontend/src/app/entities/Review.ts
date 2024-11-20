import {User} from "./User";

export class Review {
    public id: number | null;
    public title: string | null;
    public comment: string | null;
    public rating: number | null;
    public author: User | null;

    public constructor({id = null, title = null, comment = null, rating = null, author = null} = {}) {
        this.id = id;
        this.title = title;
        this.comment = comment;
        this.rating = rating;
        this.author = author;
    }
}