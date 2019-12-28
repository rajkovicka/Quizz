import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from 'src/app/models/game.model';
import { GamesService } from 'src/app/services/games.service';
import { HttpResponse } from '@angular/common/http';
import { GamesByType } from 'src/app/models/gamesByType.model';
import { GameOfDay } from 'src/app/models/gameOfDay.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-change-game',
  templateUrl: './change-game.component.html',
  styleUrls: ['./change-game.component.less']
})
export class ChangeGameComponent implements OnInit {

  gameOfDay: GameOfDay;
  gameId: string = '';
  error: string = '';
  successMessage: string = '';
  gamesByType: Array<Object>;
  gameType: string = '';
  selectGameError: string = '';
  numOfGamesByType: number;
  day: number = null;
  month: number = null;
  year: number = null;
  gameDate: Date = null;
  dateError: string = '';

  constructor(private router: Router, private games: GamesService) { }

  ngOnInit() {
    if(localStorage.getItem('role') !== 'admin') {
      this.router.navigate(['/home']);
    }
    this.gameId = JSON.parse(localStorage.getItem('changeGame'))._id;
    this.games.getGameOfDay(this.gameId).subscribe((res: HttpResponse<any>) => {
      if(res[0]){
        this.error = 'Error!';
      } else {
        this.gameOfDay = <GameOfDay>(<undefined>res);
      }
    })
  }

  onGameTypeChanged(){
    this.successMessage = '';
    this.gamesByType = null;
  }

  onGetGamesButtonClicked(){
    this.error = '';
    this.games.getGamesByType(this.gameType).subscribe((res: HttpResponse<any>) => {
      if(res[0]){
        this.selectGameError = 'Error occured while fetching games.';
      } else {
        const {games} = <GamesByType>(<undefined>res);
        this.gamesByType = games;
        this.numOfGamesByType = Object.keys(this.gamesByType).length;
      }
    })
  }

  onSetAnagram(id: string){
    this.successMessage = '';
    this.gameOfDay._anagramGameId = id;
    this.gameType = null;
  }

  onSetGame(id: string, type: string){
    this.successMessage = '';
    if(type === 'game5x5'){
      this.gameOfDay._game5x5GameId = id;
    } else {
      this.gameOfDay._gobletGameId = id;
    }
    this.gameType = null;
  }

  onSetDate(){
    this.successMessage = '';
    this.dateError = '';
    const selectedDate = new Date(`${this.year}-${this.month}-${this.day}`);
    if(isNaN(selectedDate.getTime())){
      this.dateError = 'Invalid date.';
    } else if(format(new Date(), 'yyyy-MM-dd') >= format(selectedDate, 'yyyy-MM-dd')){
      this.dateError = 'Date must be after today.';
    } else {
      this.gameOfDay.date = format(selectedDate, 'yyyy-MM-dd');
    }
  }

  onSetGameOfDay(){
    this.error = '';
    const reqBody = {
      _anagramGameId: this.gameOfDay._anagramGameId,
      _game5x5GameId: this.gameOfDay._game5x5GameId,
      _gobletGameId: this.gameOfDay._gobletGameId,
      date: this.gameOfDay.date,
      numOfPlayers: 0
    };
    this.games.changeGameOfTheDay(this.gameId, reqBody).subscribe((res: HttpResponse<any>) => {
      console.log(res);
    })
  }

}
