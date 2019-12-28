import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { User } from '../../models/user.model';
import { LoginResponse } from '../../models/loginResponse.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorMessages } from 'src/app/models/error-messages.model';
import { UserValidatorService } from 'src/app/services/user-validator.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.less']
})
export class LoginPageComponent implements OnInit {

  user: User = new User();
  loginErrorMessage: string = '';
  forgotPasswordErrorMessage: string = '';
  wrongAnswerMessage: string = '';
  newPasswordErrorMessage: string = '';
  loginFormErrors: ErrorMessages = new ErrorMessages();
  step: number = 1;
  securityQuestion: string = '';
  securityAnswer: string = '';
  userId: string = '';
  changedPasswordSuccess: string = '';

  constructor(private authService: AuthService, private userValidator: UserValidatorService) { }

  ngOnInit() {
  }

  onLoginButtonClicked(){
    this.loginErrorMessage = '';
    this.changedPasswordSuccess = "";
    this.loginFormErrors = new ErrorMessages();
    this.user = this.userValidator.trimFormFields(this.user);
    this.loginFormErrors = this.userValidator.validateLoginForm(this.user, this.loginFormErrors);
    const hasErrors = this.loginFormErrors.hasErrors;
    if(!hasErrors){
      const { email, password } = this.user;
      this.authService.login(email, password).subscribe((res: HttpResponse<any>) => {
        if(res[0]){
          const { error } = res[0];
          if(error){
            this.loginErrorMessage = error;
          }
        } else {
          this.loginErrorMessage = '';
        }
      })
    } else {
      this.user.email = this.loginFormErrors.email.length > 0 ? '' : this.user.email;
      this.user.password = this.loginFormErrors.password.length > 0 ? '' : this.user.password;
    }
  }

  onForgotPasswordButtonClicked(){
    this.user.email = '';
    this.user.password = '';
    this.loginFormErrors.email = '';
    this.loginFormErrors.password = '';
    this.step = 2;
  }

  onSubmitButtonClicked(){
    this.forgotPasswordErrorMessage = '';
    this.loginFormErrors = new ErrorMessages();
    this.user = this.userValidator.trimFormFields(this.user);
    this.loginFormErrors = this.userValidator.validateForgotPasswordForm(this.user, this.loginFormErrors);
    const hasErrors = this.loginFormErrors.hasErrors;
    if(!hasErrors) {
      const { username, jmbg } = this.user;
      this.authService.forgotPassword(username, jmbg).subscribe((res: HttpResponse<any>) => {
        if(res[0]){
          const { error } = res[0];
          if(error){
            this.forgotPasswordErrorMessage = error;
          }
        } else {
          this.forgotPasswordErrorMessage =  '';
          const { user, id } = <LoginResponse>(<unknown> res)
          const {securityQuestion, securityAnswer } = user;
          this.userId = id;
          this.securityQuestion = securityQuestion;
          this.securityAnswer = securityAnswer;
          this.user.username = '';
          this.user.jmbg = '';
          this.loginFormErrors.username = '';
          this.loginFormErrors.jmbg = '';
          this.step = 3;
        }
      })
    } else {
      this.user.username = this.loginFormErrors.username.length > 0 ? '' : this.user.username;
      this.user.jmbg = this.loginFormErrors.jmbg.length > 0 ? '' : this.user.jmbg;
    }
  }

  onAnswerButtonClicked(){
    this.forgotPasswordErrorMessage = '';
    this.wrongAnswerMessage = '';
    this.loginFormErrors = new ErrorMessages();
    this.user = this.userValidator.trimFormFields(this.user);
    this.loginFormErrors = this.userValidator.validateSecurityForm(this.user, this.loginFormErrors);
    const hasErrors = this.loginFormErrors.hasErrors;
    if(!hasErrors){
      if(this.user.securityAnswer === this.securityAnswer){
        this.wrongAnswerMessage = '';
        this.user.securityAnswer = '';
        this.step = 4;
      } else {
        this.wrongAnswerMessage = 'Wrong answer.';
      }
    } else {
      this.user.securityAnswer = this.loginFormErrors.securityAnswer.length > 0 ? '' : this.user.securityAnswer;
    }
  }

  onChangePasswordButtonClicked(){
    this.newPasswordErrorMessage = '';
    this.loginFormErrors = new ErrorMessages();
    this.user = this.userValidator.trimFormFields(this.user);
    this.loginFormErrors = this.userValidator.validateNewPasswordForm(this.user, this.loginFormErrors);
    const hasErrors = this.loginFormErrors.hasErrors;
    if(!hasErrors) {
      const { password } = this.user;
      this.authService.setNewPassword(this.userId, password, this.securityQuestion, this.securityAnswer).subscribe((res: HttpResponse<any>) => {
        if(res[0]){
          const { error } = res[0];
          if(error){
            this.newPasswordErrorMessage = error;
          }
        } else {
          this.newPasswordErrorMessage = '';
          this.changedPasswordSuccess = "You have successfully changed your password.";
          this.user.password = '';
          this.step = 1;
        }
      })
    } else {
      this.user.password = this.loginFormErrors.password.length > 0 ? '' : this.user.password;
    }
  }

}
