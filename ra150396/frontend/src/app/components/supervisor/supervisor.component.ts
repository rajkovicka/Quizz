import { Component, OnInit } from '@angular/core';
import { GamesService } from 'src/app/services/games.service';
import { HttpResponse } from '@angular/common/http';
import { GeographyRequests } from 'src/app/models/geographyRequests.model';
import { GeographyRequest } from 'src/app/models/geographyRequest.model';

@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.component.html',
  styleUrls: ['./supervisor.component.less']
})
export class SupervisorComponent implements OnInit {

  gameType: String;
  question: String;
  answer: String;
  questions: Array<String> = new Array<String>(13).fill('');
  answers: Array<String> = new Array<String>(13).fill('');
  words: Array<String> = new Array<String>(5).fill('');
  successMessage: String = '';
  anagramError: String = '';
  game5x5error: String = '';
  gobletError: String = '';
  requests: Array<GeographyRequest> = new Array();
  requestsError: String = '';

  constructor(private games: GamesService) { }

  ngOnInit() {
    this.games.getGeographyRequests().subscribe((res: HttpResponse<any>) =>{
        if(res[0]){
          this.requestsError = 'Error occurred while fetching geography requests.';
        } else {
          const {requests} = <GeographyRequests>(<undefined>res);
          this.requests = requests;
        }
    })
  }

  onAddNewAnagram(){
    this.successMessage = '';
    this.anagramError = '';
    let str1 = this.question;
    let str2 = this.answer;
    this.question = this.question.trim();
    this.answer = this.answer.trim();
    str1 = str1.replace(/\s/g, '');
    str2 = str2.replace(/\s/g, '');
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    if(
      str1.length===str2.length
      && str1.split("").sort().join() == str2.split("").sort().join()
    ){
      let reqBody = {
        question: this.question.toLowerCase(),
        answer: this.answer.toLowerCase(),
        type: "anagram"
      };
      this.games.addNewGame(reqBody).subscribe((res: HttpResponse<any>) =>{
          if(res[0]){
            this.anagramError = 'Error occured while adding anagram.';
          } else {
            this.successMessage = 'Anagram successfully added to the database.';
            this.gameType = null;
            this.question = '';
            this.answer = '';
          }
      })
    } else {
        if(str1.length!==str2.length){
          this.anagramError = "Question and answer are not the same length.";
        } else {
          this.anagramError = "Question and answer must have same letters";
        }
    }
  }

  onAdd5x5Game(){
    this.successMessage = '';
    this.game5x5error = '';
    let hasErrors = false;
    for(let i = 0; i<this.words.length;i++){
      this.words[i] = this.words[i].trim();
      if(this.words[i].length !== 5 || !this.words[i].match(/^[a-z]{5}$/)){
        this.words[i] = '';
        hasErrors = true;
      }
    }
    if(hasErrors){
      this.game5x5error = "All words must have 5 alphabetic lowercase characters.";
    }
    if(this.game5x5error === ''){
      let reqBody = {
        words: this.words,
        type: "game5x5"
      };
      this.games.addNewGame(reqBody).subscribe((res: HttpResponse<any>) =>{
          if(res[0]){
            this.game5x5error = 'Error occured while adding 5x5 game.';
          } else {
            this.successMessage = '5x5 game successfully added to the database.';
            this.gameType = null;
            this.words = new Array<String>(5).fill('');
          }
      })
    }
  }

  onAddGoblet(){
    this.successMessage = '';
    this.gobletError = '';
    let hasErrors = false;
    for(let i = 0; i<this.answers.length;i++){
      this.answers[i] = this.answers[i].trim().toLowerCase();
      this.questions[i] = this.questions[i].trim().toLowerCase();
      if(i < 7) {
        if(this.answers[i].length !== (9-i)){
          this.answers[i] = '';
          hasErrors = true;
        }
      } else {
        if(this.answers[i].length !== (9-6+(i-6))){
          this.answers[i] = '';
          hasErrors = true;
        }
      }
      if(this.questions[i].length < 5){
        this.questions[i] = '';
        hasErrors = true;
      }
      if(!this.answers[i].match(/^[a-z]{3,}$/)) {
        this.answers[i] = '';
        hasErrors = true;
      }
    }
    if(hasErrors){
      this.gobletError = "Inadequate number of characters.";
    }
    if(this.gobletError === ''){
      let reqBody = {
        questions: this.questions,
        answers: this.answers,
        type: "goblet"
      };
      this.games.addNewGame(reqBody).subscribe((res: HttpResponse<any>) =>{
          if(res[0]){
            this.game5x5error = 'Error occured while adding goblet.';
          } else {
            this.successMessage = 'Goblet successfully added to the database.';
            this.gameType = null;
            this.questions = new Array<String>(13).fill('');
            this.answers = new Array<String>(13).fill('');
          }
      })
    }
  }

  onRejectButtonClicked(id: string){
    this.games.rejectTerm(id).subscribe((res: HttpResponse<any>) =>{
      this.games.getGeographyRequests().subscribe((res: HttpResponse<any>) =>{
        if(res[0]){
          this.requestsError = 'Error occurred while fetching geography requests.';
        } else {
          const {requests} = <GeographyRequests>(<undefined>res);
          this.requests = requests;
        }
    })
    })
  }

  onVerifyButtonClicked(id: string, userId: string){
    this.games.verifyTerm(id, { score: 4, user_id: userId }).subscribe((res: HttpResponse<any>) =>{
      this.games.getGeographyRequests().subscribe((res: HttpResponse<any>) =>{
          if(res[0]){
            this.requestsError = 'Error occurred while fetching geography requests.';
          } else {
            const {requests} = <GeographyRequests>(<undefined>res);
            this.requests = requests;
          }
      })
    })
  }

}
