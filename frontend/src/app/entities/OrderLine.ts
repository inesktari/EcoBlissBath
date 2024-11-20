import {Product} from "./Product";

export class OrderLine {
    public id: number | null;
    public product: Product | null;
    public quantity: number | null;

    public constructor({id = null, product = null, quantity = null} = {}) {
        this.id = id;
        this.product = product;
        this.quantity = quantity;
    }
}