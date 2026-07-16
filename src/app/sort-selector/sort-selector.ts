import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sort-selector',
  imports: [ReactiveFormsModule],
  templateUrl: './sort-selector.html',
  styleUrl: './sort-selector.scss',
})
export class SortSelector implements OnInit, OnDestroy {

  currentUrl!: string;
  isDropdownOpen: boolean = false;
  sortingCondition = [
    { key: "recent", label: "Dates les plus proches" },
    { key: "oldest", label: "Dates les plus éloignées" },
    { key: "popular", label: "Popularité la plus grande" }
  ];

  sortControl = new FormControl('');

  constructor(private router: Router,
              private elementRef: ElementRef) {};

  toggleSort(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
  }

  @HostListener("document:click", ["$event"])
  clickOut(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.isDropdownOpen = false;
    }
  }
}
