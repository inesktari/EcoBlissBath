import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

    registerForm: FormGroup;
    error = '';
    loading = false;

    constructor(private http: HttpClient, private router: Router) {
        this.registerForm = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email]),
            plainPassword: new FormGroup({
                first: new FormControl('', [Validators.required, Validators.minLength(5)]),
                second: new FormControl('', [Validators.required, this.checkPasswords]),
            }),
            firstname: new FormControl('', [Validators.required]),
            lastname: new FormControl('', [Validators.required]),
        });
    }

    ngOnInit(): void {
    }

    register(): void {
        if (this.loading) {
            return;
        }
        this.error = '';
        this.registerForm.markAllAsTouched();

        if (this.registerForm.valid) {
            this.loading = true;
            this.http.post('http://localhost:8081/register', this.registerForm.value, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).subscribe(response => {
                this.http.post('http://localhost:8081/login', {
                    username: this.registerForm.value.email,
                    password: this.registerForm.value.plainPassword.first
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).subscribe((response: any) => {
                    this.loading = false;
                    localStorage.setItem('user', response.token);
                    window.location.href = '/';
                });
            }, response => {
                this.loading = false;
                this.error = '';
                for (const message in response.error) {
                    this.error += response.error[message] + '\n';
                }
            });
        } else {
            this.error = 'Merci de remplir correctement tous les champs (adresse email, mot de passe de 5 caractères minimum, confirmation identique)';
        }
    }

    checkPasswords: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        let confirmPass = control?.value;
        let pass = control.parent?.get('first')?.value
        return pass === confirmPass ? null : {notSame: true}
    }

}
