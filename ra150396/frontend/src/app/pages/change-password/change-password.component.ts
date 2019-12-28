import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { ErrorMessages } from 'src/app/models/error-messages.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserValidatorService } from 'src/app/services/user-validator.service';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.less']
})
export class ChangePasswordComponent implements OnInit {

  user: User = new User();
  loginFormErrors: ErrorMessages = new ErrorMessages();
  error: string = '';
  oldPassword: string = '';
  success: string = '';

  constructor(private authService: AuthService, private userValidator: UserValidatorService, private router: Router) { }

  ngOnInit() {
  }

  onChangePasswordButtonClicked(){
    this.error = '';
    this.loginFormErrors = new ErrorMessages();
    this.user = this.userValidator.trimFormFields(this.user);
    this.loginFormErrors = this.userValidator.validateChangePasswordForm(this.user, this.oldPassword, this.loginFormErrors);
    const hasErrors = this.loginFormErrors.hasErrors;
    if(!hasErrors) {
      const reqBody = {
        username: this.user.username,
        newPassword: this.user.password,
        password: this.oldPassword
      }
      this.authService.changePassword(reqBody).subscribe((res: HttpResponse<any>) => {
        if(res[0]){
          const { error } = res[0];
          if(error){
            this.error = error;
          }
        } else {
          this.error = '';
          localStorage.removeItem('user-id');
          localStorage.removeItem('x-access-token');
          localStorage.removeItem('x-refresh-token');
          localStorage.removeItem('role');
          this.router.navigate(['/login']);
        }
      })
    }
  }

}
