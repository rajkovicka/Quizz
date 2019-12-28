import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { Game } from 'src/app/models/game.model';
import { GameOfDay } from 'src/app/models/gameOfDay.model';
import { TopPlayers } from 'src/app/models/TopPlayers.model';
import { UserService } from 'src/app/services/user.service';
import { HttpResponse } from '@angular/common/http';
import subDays from 'date-fns/subDays';
import format from 'date-fns/format';
import { GamesService } from 'src/app/services/games.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.less']
})
export class PlayerComponent implements OnInit {

  me: User;
  users: Array<User> = new Array<User>();
  error: string = '';
  isRejected: boolean = false;
  isVerified: boolean = false;
  shouldDisplayMeBellow: boolean = true;
  myGames: Array<Game> = new Array<Game>();
  gameOfDay: GameOfDay = new GameOfDay();
  hasPlayed: boolean = false;
  played: string = null;

  constructor(private user: UserService, private game: GamesService, private router: Router) { }

  ngOnInit() {
    this.user.getTop().subscribe((res: HttpResponse<any>) => {
      if(res[0]){
        this.error = 'Error occurred while fetching top 10 players.';
      } else {
        const { user, users } = <TopPlayers>(<undefined>res);
        this.me = user;

        this.users = users;
        const { verified, rejected } = user;
        this.isVerified = verified;
        this.isRejected = rejected;
        this.users.forEach((user) => {
          if(user._id === this.me._id){
            this.shouldDisplayMeBellow = false;
          }
        })
        let subDate = new Date();
        subDate = subDays(subDate, 3);
        this.me.games.forEach((game) => {
          const { date, score, played, anagram } = game;
          const gameDate = new Date(date);
          if(gameDate >= subDate){
            const item = new Game();
            item.score = score;
            item.date = date;
            item.played = played;
            this.myGames.push(item);
          }
          if(date === format(new Date(), 'yyyy-MM-dd')) {
            this.played = played;
            localStorage.setItem('played', played);
            localStorage.setItem('todayScore', JSON.stringify(game));
          }
        })
      }
    })
    this.game.getGameOfTheDay().subscribe((res: HttpResponse<any>) => {
      if(!res){
        return;
      }
      if(res[0]){
        this.error = 'Error occurred while fetching game of day.';
      } else {
        const game = <GameOfDay>(<undefined>res);
        this.gameOfDay = game;
        let i =0;
        for(;i < this.me.games.length; i++){
          if(this.me.games[i].date === this.gameOfDay.date ){
            break;
          }
        }
        this.played = this.me.games[i] ? this.me.games[i].played : null;
      }
    })
  }

  onPlayGameButtonClicked(){
    let i =0;
    for(;i < this.me.games.length; i++){
      if(this.me.games[i].date === this.gameOfDay.date ){
        break;
      }
    }
    let payload = {
      date: format(new Date(), 'yyyy-MM-dd'),
      score: 0,
      anagramScore: 0,
      game5x5Score: 0,
      myNumberScore: 0,
      geographyScore: 0,
      gobletScore: 0,
      played: null,
      id: this.gameOfDay._id
    };
    this.game.playGameOfDay(payload).subscribe((res: HttpResponse<any>) => {
      if(!this.me.games[i]){
        localStorage.setItem('played', null);
        localStorage.setItem('date', format(new Date(), 'yyyy-MM-dd'));
        localStorage.setItem('score', '0');
      } else {
        localStorage.setItem('played', this.me.games[i].played);
        localStorage.setItem('date', format(new Date(), 'yyyy-MM-dd'));
        localStorage.setItem('score', this.me.games[i].score.toString());
      }
      this.played = this.me.games[i] ?  this.me.games[i].played : null;
      localStorage.setItem('gameOfTheDay', JSON.stringify(this.gameOfDay));
      const currentPoint = this.me.games[i] ? this.me.games[i].played : null
      switch(currentPoint){
        case null:
          this.router.navigate(['/anagram']);
          break;
        case 'anagram': 
          this.router.navigate(['/game5x5']);
          break;
        case 'game5x5': 
          this.router.navigate(['/myNumber']);
          break;
        case 'myNumber': 
          this.router.navigate(['/geography']);
          break;
        case 'geography': 
          this.router.navigate(['/goblet']);
          break;
        default:
          this.hasPlayed = true;
      }
    })
  }

}
