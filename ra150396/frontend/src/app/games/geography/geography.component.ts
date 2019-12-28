import { Component, OnInit } from '@angular/core';
import { GamesService } from 'src/app/services/games.service';
import { HttpResponse } from '@angular/common/http';
import { Geography } from '../../models/geography.model';
import { Geo } from '../../models/geo.model';
import format from 'date-fns/format';
import { Router } from '@angular/router';

@Component({
  selector: 'app-geography',
  templateUrl: './geography.component.html',
  styleUrls: ['./geography.component.less']
})
export class GeographyComponent implements OnInit {

  interval;
  letter: string = '';
  isGameFinished: boolean = false;
  startLetter: boolean = false;
  gotLetter: boolean = false;
  isGameEnabled: boolean = false;
  timeLeft: number = 120;
  score: number = 0;
  country: string = '';
  city: string = '';
  lake: string = '';
  mountain: string = '';
  river: string = '';
  animal: string = '';
  plant: string = '';
  group: string = '';
  error: string = '';
  success: string = '';
  hasPlayed: boolean = false;
  noGameToday: boolean = false;
  supervised: string = '';

  constructor(private games: GamesService, private router: Router) { }

  ngOnInit() {
    if(localStorage.getItem('role') !== 'player' || !JSON.parse(localStorage.getItem('gameOfTheDay'))){
      this.router.navigate(['/home']);
    } else {
      let gameOfTheDay = JSON.parse(localStorage.getItem('gameOfTheDay'));
      this.noGameToday = !gameOfTheDay;
      this.hasPlayed = localStorage.getItem('played') === 'geography' || localStorage.getItem('played') === 'goblet';
    }
  }

  startTimer() {
    this.startLetter = true;
    this.interval = setInterval(() => {
      let random_string = '';
      let random_ascii = Math.floor((Math.random() * 25) + 97);
      random_string = String.fromCharCode(random_ascii);
      this.letter = random_string;
    },50)
  }

  pauseTimer() {
    this.gotLetter = true;
    clearInterval(this.interval);
    //this.letter = 's';
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
    let terms = [];
    this.error = '';
    let numOfTerms = 0;
    this.country = this.country.trim().toLowerCase();
    this.city = this.city.trim().toLowerCase();
    this.lake = this.lake.trim().toLowerCase();
    this.mountain = this.mountain.trim().toLowerCase();
    this.river = this.river.trim().toLowerCase();
    this.animal = this.animal.trim().toLowerCase();
    this.plant = this.plant.trim().toLowerCase();
    this.group = this.group.trim().toLowerCase();
    let hasErrors= false;
    if(this.country.length > 0 && this.country.charAt(0) !== this.letter){
      this.error = 'Words must start with the given letter.';
      this.country = '';
      hasErrors = true;
    }
    if(this.city.length > 0 && this.city.charAt(0) !== this.letter){
      this.error = 'Words must start with the given letter.';
      this.city = '';
      hasErrors = true;
    }
    if(this.lake.length > 0 && this.lake.charAt(0) !== this.letter){
      this.error = 'Words must start with the given letter.';
      this.lake = '';
      hasErrors = true;
    }
    if(this.mountain.length > 0 && this.mountain.charAt(0) !== this.letter){
      this.error = 'Words must start with the given letter.';
      this.mountain = '';
      hasErrors = true;
    }
    if(this.river.length > 0 && this.river.charAt(0) !== this.letter){
      this.error = 'Words must start with the given letter.';
      this.river = '';
      hasErrors = true;
    }
    if(this.animal.length > 0 && this.animal.charAt(0) !== this.letter){
      this.error = 'Words must start with the given letter.';
      this.animal = '';
      hasErrors = true;
    }
    if(this.plant.length > 0 && this.plant.charAt(0) !== this.letter){
      this.error = 'Words must start with the given letter.';
      this.plant = '';
      hasErrors = true;
    }
    if(this.group.length > 0 && this.group.charAt(0) !== this.letter){
      this.error = 'Words must start with the given letter.';
      this.group = '';
      hasErrors = true;
    }
    if(this.country.length > 0){
      terms.push(this.country);
      numOfTerms += 1;
    }
    if(this.city.length > 0){
      terms.push(this.city);
      numOfTerms += 1;
    }
    if(this.lake.length > 0){
      terms.push(this.lake);
      numOfTerms += 1;
    }
    if(this.mountain.length > 0){
      terms.push(this.mountain);
      numOfTerms += 1;
    }
    if(this.river.length > 0){
      terms.push(this.river);
      numOfTerms += 1;
    }
    if(this.animal.length > 0){
      terms.push(this.animal);
      numOfTerms += 1;
    }
    if(this.plant.length > 0){
      terms.push(this.plant);
      numOfTerms += 1;
    }
    if(this.group.length > 0){
      terms.push(this.group);
      numOfTerms += 1;
    }
    const searchParams = terms.join(',')
    if(!hasErrors && numOfTerms > 0){
      clearInterval(this.interval);
      this.games.getGeographyScore(searchParams).subscribe((res: HttpResponse<any>) => {
        this.isGameFinished = true;
        if(res[0]){
          this.error = 'Error occurred while saving game';
        } else {
          let {terms} = <Geography>(<undefined>res);
          this.score = this.calculateScore(terms);
          let date = new Date();
          let reqBody = {
            id: JSON.parse(localStorage.getItem('gameOfTheDay'))._id,
            played: 'myNumber',
            date: format(date, 'yyyy-MM-dd'),
            score: this.score,
            anagramScore: 10,
            game5x5Score: 0,
            myNumberScore: 0,
            geographyScore: this.score,
            gobletScore: 0
          };
          this.games.playGameOfDay(reqBody).subscribe((res: HttpResponse<any>) => {
            if(res[0]){
              this.error = 'Error occurred while saving game';
            } else {
              if(this.score > 0){
                this.success = 'Bravo!';
              } else {
                this.error = 'Some of the terms are being supervised';
              }
              let finalScore = parseInt(localStorage.getItem('score'), 10) + this.score; 
              localStorage.setItem('score', finalScore.toString());
              localStorage.setItem('played', 'geography');
            }
          })
        }
      })
    } else if(numOfTerms === 0){
      this.error = 'You must enter at least one term to submit answer';
    }

  }

  calculateScore(terms: Array<Object>){
    let score = 0;
    let knownTypes = [];
    let knownValues = [];
    terms.forEach(term => {
      const { type, value } = <Geo>term;
      switch(type){
        case 'country':
          if(this.country === value){
            score += 1;
            knownTypes.push(type);
            knownValues.push(value);
          }
          return;
        case 'city':
          if(this.city === value){
            score += 1;
            knownTypes.push(type);
            knownValues.push(value);
          }
          return;
        case 'lake':
          if(this.lake === value){
            score += 1;
            knownTypes.push(type);
            knownValues.push(value);
          }
        return;
        case 'mountain':
          if(this.mountain === value){
            score += 1;
            knownTypes.push(type);
            knownValues.push(value);
          }
        return;
        case 'river':
          if(this.river === value){
            score += 1;
            knownTypes.push(type);
            knownValues.push(value);
          }
        return;
        case 'animal':
          if(this.animal === value){
            score += 1;
            knownTypes.push(type);
            knownValues.push(value);
          }
        return;
        case 'plant':
          if(this.plant === value){
            score += 1;
            knownTypes.push(type);
            knownValues.push(value);
          }
        return;
        case 'group':
          if(this.group === value){
            score += 1;
            knownTypes.push(type);
            knownValues.push(value);
          }
        return;
        default:
          return;
      }
    });
    this.findUnknownTerms(knownTypes, knownValues);
    return score;
  }

  findUnknownTerms(knownTypes: Array<string>, knownValues: Array<string>) {
    let unknownTypes = [];
    let unknownValues = [];
    if(!(knownTypes.includes('country') && knownValues.includes(this.country)) && this.country !== ''){
      unknownTypes.push('country');
      unknownValues.push(this.country);
    }
    if(!(knownTypes.includes('city') && knownValues.includes(this.city)) && this.city !== ''){
      unknownTypes.push('city');
      unknownValues.push(this.city);
    }
    if(!(knownTypes.includes('lake') && knownValues.includes(this.lake)) && this.lake !== ''){
      unknownTypes.push('lake');
      unknownValues.push(this.lake);
    }
    if(!(knownTypes.includes('mountain') && knownValues.includes(this.mountain)) && this.mountain !== ''){
      unknownTypes.push('mountain');
      unknownValues.push(this.mountain);
    }
    if(!(knownTypes.includes('river') && knownValues.includes(this.river)) && this.river !== ''){
      unknownTypes.push('river');
      unknownValues.push(this.river);
    }
    if(!(knownTypes.includes('animal') && knownValues.includes(this.animal)) && this.animal !== ''){
      unknownTypes.push('animal');
      unknownValues.push(this.animal);
    }
    if(!(knownTypes.includes('plant') && knownValues.includes(this.plant)) && this.plant !== ''){
      unknownTypes.push('plant');
      unknownValues.push(this.plant);
    }
    if(!(knownTypes.includes('group') && knownValues.includes(this.group)) && this.group !== ''){
      unknownTypes.push('group');
      unknownValues.push(this.group);
    }
    this.games.sendUnknownGeographyTerms(unknownTypes, unknownValues).subscribe((res: HttpResponse<any>) => {
      this.supervised = unknownTypes.length > 0 ? 'Some of the terms need to be revised by supervisor.' : '';
    })
  }

  nextGame(){
    this.router.navigate(['/goblet']);
  }

}
