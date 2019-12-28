import { Component, OnInit } from '@angular/core';
import { GamesService } from 'src/app/services/games.service';
import { evaluate, parse } from 'mathjs';
import { HttpResponse } from '@angular/common/http';
import format from 'date-fns/format';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-number',
  templateUrl: './my-number.component.html',
  styleUrls: ['./my-number.component.less']
})
export class MyNumberComponent implements OnInit {

  expression: string = '';
  targetNumber: number = 0;
  interval;
  interval2;
  numbers: Array<number> = new Array<number>();
  usedIndexes: Array<number> = new Array<number>();
  startNumbers: boolean = false;
  gotNumbers: boolean = false;
  error: string = '';
  isGameEnabled: boolean = false;
  timeLeft: number = 60;
  result: number = 0;
  score: number = 0;
  isGameFinished: boolean = false;
  success: string = '';
  hasPlayed: boolean = false;
  isNumberClicked: boolean = false;
  noGameToday: boolean = false;

  constructor(private games: GamesService, private router: Router) { }

  ngOnInit() {
    if(localStorage.getItem('role') !== 'player' || !JSON.parse(localStorage.getItem('gameOfTheDay'))){
      this.router.navigate(['/home']);
    } else {
      this.hasPlayed = localStorage.getItem('played') === 'geography' || localStorage.getItem('played') === 'goblet';
    }
  }

  onOperationClick(operator: string){
    this.expression = this.expression.concat(operator);
    this.isNumberClicked = false;
    this.error = '';
  }

  startTimer() {
    this.startNumbers = true;
    this.interval = setInterval(() => {
      let min1 = 1;
      let max1 = 9;
      let min2 = 1;
      let max2 = 3;
      let min3 = 1;
      let max3 = 4;
      let min4 = 1;
      let max4 = 999;
      this.numbers[0] = Math.floor(Math.random()*(max1 - min1)) + min1; 
      this.numbers[1] = Math.floor(Math.random()*(max1 - min1)) + min1; 
      this.numbers[2] = Math.floor(Math.random()*(max1 - min1)) + min1; 
      this.numbers[3] = Math.floor(Math.random()*(max1 - min1)) + min1; 
      this.numbers[4] = Math.floor(Math.random()*(max2 - min2)) + min2; 
      if(this.numbers[4] === 1){
        this.numbers[4] = 10;
      } else if(this.numbers[4] === 2){
        this.numbers[4] = 15;
      } else {
        this.numbers[4] = 20;
      }
      this.numbers[5] = (Math.floor(Math.random()*(max3 - min3)) + min3)*25; 
      this.targetNumber = Math.floor(Math.random()*(max4 - min4)) + min4; 
    },50)
  }

  pauseTimer() {
    clearInterval(this.interval);
    this.gotNumbers = true;
    this.startTimer2();
  }

  startTimer2() {
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
    this.error = '';
    try {
      this.result = evaluate(this.expression);
      if(this.result === this.targetNumber){
        this.score = 10;
      } else if(this.timeLeft > 0) {
        this.error = 'Wrong answer.';
        return;
      }
      this.submitAnswer();
      clearInterval(this.interval);
      this.isGameFinished = true;
    } catch(err){
      this.error = "Invalid expression";
    }
  }

  submitAnswer() {
    this.error = '';
    let date = new Date();
    let reqBody = {
      id: JSON.parse(localStorage.getItem('gameOfTheDay'))._id,
      played: 'myNumber',
      date: format(date, 'yyyy-MM-dd'),
      score: this.score,
      anagramScore: 0,
      game5x5Score: 0,
      myNumberScore: this.score,
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
          this.error = 'Some of the terms may be supervised.';
        }
        let finalScore = parseInt(localStorage.getItem('score'), 10) + this.score; 
        localStorage.setItem('score', finalScore.toString());
        localStorage.setItem('played', 'myNumber');
      }
    })
  }

  onNumberClicked(index: number){
    this.error = '';
    if(this.isNumberClicked){
      this.error = 'You need to insert an operation between numbers.'
      return;
    }
    if(this.isGameEnabled){
      this.error = "";
      if(!this.usedIndexes.includes(index)){
        this.expression = this.expression.concat(this.numbers[index].toString());
        this.isNumberClicked = true;
        this.usedIndexes = this.usedIndexes.concat(index);
      } else {
        this.error = "You already used that number.";
      }
    }
  }

  nextGame(){
    this.router.navigate(['/geography']);
  }

  onDeleteClick() {
    this.error = '';
    if(!this.expression[this.expression.length-1]){
      this.error = "You don't have anything to erase."
      return;
    }
    if(['(', ')', '+', '-', '*', '/'].includes(this.expression[this.expression.length-1])){
      this.expression = this.expression.slice(0, this.expression.length - 1);
    } else {
      this.usedIndexes = this.usedIndexes.slice(0, this.usedIndexes.length - 1);
      this.expression = this.expression.slice(0, this.expression.length - 1);
      this.isNumberClicked = false;
    }
  }

}
