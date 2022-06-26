import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ProfileService } from '../../services/profile/profile.service';
import { firstValueFrom } from 'rxjs';
import { Component } from '@angular/core';

@Component({ selector: 'app-shared-with-me', template: '' })
class StubSharedWithMeComponent {}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;

  beforeEach(async () => {
    const profileSpy = jasmine.createSpyObj('ProfileServiceSpy', [
      'getUserName',
    ]);
    await TestBed.configureTestingModule({
      declarations: [HomeComponent, StubSharedWithMeComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ProfileService,
          useValue: profileSpy,
        },
      ],
    }).compileComponents();

    profileServiceSpy = TestBed.inject(
      ProfileService
    ) as jasmine.SpyObj<ProfileService>;

    profileServiceSpy.getUserName.and.resolveTo('testerson');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set username if exists', async () => {
    expect(component.name$).toBeDefined();
    await firstValueFrom(component.name$!).then((val) =>
      expect(val).toBe('testerson')
    );
  });
});
