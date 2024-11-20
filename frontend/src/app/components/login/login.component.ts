import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  error = '';
  loading = false;

  constructor(private http: HttpClient, private router: Router) {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
  }

  login(): void {
    if(this.loading) {
      return ;
    }
    this.error = '';
    this.loginForm.markAllAsTouched();
    this.loginForm.get('username')?.setErrors({invalid: null});
    this.loginForm.get('username')?.updateValueAndValidity();
    this.loginForm.get('password')?.setErrors({invalid: null});
    this.loginForm.get('password')?.updateValueAndValidity();

    if(this.loginForm.valid) {
      this.loading = true;
      this.http.post('http://localhost:8081/login', this.loginForm.value, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).subscribe((response: any) => {
        this.loading = false;
        localStorage.setItem('user', response.token);
        window.location.href = '/';
      }, error => {
        if(error.status === 401) {
          this.loading = false;
          this.error = 'Identifiants incorrects';
          this.loginForm.get('username')?.setErrors({invalid: true});
          this.loginForm.get('password')?.setErrors({invalid: true});
        }
      });
    } else {
      this.error = 'Merci de remplir correctement tous les champs';
    }
  }

}
