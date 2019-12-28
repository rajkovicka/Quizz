import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {

  isLoggedIn: boolean;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    const userId = this.authService.getUserId();
    this.isLoggedIn = userId !== null ? true : false;
  }

  onLogoutClicked(){
    this.authService.logout();
  }

}
