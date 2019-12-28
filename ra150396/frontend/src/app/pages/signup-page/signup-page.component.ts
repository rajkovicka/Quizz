import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { User } from '../../models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserValidatorService } from 'src/app/services/user-validator.service';
import { ErrorMessages } from 'src/app/models/error-messages.model';
import { WebRequestService } from 'src/app/services/web-request.service';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.less']
})
export class SignupPageComponent implements OnInit {

  user: User = new User();
  formErrors: ErrorMessages = new ErrorMessages();
  serverError: string = '';
  
  constructor(
    private authService: AuthService,
    private userValidator: UserValidatorService,
    private webService: WebRequestService
  ) { }

  ngOnInit() {
  }

  onSignupButtonClicked(){
    this.formErrors = new ErrorMessages();
    this.user = this.userValidator.trimFormFields(this.user);
    this.formErrors = this.userValidator.validateSignupForm(this.user, this.formErrors);
    const hasErrors = this.formErrors.hasErrors;
    if(!hasErrors) {
      this.authService.signup(this.user).subscribe((res: HttpResponse<any>) => {
        this.serverError = res.body.message;
      })
    }
  }

  uploadPic(event){
    const file = event.target.files[0];
    this.webService.upload(file).subscribe((res: HttpResponse<any>) => {
      this.user.imgPath = res.body.filename;
    });
  }

}
