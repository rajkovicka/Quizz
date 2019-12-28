export const GENDER_NULL = 'null';
export const GENDER_MALE = 'male';
export const GENDER_FEMALE = 'female';

export const ROLE_PLAYER = 'player';

export class User {
    _id: string = '';
    name: string = '';
    lastName: string = '';
    email: string = '';
    profession: string = '';
    username: string = '';
    password: string = '';
    passwordConfirmation: string = '';
    gender: string = null;
    jmbg: string = '';
    imgPath: string = null;
    securityQuestion: string = '';
    securityAnswer: string = '';
    role: string = ROLE_PLAYER;
    rejected: boolean = false;
    score: number = 0;
    games: Array<Game> = null;
    verified: boolean = false;
};

export class Game {
    date: string = '';
    played: string = '';
    score: number = 0;
    anagram: number = 0;
    game5x5: number = 0;
    myNumber: number = 0;
    geography: number = 0;
    goblet: number = 0;
}