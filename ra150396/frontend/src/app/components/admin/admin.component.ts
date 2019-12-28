import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { HttpResponse } from '@angular/common/http';
import { UnverifiedUsers } from 'src/app/models/unverified.model';
import { GamesService } from 'src/app/services/games.service';
import { GamesByType } from 'src/app/models/gamesByType.model';
import format from 'date-fns/format';
import { Router } from '@angular/router';
import { Game } from 'src/app/models/user.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less']
})
export class AdminComponent implements OnInit {

  unverifiedUsers: Array<Object>;
  numOfUnverified: number = null;
  errors: string = '';
  selectGameError: string = '';
  dateError: string = '';
  gameType: string = null;
  gamesByType: Array<Object>;
  numOfGamesByType: number = null;
  day: number = null;
  month: number = null;
  year: number = null;
  gameDate: Date = null;
  selectedGame: string = null;
  successMessage: string = null;
  unplayed: Array<Object>;
  gameTypeForChange: string = null;
  selectedAnagram: string = null;
  selectedGame5x5: string = null;
  selectedGoblet: string = null;

  constructor(private adminService: AdminService, private games: GamesService, private router: Router) { }

  ngOnInit() {
    this.getUnverified();
    this.getGamesOfDay();
  }

  getUnverified(){
    this.adminService.getUnverified().subscribe((res: HttpResponse<any>) => {
      const {unverifiedUsers} = <UnverifiedUsers>(<undefined>res);
      this.unverifiedUsers = unverifiedUsers;
      this.numOfUnverified = Object.keys(this.unverifiedUsers).length;
    })
  }

  getGamesOfDay(){
    this.games.getGamesOfDay().subscribe((res: HttpResponse<any>) => {
      const {games} = <GamesByType>(<undefined>res);
      this.unplayed = games;
    })
  }

  onVerifyButtonClicked(id: string){
    this.errors = '';
    this.adminService.verifyUser(id).subscribe((res: HttpResponse<any>) => {
      if(res[0]){
        this.errors = 'Error occured while verifying.';
      } else {
        this.getUnverified();
      }
    })
  }

  onRejectButtonClicked(id: string){
    this.errors = '';
    this.adminService.rejectUser(id).subscribe((res: HttpResponse<any>) => {
      if(res[0]){
        this.errors = 'Error occured while rejecting.';
      } else {
        this.getUnverified();
      }
    })
  }

  onGetGamesButtonClicked(){
    this.errors = '';
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

  onSetDate(){
    this.successMessage = '';
    if(this.selectedGame === null){
      this.selectedGame = '1234';
    }
    this.dateError = '';
    const selectedDate = new Date(`${this.year}-${this.month}-${this.day}`);
    if(isNaN(selectedDate.getTime())){
      this.dateError = 'Invalid date.';
    } else if(format(new Date(), 'yyyy-MM-dd') >= format(selectedDate, 'yyyy-MM-dd')){
      this.dateError = 'Date must be after today.';
    } else {
      this.gameDate = selectedDate;
    }
  }

  onSetGame(id: string, type: string){
    this.successMessage = '';
    this.selectedGame = id;
    if(type === 'game5x5'){
      this.selectedGame5x5 = id;
    } else {
      this.selectedGoblet = id;
    }
    this.gameType = null;
  }

  onSetAnagram(id: string){
    this.successMessage = '';
    this.selectedAnagram = id;
    this.gameType = null;
  }

  onGameTypeChanged(){
    this.successMessage = '';
    this.gamesByType = null;
  }

  onSetGameOfDay(){
    const reqBody = {
      anagramId: this.selectedAnagram,
      game5x5Id: this.selectedGame5x5,
      gobletId: this.selectedGoblet,
      date: format(new Date(this.gameDate), 'yyyy-MM-dd')
    };
    this.games.addGameOfDay(reqBody).subscribe((res: HttpResponse<any>) => {
      if(res[0]){
        this.selectGameError = 'Error!';
      } else {
        this.successMessage = 'Succesfully added game of the day.';
        this.selectedAnagram = null;
        this.selectedGame5x5 = null;
        this.selectedGoblet = null;
        this.gameDate = null;
        this.gameType = null;
        this.getGamesOfDay();
      }
    })
  }

  onChangeGameTypeForDate(game: Game){
    localStorage.setItem('changeGame', JSON.stringify(game));
    this.router.navigate(['/change']);
    // this.games.changeGameOfTheDay(id, this.gameTypeForChange).subscribe((res: HttpResponse<any>) => {
    //   this.getGamesOfDay();
    // })
  }

}
