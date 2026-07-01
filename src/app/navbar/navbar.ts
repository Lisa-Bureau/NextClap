import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {

  menuIsClosed = true;

  /* Alterne l'état d'ouverture du menu burger. */
  toggleMenu(): void {
    this.menuIsClosed = !this.menuIsClosed;
  }
}
