import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEditorComponent } from './text-editor.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';

describe('TextEditorComponent', () => {
  let component: TextEditorComponent;
  let fixture: ComponentFixture<TextEditorComponent>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let fileServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;

  beforeEach(async () => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationService',
      ['getWebId']
    );
    const profileServiceSpyObj = jasmine.createSpyObj('ProfileServiceSpy', [
      'getPodUrls',
    ]);
    const fileServiceSpyObj = jasmine.createSpyObj(
      'SolidFileHandlerServiceSpy',
      ['writeAndEncryptFile', 'readAndDecryptFile']
    );

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatDialogModule],
      declarations: [TextEditorComponent],
      providers: [
        {
          provide: ProfileService,
          useValue: profileServiceSpyObj,
        },
        {
          provide: SolidFileHandlerService,
          useValue: fileServiceSpyObj,
        },
        {
          provide: SolidAuthenticationService,
          useValue: authenticationSpy,
        },
      ],
    }).compileComponents();

    profileServiceSpy = TestBed.inject(
      ProfileService
    ) as jasmine.SpyObj<ProfileService>;
    // eslint-disable-next-line unused-imports/no-unused-vars
    fileServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;
  });

  beforeEach(() => {
    profileServiceSpy.getPodUrls.and.resolveTo(['https://example.org/pod/']);

    fixture = TestBed.createComponent(TextEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
