import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ProfileService } from '../../services/profile/profile.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;

  beforeEach(async () => {
    const profileSpy = jasmine.createSpyObj('ProfileServiceSpy', [
      'getUserName',
    ]);
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
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

  it('should set username if exists', () => {
    component.name$?.subscribe((val) => {
      expect(val).toBe('testerson');
    });
  });
});
