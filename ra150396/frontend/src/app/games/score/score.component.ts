import { Component, OnInit } from '@angular/core';
import { Game } from 'src/app/models/user.model';
import { Router } from '@angular/router';
import { GamesService } from 'src/app/services/games.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.less']
})
export class ScoreComponent implements OnInit {

  todayScore: Game = null;
  noScore: boolean = false;
  notFinished: boolean = true;

  constructor(private router: Router, private games: GamesService) { }

  ngOnInit() {
    if(localStorage.getItem('role') !== 'player'){
      this.router.navigate(['/home']);
    }
    this.games.getScore().subscribe((res: HttpResponse<any>) => {
      this.todayScore = <Game>(<undefined>res);
      this.noScore = this.todayScore === null;
      this.notFinished = this.todayScore.played !== 'goblet';
    })
  }

}
