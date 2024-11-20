import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  isLogged = false;

  constructor(private router: Router) {
    this.isLogged = (localStorage.getItem('user') ?? null) !== null;
  }

  ngOnInit(): void {
  }

  logout(): void {
    localStorage.removeItem('user');
    this.isLogged = false;
    this.router.navigate(['/']);
  }

}
