import { Component, OnInit } from '@angular/core';
import { GobletRow } from '../../models/gobletRow.model';
import { BoxField } from 'src/app/models/boxFiled.model';
import { GamesService } from 'src/app/services/games.service';
import { Goblet } from 'src/app/models/goblet.model';
import { HttpResponse } from '@angular/common/http';
import format from 'date-fns/format';
import { Router } from '@angular/router';

@Component({
  selector: 'app-goblet',
  templateUrl: './goblet.component.html',
  styleUrls: ['./goblet.component.less']
})
export class GobletComponent implements OnInit {

  answers: Array<string> = new Array<string>();
  questions: Array<string> = new Array<string>();

  goblet: Array<GobletRow> = new Array<GobletRow>();
  timeLeft: number = 30;
  interval;
  gameId: string = '';
  currentQuestion: number = 0;
  score: number = 0;
  answer: string = '';
  isGameEnabled: boolean = false;
  isGameFinished: boolean = false;
  error: string = '';
  success: string = '';
  hasPlayed: boolean = false;
  noGameToday: boolean = false;

  constructor(private games: GamesService, private router: Router) { }

  ngOnInit() {
    if(localStorage.getItem('role') !== 'player' || !JSON.parse(localStorage.getItem('gameOfTheDay'))){
      this.router.navigate(['/home']);
    } else {
      let gameOfTheDay = JSON.parse(localStorage.getItem('gameOfTheDay'));
      this.gameId = gameOfTheDay._gobletGameId;
      this.noGameToday = !gameOfTheDay;
      this.hasPlayed = localStorage.getItem('played') === 'goblet';
      this.getGame();
    }
  }

  getGame(){
    this.games.getGame('goblet', this.gameId).subscribe((res: HttpResponse<any>) => {
      const {questions, answers} = <Goblet>(<undefined>res);
      this.answers = answers;
      this.questions = questions;
      this.renderGoblet();
    })
  }

  renderGoblet(){
    let row;
    for(let i = 0; i<this.answers.length;i++){
      row = this.answers[i];
      this.goblet[i] = new GobletRow();
      for(let j=0;j<row.length;j++){
        let box = new BoxField();
        box.char = row[j];
        this.goblet[i].word.push(box);
      }
    }
  }

  startTimer() {
    this.isGameEnabled = true;
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.onAnswerSubmit();
        this.timeLeft = 30;
      }
      if(this.currentQuestion === 13) {
        this.isGameFinished = true;
        this.clearTimer();
      }
    },1000)
  }

  clearTimer() {
    clearInterval(this.interval);
    this.isGameFinished = true;
    let row;
    for(let i = 0; i<this.answers.length;i++){
      row = this.answers[i];
      this.goblet[i] = new GobletRow();
      for(let j=0;j<row.length;j++){
        let box = new BoxField();
        box.char = row[j];
        box.isVisible = true;
        this.goblet[i].word.push(box);
      }
    }
    let date = new Date();
    let reqBody = {
      id: JSON.parse(localStorage.getItem('gameOfTheDay'))._id,
        played: 'goblet',
        date: format(date, 'yyyy-MM-dd'),
        score: this.score,
        anagramScore: 0,
        game5x5Score: 0,
        myNumberScore: 0,
        geographyScore: 0,
        gobletScore: this.score
    };
    this.error = '';
    this.success = '';
    this.games.playGameOfDay(reqBody).subscribe((res: HttpResponse<any>) => {
      if(res[0]){
        this.error = 'Error occurred while saving.';
      } else {
        if(this.score > 0){
          this.success = 'Bravo!';
        } else {
          this.error = 'Better luck next time!';
        }
        let finalScore = parseInt(localStorage.getItem('score'), 10) + this.score; 
        localStorage.setItem('score', finalScore.toString());
        localStorage.setItem('played', 'goblet');
      }
    })
  }

  onAnswerSubmit(){
    this.error = '';
    this.answer = this.answer.trim().toLowerCase();
    if(this.answer !== this.answers[this.currentQuestion].toLowerCase() && this.timeLeft > 0){
      this.error = 'Wrong answer!';
      this.answer = '';
      return;
    }
    if(this.answer === this.answers[this.currentQuestion].toLowerCase()){
      this.score = this.score + 2;
      for(let i = 0;i<this.answers[this.currentQuestion].length;i++){
        this.goblet[this.currentQuestion].word[i].isVisible = true;
      }
    }
    this.currentQuestion = this.currentQuestion + 1;
    this.answer = '';
    this.timeLeft = 30;
  }

  nextGame(){
    this.router.navigate(['/score']);
  }

}
