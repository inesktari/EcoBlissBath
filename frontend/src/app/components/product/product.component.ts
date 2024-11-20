import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {Product} from "../../entities/Product";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

    product = new Product();
    products: Product[] = [];
    productForm: FormGroup;
    isLogged = false;

    constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {
        this.productForm = new FormGroup({
            product: new FormControl('', [Validators.required]),
            quantity: new FormControl(1, [Validators.required, Validators.min(0)])
        });
        this.isLogged = (localStorage.getItem('user') ?? null) !== null;
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = params['id'] ?? null;

            if (id === null) {
                this.router.navigate(['/products']);
            }

            this.http.get('http://localhost:8081/products/' + id).subscribe((product: object) => {
                this.product = new Product(product);
                this.productForm.get('product')?.setValue(this.product);
            });
        });
        this.http.get('http://localhost:8081/products/random').subscribe((products: any) => {
            this.products = [];
            products.forEach((product: object) => {
                this.products.push(new Product(product));
            });
        });
    }

    addToCart(): void {
        this.productForm.markAllAsTouched();
        if (this.productForm.valid) {
            this.http.put('http://localhost:8081/orders/add', {quantity: this.productForm.value.quantity, product: this.product.id}, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('user')
                }
            }).subscribe(_ => {
                this.router.navigate(['/cart']);
            }, error => {
                if(error.status === 401) {
                    localStorage.removeItem('user');
                    this.router.navigate(['/login']);
                }
            });
        }
    }

}
