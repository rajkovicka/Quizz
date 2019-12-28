import { Injectable } from '@angular/core';
import { User, GENDER_MALE, GENDER_FEMALE } from '../models/user.model';
import { ErrorMessages } from '../models/error-messages.model';

const PASSWORD_REGEX = /^(?=.{8,12}$)(?!.*(\S)\1{2})(?=.*[A-Z])(?=.*[a-z]{3})(?=.*\d)(?=.*[^a-zA-Z0-9])([a-zA-Z]\S*)$/
const JMBG_REGEX = /^\d{13}$/i;
const EMAIL_REGEX = /(^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$)/i;

const NAME_REQUIRED = 'Name must contain at least 3 characters!';
const LAST_NAME_REQUIRED = 'Last must contain at least 3 characters!';
const EMAIL_REQUIRED = 'Invalid email!';
const PROFESSION_REQUIRED = 'Profession must contain at least 3 characters!';
const USERNAME_REQUIRED = 'Username must contain at least 3 characters!';
const PASSWORD_REQUIRED = 'Password must contain at least 1 uppercase letter, 3 lowercase letters, one numeric, one special character, must start with a letter and can contain between 8 and 12 characters!';
const PASSWORD_CONFIRMATION_REQUIRED = "Passwords don't match!";
const GENDER_REQUIRED = 'Gender is required!';
const JMBG_REQUIRED = 'JMBG must contain 13 digits!';
const IMG_REQUIRED = 'Avatar is required!';
const SECURITY_QUESTION_REQUIRED = 'Security question is required!';
const SECURITY_ANSWER_REQUIRED = 'Security answer is required!';

@Injectable({
  providedIn: 'root'
})
export class UserValidatorService {

  constructor() { }

  trimFormFields(user: User): User {
    user.name = user.name.trim();
    user.lastName = user.lastName.trim();
    user.email = user.email.trim();
    user.profession = user.profession.trim();
    user.username = user.username.trim();
    user.password = user.password.trim();
    user.passwordConfirmation = user.passwordConfirmation.trim();
    user.jmbg = user.jmbg.trim();
    user.securityQuestion = user.securityQuestion.trim();
    user.securityAnswer = user.securityAnswer.trim();
    return user;
  }

  validateSignupForm(user: User, errorMessages: ErrorMessages): ErrorMessages{
    if( user.name.length < 3 ){
      errorMessages.name = NAME_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if( user.lastName.length < 3 ){
      errorMessages.lastName = LAST_NAME_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if( !user.email.match(EMAIL_REGEX) ){
      errorMessages.email = EMAIL_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if( user.profession.length < 3 ){
      errorMessages.profession = PROFESSION_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if( user.username.length < 3 ){
      errorMessages.username = USERNAME_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if( !user.password.match(PASSWORD_REGEX) ){
      errorMessages.password = PASSWORD_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if( user.password !== user.passwordConfirmation && user.password.match(PASSWORD_REGEX) ){
      errorMessages.passwordConfirmation = PASSWORD_CONFIRMATION_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if( user.gender !== GENDER_MALE && user.gender !== GENDER_FEMALE ){
      errorMessages.gender = GENDER_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if( !user.jmbg.match(JMBG_REGEX) ){
      errorMessages.jmbg = JMBG_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if(!user.imgPath){
      errorMessages.imgPath = IMG_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if( user.securityQuestion.length < 3 ){
      errorMessages.securityQuestion = SECURITY_QUESTION_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if( user.securityAnswer.length < 3 ){
      errorMessages.securityAnswer = SECURITY_ANSWER_REQUIRED;
      errorMessages.hasErrors = true;
    }
    return errorMessages;
  }

  validateLoginForm(user: User, errorMessages: ErrorMessages): ErrorMessages {
    if( !user.email.match(EMAIL_REGEX) ){
      errorMessages.email = EMAIL_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if(!user.password.match(PASSWORD_REGEX) ){
      errorMessages.password = PASSWORD_REQUIRED;
      errorMessages.hasErrors = true;
    }
    return errorMessages;
  }

  validateForgotPasswordForm(user: User, errorMessages: ErrorMessages): ErrorMessages {
    if( user.username.length < 3 ){
      errorMessages.username = USERNAME_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if( !user.jmbg.match(JMBG_REGEX) ){
      errorMessages.jmbg = JMBG_REQUIRED;
      errorMessages.hasErrors = true;
    }
    return errorMessages;
  }

  validateSecurityForm(user: User, errorMessages: ErrorMessages): ErrorMessages {
    if( user.securityAnswer.length < 3 ){
      errorMessages.securityAnswer = SECURITY_ANSWER_REQUIRED;
      errorMessages.hasErrors = true;
    }
    return errorMessages;
  }

  validateNewPasswordForm(user: User, errorMessages: ErrorMessages): ErrorMessages {
    if(!user.password.match(PASSWORD_REGEX) ){
      errorMessages.password = PASSWORD_REQUIRED;
      errorMessages.hasErrors = true;
    }
    return errorMessages;
  }

  validateChangePasswordForm(user: User, oldPassword: string, errorMessages: ErrorMessages): ErrorMessages {
    if( user.username.length < 3 ){
      errorMessages.username = USERNAME_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if(!oldPassword.match(PASSWORD_REGEX) ){
      errorMessages.password = PASSWORD_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if(!user.password.match(PASSWORD_REGEX) ){
      errorMessages.password = PASSWORD_REQUIRED;
      errorMessages.hasErrors = true;
    }
    if( user.password !== user.passwordConfirmation && user.password.match(PASSWORD_REGEX) ){
      errorMessages.passwordConfirmation = PASSWORD_CONFIRMATION_REQUIRED;
      errorMessages.hasErrors = true;
    }
    return errorMessages;
  }
}
