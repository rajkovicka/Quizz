import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Game5x5Component } from './game5x5.component';

describe('Game5x5Component', () => {
  let component: Game5x5Component;
  let fixture: ComponentFixture<Game5x5Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Game5x5Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Game5x5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
