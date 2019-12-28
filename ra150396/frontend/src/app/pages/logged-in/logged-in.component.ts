import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logged-in',
  templateUrl: './logged-in.component.html',
  styleUrls: ['./logged-in.component.less']
})
export class LoggedInComponent implements OnInit {

  role: string = '';
  userId: string = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userId = this.auth.getUserId();
    if(this.userId === null){
      this.router.navigate(['/home']);
    }
    this.role = this.auth.getUserRole();
  }

}
