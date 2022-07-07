import { ViewChild } from '@angular/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { APIResponse, Game } from 'src/app/models/game.model';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public sort!: string;
  public games: Game[] = [];
  private routeSub!: Subscription;
  private gameSub!: Subscription;
  public gamesData: MatTableDataSource<Game> = new MatTableDataSource();
  public displayedCols = ['name', 'released', 'rating', 'platforms', 'actions'];
  @ViewChild(MatPaginator) matPaginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;
  public searchKey = '';
  constructor(
    private httpService: HttpService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    console.log(this.gamesData);
  }

  ngOnInit(): void {
    this.routeSub = this.activatedRoute.params.subscribe((params: Params) => {
      if (params['game-search']) {
        this.searchGames('metacrit', params['game-search']);
      } else {
        this.searchGames('metacrit');
      }
    });
  }

  searchGames(sort: string, search?: string): void {
    this.gameSub = this.httpService
      .getGameList(sort, search)
      .subscribe((gameList: APIResponse<Game>) => {
        this.games = gameList.results;
        this.gamesData = new MatTableDataSource(this.games);
        this.gamesData.paginator = this.matPaginator;
        this.gamesData.sort = this.matSort;
        this.gamesData.filterPredicate = (data: any, filter) => {
          return this.displayedCols.some((ele: string) => {
            const fieldsToSearch = ['name', 'released', 'rating'];
            if (fieldsToSearch.includes(ele)) {
              return (
                // ele != 'actions' &&
                // ele != 'platforms' &&
                // ele != 'rating' &&
                // data[ele].toLowerCase().indexOf(filter) != -1

                String(data[ele]).toLowerCase().indexOf(filter) != -1
              );
            } else {
              return null;
            }
          });
        };
        console.log(this.gamesData);
      });
  }

  onSearchClear() {
    this.searchKey = '';
    this.applyFilter();
  }

  applyFilter() {
    this.gamesData.filter = this.searchKey.trim().toLowerCase();
  }

  openGameDetails(gameId: string): void {
    this.router.navigate(['details', gameId]);
  }

  ngOnDestroy(): void {
    if (this.gameSub) {
      this.gameSub.unsubscribe();
    }
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
