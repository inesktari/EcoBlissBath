import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Order} from "../../entities/Order";
import {OrderLine} from "../../entities/OrderLine";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  orderForm: FormGroup;
  forms: FormGroup[] = [];
  order: null | Order = null;
  total = 0;

  constructor(private http: HttpClient, private router: Router) {
    this.orderForm = new FormGroup({
      firstname: new FormControl('', [Validators.required]),
      lastname: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]),
      city: new FormControl('', [Validators.required]),
    })
    this.initForm();
  }

  ngOnInit(): void {
    if((localStorage.getItem('user') ?? null) === null) {
      this.router.navigate(['/login']);
    }
    this.updateOrder();
  }

  updateOrder(): void {
    this.total = 0;
    this.http.get('http://localhost:8081/orders', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('user')
      }
    }).subscribe((order: object) => {
      this.forms = [];
      this.order = new Order(order);
      let timeout: NodeJS.Timeout | null = null;
      this.order.orderLines.forEach(orderLine => {
        const formGroup = new FormGroup({
          quantity: new FormControl(orderLine.quantity)
        });

        formGroup.get('quantity')?.valueChanges.subscribe(quantity => {
          if(quantity <= 0) {
            formGroup.get('quantity')?.setValue(1);
            return ;
          }
          if(timeout !== null) {
            clearInterval(timeout);
          }
          timeout = setTimeout(() => {
            this.changeQuantity(orderLine, quantity);
          }, 500);
        })
        this.forms.push(formGroup);
      });
      this.total = this.order.orderLines.reduce((total: number, orderLine: OrderLine) => {
        return total + (orderLine.quantity ?? 0) * (orderLine.product?.price ?? 0);
      }, 0);
    }, response => {
      this.order = null;
      if(response.status === 401) {
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      }
    });
  }

  confirmOrder(): void {
    this.orderForm.markAllAsTouched();
    if(this.orderForm.valid) {
      this.http.post('http://localhost:8081/orders', this.orderForm.value, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('user')
        }
      }).subscribe(response => {
        this.router.navigate(['/confirmation']);
      }, response => {
        if(response.status === 401) {
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
        }
      });
    }
  }

  deleteProduct(product: OrderLine): void {
    this.http.delete('http://localhost:8081/orders/' + product.id + '/delete', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('user')
      }
    }).subscribe((order: object) => {
      this.order = new Order(order);
      this.total = this.order.orderLines.reduce((total: number, orderLine: OrderLine) => {
        return total + (orderLine.quantity ?? 0) * (orderLine.product?.price ?? 0);
      }, 0);
    }, response => {
      if(response.status === 401) {
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      }
    })
  }

  changeQuantity(product: OrderLine, quantity: number): void {
    this.http.put('http://localhost:8081/orders/' + product.id + '/change-quantity', { quantity }, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('user')
      }
    }).subscribe((order: object) => {
      this.order = new Order(order);
      this.total = this.order.orderLines.reduce((total: number, orderLine: OrderLine) => {
        return total + (orderLine.quantity ?? 0) * (orderLine.product?.price ?? 0);
      }, 0);
    }, response => {
      if(response.status === 401) {
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      }
    })
  }

  initForm(): void {
    this.http.get('http://localhost:8081/me',{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('user')
      }
    }).subscribe(user => {
      this.orderForm.patchValue(user);
    }, response => {
      if(response.status === 401) {
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      }
    });
  }

  isCartEmpty(): boolean {
    return (this.order?.orderLines?.length ?? 0) === 0;
  }

}
