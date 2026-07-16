import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MoviesService } from '../services/movies.service';

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
              private moviesService: MoviesService,
              private elementRef: ElementRef) {};

  toggleSort(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.sortControl.valueChanges.subscribe(value => {
      if (value) {
        this.moviesService.setSort(value);
      }
    });
  }

  ngOnDestroy(): void {
    this.moviesService.setSort('');
  }

  @HostListener("document:click", ["$event"])
  clickOut(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.isDropdownOpen = false;
    }
  }
}
