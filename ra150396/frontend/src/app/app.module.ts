import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { HeaderComponent } from './components/header/header.component';
import { FormsModule } from '@angular/forms';
import { WebReqInterceptor } from './services/web-req.interceptor';
import { LoggedInComponent } from './pages/logged-in/logged-in.component';
import { SupervisorComponent } from './components/supervisor/supervisor.component';
import { PlayerComponent } from './components/player/player.component';
import { AdminComponent } from './components/admin/admin.component';
import { AnagramComponent } from './games/anagram/anagram.component';
import { GobletComponent } from './games/goblet/goblet.component';
import { Game5x5Component } from './games/game5x5/game5x5.component';
import { MyNumberComponent } from './games/my-number/my-number.component';
import { GeographyComponent } from './games/geography/geography.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ScoreComponent } from './games/score/score.component';
import { ChangeGameComponent } from './components/change-game/change-game.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    SignupPageComponent,
    HomepageComponent,
    HeaderComponent,
    LoggedInComponent,
    SupervisorComponent,
    PlayerComponent,
    AdminComponent,
    AnagramComponent,
    GobletComponent,
    Game5x5Component,
    MyNumberComponent,
    GeographyComponent,
    FooterComponent,
    ChangePasswordComponent,
    ScoreComponent,
    ChangeGameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: WebReqInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
