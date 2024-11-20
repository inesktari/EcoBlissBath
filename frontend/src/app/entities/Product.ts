export class Product {
    public id: number | null;
    public name: string | null;
    public description: string | null;
    public picture: string | null;
    public skin: string | null;
    public ingredients: string | null;
    public aromas: string | null;
    public price: number | null;
    public availableStock: number | null;

    public constructor({id = null, name = null, description = null, skin = null, aromas = null,
                           ingredients = null, picture = null, price = null, availableStock = null} = {}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.picture = picture;
        this.price = price;
        this.availableStock = availableStock;
        this.skin = skin;
        this.ingredients = ingredients;
        this.aromas = aromas;
    }
}