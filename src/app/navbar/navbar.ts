import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SearchBar } from '../search-bar/search-bar';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive,SearchBar],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {

  menuIsOpen: boolean = false;

  /* Alterne l'état d'ouverture du menu burger. */
  toggleMenu(): void {
    this.menuIsOpen = !this.menuIsOpen;
  }
}
