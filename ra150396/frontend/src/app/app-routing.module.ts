import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { LoggedInComponent } from './pages/logged-in/logged-in.component';
import { AnagramComponent } from './games/anagram/anagram.component';
import { GobletComponent } from './games/goblet/goblet.component';
import { Game5x5Component } from './games/game5x5/game5x5.component';
import { MyNumberComponent } from './games/my-number/my-number.component';
import { GeographyComponent } from './games/geography/geography.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ScoreComponent } from './games/score/score.component';
import { ChangeGameComponent } from './components/change-game/change-game.component';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomepageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'signup', component: SignupPageComponent },
  { path: 'changePassword', component: ChangePasswordComponent },
  { path: 'dashboard', component: LoggedInComponent },
  { path: 'anagram', component: AnagramComponent },
  { path: 'goblet', component: GobletComponent },
  { path: 'game5x5', component: Game5x5Component },
  { path: 'myNumber', component: MyNumberComponent },
  { path: 'geography', component: GeographyComponent },
  { path: 'score', component: ScoreComponent },
  { path: 'change', component: ChangeGameComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
