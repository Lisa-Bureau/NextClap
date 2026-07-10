import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {

  searchIsOpen: boolean = false;

  @ViewChild("searchModal") searchModal!: ElementRef<HTMLDialogElement>;

  toggleSearch(inputElement: HTMLInputElement): void {
    this.searchIsOpen = !this.searchIsOpen;
    const dialog = this.searchModal.nativeElement;

    if (this.searchIsOpen) {
      dialog.showModal();
      inputElement.focus();
    } else {
      inputElement.value = "";
      dialog.close();
    }
  }
}
