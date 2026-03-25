import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';

import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

type SortColumn = 'name' | 'company';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  searchControl = new FormControl('');

  loading = signal(true);
  errorMessage = signal('');

  private allUsers = signal<User[]>([]);
  private searchTerm = signal('');
  private sortColumn = signal<SortColumn>('name');
  private sortDir = signal<SortDir>('asc');

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    let users = this.allUsers().filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );

    const col = this.sortColumn();
    const dir = this.sortDir();

    return users.sort((a, b) => {
      const aVal = col === 'name' ? a.name : a.company.name;
      const bVal = col === 'name' ? b.name : b.company.name;
      const cmp = aVal.localeCompare(bVal);
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  displayedColumns = ['name', 'email', 'phone', 'company'];

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.allUsers.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message);
        this.loading.set(false);
      },
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((val) => this.searchTerm.set(val ?? ''));
  }

  onSortChange(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      this.sortColumn.set('name');
      this.sortDir.set('asc');
    } else {
      this.sortColumn.set(sort.active as SortColumn);
      this.sortDir.set(sort.direction as SortDir);
    }
  }

  navigateToUser(user: User): void {
    this.router.navigate(['/user', user.id]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
