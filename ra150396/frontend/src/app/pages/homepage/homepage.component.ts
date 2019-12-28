import { Component, OnInit } from '@angular/core';
import { TopHome } from '../../models/TopHome';
import { UserService } from 'src/app/services/user.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.less']
})
export class HomepageComponent implements OnInit {

  top: TopHome = new TopHome();
  error: string = '';

  constructor(private user: UserService) { }

  ngOnInit() {
    this.user.getTopHome().subscribe((res: HttpResponse<any>) => {
        if(res[0]){
          this.error = 'Error occurred while fetching top 10 players.';
        } else {
          const top = <TopHome>(<undefined>res);
          this.top = top;
        }
    })
  }

}
