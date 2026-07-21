import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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

  constructor(private elementRef: ElementRef) {}

  /* Alterne l'état d'ouverture du menu burger. */
  toggleMenu(): void {
    this.menuIsOpen = !this.menuIsOpen;
  }

  /**
   * Écouteur global sur le document. 
   * Déclenché à chaque clic n'importe où sur l'écran.
   */
  @HostListener("document:click", ["$event"])
  clickOut(event: MouseEvent) {
    // Vérifie si l'élément cliqué (event.target) se trouve physiquement à l'intérieur de ce composant
    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    // Si le clic a eu lieu à l'extérieur du composant, on ferme automatiquement le dropdown
    if (!clickedInside) {
      this.menuIsOpen = false;
    }
  }
}
