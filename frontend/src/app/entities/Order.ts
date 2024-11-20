import {OrderLine} from "./OrderLine";

export class Order {
    public id: number | null;
    public validated: boolean | null;
    public orderLines: OrderLine[] = [];

    public constructor({id = null, validated = null, orderLines = []} = {}) {
        this.id = id;
        this.validated = validated;
        this.orderLines = orderLines;
    }
}