import { Component, OnInit } from '@angular/core';
import { Game5x5Row } from '../../models/game5x5Row.model';
import { GamesService } from 'src/app/services/games.service';
import { BoxField } from 'src/app/models/boxFiled.model';
import { HttpResponse } from '@angular/common/http';
import format from 'date-fns/format';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game5x5',
  templateUrl: './game5x5.component.html',
  styleUrls: ['./game5x5.component.less']
})
export class Game5x5Component implements OnInit {

  words: Array<string> = new Array<string>();
  game: Array<Game5x5Row> = new Array<Game5x5Row>();
  timeLeft: number = 60;
  interval;
  gameId: string = '';
  score: number = 0;
  letter: string = '';
  isGameEnabled: boolean = false;
  isGameFinished: boolean = false;
  error: string = '';
  success: string = '';
  hasPlayed: boolean = false;
  usedLetters: string = '';
  noGameToday: boolean = false;

  constructor(private games: GamesService, private router: Router) { }

  ngOnInit() {
    if(localStorage.getItem('role') !== 'player' || !JSON.parse(localStorage.getItem('gameOfTheDay'))){
      this.router.navigate(['/home']);
    } else {
      let gameOfTheDay = JSON.parse(localStorage.getItem('gameOfTheDay'));
      this.gameId = gameOfTheDay._game5x5GameId;
      this.noGameToday = !gameOfTheDay;
      this.hasPlayed = localStorage.getItem('played') !== 'anagram';
      this.getGame();
    }
  }

  getGame(){
    this.games.getGame('game5x5', this.gameId).subscribe((res: HttpResponse<any>) => {
      const {words} = <Game5x5Component>(<undefined>res);
      this.words = words;
      this.renderGame();
    })
  }

  renderGame(){
    let row;
    for(let i = 0; i<this.words.length;i++){
      row = this.words[i];
      this.game[i] = new Game5x5Row();
      for(let j=0;j<row.length;j++){
        let box = new BoxField();
        box.char = row[j];
        this.game[i].word.push(box);
      }
    }
  }

  startTimer() {
    this.letter = String.fromCharCode(Math.floor(Math.random() * 26) + 65).toLowerCase();
    this.usedLetters = this.usedLetters + this.letter;
    let row;
    for(let i = 0; i<this.words.length;i++){
      row = this.words[i];
      for(let j=0;j<row.length;j++){
        let box = this.game[i].word[j];
        box.char = row[j];
        if(!box.isVisible){
          box.isVisible = this.letter === box.char || box.isVisible;
        }
        this.game[i].word[j] = box;
      }
    }
    this.letter = '';
    this.isGameEnabled = true;
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 0;
        this.clearTimer();
      }
    },1000)
  }

  clearTimer(){
    clearInterval(this.interval);
    let row;
    for(let i = 0;i<this.words.length;i++){
      let numOfVisible = 0;
      row = this.words[i];
      for(let j =0;j<row.length;j++){
        numOfVisible = this.game[i].word[j].isVisible ? numOfVisible + 1 : numOfVisible;
      }
      if(numOfVisible === 5){
        this.score = this.score + 2;
      }
    }
    for(let i = 0;i<this.words.length;i++){
      let numOfVisible = 0;
      row = this.words[i];
      for(let j =0;j<row.length;j++){
        numOfVisible = this.game[j].word[i].isVisible ? numOfVisible + 1 : numOfVisible;
      }
      if(numOfVisible === 5){
        this.score = this.score + 2;
      }
    }
    this.isGameFinished = true;
    let date = new Date();
    let reqBody = {
      id: JSON.parse(localStorage.getItem('gameOfTheDay'))._id,
      played: 'game5x5',
      date: format(date, 'yyyy-MM-dd'),
      score: this.score,
      anagramScore: 0,
      game5x5Score: this.score,
      myNumberScore: 0,
      geographyScore: 0,
      gobletScore: 0
    };
    this.error = '';
    this.success = '';
    this.games.playGameOfDay(reqBody).subscribe((res: HttpResponse<any>) => {
      if(res[0]){
        this.error = 'Error occurred while saving game';
      } else {
        if(this.score > 0){
          this.success = 'Bravo!';
        } else {
          this.error = 'Better luck next time!';
        }
        let finalScore = parseInt(localStorage.getItem('score'), 10) + this.score; 
        localStorage.setItem('score', finalScore.toString());
        localStorage.setItem('played', 'game5x5');
      }
    })
  }

  onAnswerSubmit(){
    if(!this.letter){
      this.error = 'You need to enter a letter first.';
      return;
    }
    if(this.usedLetters.includes(this.letter)){
      this.error = 'This letter is already revealed.';
      this.letter = '';
      return;
    }
    if(!this.letter.match(/[a-z]/i)){
      this.error = 'Only letters are allowed!';
      this.letter = '';
      return;
    }
    this.error = '';
    this.letter = this.letter.toLowerCase();
    if(!(this.letter.length === 1 && this.letter.match(/[a-z]/i))){
      this.error = 'Enter only one letter.'
      this.letter = '';
      return;
    }
    this.usedLetters = this.usedLetters + this.letter;
    let row;
    for(let i = 0; i<this.words.length;i++){
      row = this.words[i];
      for(let j=0;j<row.length;j++){
        let box = this.game[i].word[j];
        box.char = row[j];
        if(!box.isVisible){
          this.score = this.letter === box.char ? this.score + 1 : this.score;
          box.isVisible = this.letter === box.char || box.isVisible;
        }
        this.game[i].word[j] = box;
      }
    }
    this.letter = '';
    if(this.score === 25){
      this.clearTimer();
    }
  }

  nextGame(){
    this.router.navigate(['/myNumber']);
  }

}
