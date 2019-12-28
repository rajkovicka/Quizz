import { Component, OnInit } from '@angular/core';
import { GamesService } from 'src/app/services/games.service';
import { HttpResponse } from '@angular/common/http';
import { Anagram } from 'src/app/models/anagram.model';
import format from 'date-fns/format';
import { Router } from '@angular/router';

@Component({
  selector: 'app-anagram',
  templateUrl: './anagram.component.html',
  styleUrls: ['./anagram.component.less']
})
export class AnagramComponent implements OnInit {

  success: string = '';
  error: string = '';
  question: string;
  answerSolution: string;
  answer: string = '';
  timeLeft: number = 60;
  interval;
  isGameEnabled: boolean = false;
  isGameFinished: boolean = false;
  showResult: boolean = false;
  score: number = null;
  gameId: string = '';
  hasPlayed: boolean = false;
  noGameToday: boolean = false;

  constructor(private games: GamesService, private router: Router) { }

  ngOnInit() {
    if(localStorage.getItem('role') !== 'player' || !JSON.parse(localStorage.getItem('gameOfTheDay'))){
      this.router.navigate(['/home']);
    } else {
      let gameOfTheDay = JSON.parse(localStorage.getItem('gameOfTheDay'));
      this.gameId = gameOfTheDay._anagramGameId;
      this.noGameToday = !gameOfTheDay;
      this.hasPlayed = localStorage.getItem('played') !== 'null';
      this.getGame();
    }
  }

  getGame(){
    this.games.getGame('anagram', this.gameId).subscribe((res: HttpResponse<any>) => {
      const {question, answer} = <Anagram>(<undefined>res);
      this.question = question;
      this.answerSolution = answer;
    })
  }

  startTimer() {
    this.isGameEnabled = true;
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.isGameEnabled = false;
        this.isGameFinished = true;
        this.onSubmitAnswer();
      }
    },1000)
  }

  clearTimer() {
    clearInterval(this.interval);
    this.isGameFinished = true;
    this.showResult = true;
  }

  onSubmitAnswer(){
    if(this.answer !== this.answerSolution && this.timeLeft > 0){
      this.error = 'Wrong answer!';
      this.answer = '';
      return;
    }
    this.answer = this.answer.trim();
    if(this.answer === '' && this.timeLeft > 0){
      this.error = 'Write an answer first';
      return;
    }
    this.clearTimer();
    let reqBody;
    let date = new Date();
    if(this.answer === this.answerSolution){
      reqBody = {
        id: JSON.parse(localStorage.getItem('gameOfTheDay'))._id,
        played: 'anagram',
        date: format(date, 'yyyy-MM-dd'),
        score: 10,
        anagramScore: 10,
        game5x5Score: 0,
        myNumberScore: 0,
        geographyScore: 0,
        gobletScore: 0
      };
    } else {
      reqBody = {
        id: JSON.parse(localStorage.getItem('gameOfTheDay'))._id,
        played: 'anagram',
        date: format(date, 'yyyy-MM-dd'),
        score: 0,
        anagramScore: 0,
        game5x5Score: 0,
        myNumberScore: 0,
        geographyScore: 0,
        gobletScore: 0
      };
    }
    this.error = '';
    this.success = '';
    this.games.playGameOfDay(reqBody).subscribe((res: HttpResponse<any>) => {
      if(res[0]){
        this.error = 'Error occurred while saving.';
      } else {
        if(this.answer === this.answerSolution){
          this.score = 10;
          this.success = 'Bravo!';
        } else {
          this.score = 0;
          this.error = 'Better luck next time!';
        }
      }
      let finalScore = parseInt(localStorage.getItem('score'), 10) + this.score; 
      localStorage.setItem('score', finalScore.toString());
      localStorage.setItem('played', 'anagram');
    })

  }

  nextGame(){
    this.router.navigate(['/game5x5']);
  }

}
