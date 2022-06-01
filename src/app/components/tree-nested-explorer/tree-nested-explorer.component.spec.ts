import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTreeHarness } from '@angular/material/tree/testing';
import { TreeNestedExplorerComponent } from './tree-nested-explorer.component';
import { Node } from './folder-data-source.class';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';
import { MatTreeModule } from '@angular/material/tree';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FileCreateComponent } from '../dialogs/file-create/file-create.component';
import { FolderCreateComponent } from '../dialogs/folder-create/folder-create.component';
import { FileUploadComponent } from '../dialogs/file-upload/file-upload.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

describe('TreeNestedExplorerComponent', () => {
  let component: TreeNestedExplorerComponent;
  let fixture: ComponentFixture<TreeNestedExplorerComponent>;
  let fileHandlerServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'error',
    ]);
    const fileHandlerSpy = jasmine.createSpyObj('SolidFileHandlerSpy', [
      'getContainerContent',
      'isContainer',
      'isCryptoDirectory',
    ]);
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const profileServiceSpyObj = jasmine.createSpyObj('ProfileServiceSpy', [
      'getPodUrls',
    ]);

    const dialogHandlerSpy = jasmine.createSpyObj('MatDialog', [
      'open',
      'afterClosed',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatTreeModule,
        MatProgressBarModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        NoopAnimationsModule,
      ],
      declarations: [TreeNestedExplorerComponent],
      providers: [
        {
          provide: SolidFileHandlerService,
          useValue: fileHandlerSpy,
        },
        {
          provide: MatDialog,
          useValue: dialogHandlerSpy,
        },
        {
          provide: ProfileService,
          useValue: profileServiceSpyObj,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              url: 'example.url.com/solidcryptpad/',
            }),
          },
        },
        {
          provide: MatDialog,
          useValue: matDialogSpy,
        },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    }).compileComponents();

    // eslint-disable-next-line unused-imports/no-unused-vars
    notificationSpy = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
    fileHandlerServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    // eslint-disable-next-line unused-imports/no-unused-vars
    profileServiceSpy = TestBed.inject(
      ProfileService
    ) as jasmine.SpyObj<ProfileService>;

    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    // onInit calls this with the url param specified above, which is a crypto directory
    fileHandlerServiceSpy.isCryptoDirectory.and.returnValue(true);

    fixture = TestBed.createComponent(TreeNestedExplorerComponent);

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('tree displays root element correctly', async () => {
    fileHandlerServiceSpy.isContainer.and.returnValue(true);

    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);

    const tree = await loader.getHarness(MatTreeHarness);

    const root_nodes = await tree.getNodes();
    expect(root_nodes.length).toBe(1);
  });

  it('tree loads elements correctly when opening directory', async () => {
    fileHandlerServiceSpy.getContainerContent.and.returnValues(
      Promise.resolve(['example.url.com/solidcryptpad/root1/']),
      Promise.resolve(['example.url.com/solidcryptpad/root1/child.file'])
    );

    // for some reason if this is set to true the elements are not added
    fileHandlerServiceSpy.isContainer.and.returnValue(true);

    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);

    const tree = await loader.getHarness(MatTreeHarness);
    const nodes = await tree.getNodes();
    expect(nodes.length).toEqual(2);
    await nodes[1].expand();

    expect((await tree.getNodes()).length).toBe(3);
  });

  it('tree closes elements correctly', async () => {
    fileHandlerServiceSpy.getContainerContent.and.returnValue(
      Promise.resolve([
        'example.url.com/solidcryptpad/root0',
        'example.url.com/solidcryptpad/root1/',
      ])
    );

    // for some reason if this is set to true the elements are not added
    fileHandlerServiceSpy.isContainer.and.returnValue(true);

    const loader = TestbedHarnessEnvironment.loader(fixture);

    const tree = await loader.getHarness(MatTreeHarness);
    let nodes = await tree.getNodes();
    expect(nodes.length).toBe(3);

    await nodes[0].collapse();

    nodes = await tree.getNodes();
    expect(nodes.length).toBe(1);
  });

  it('create_folder opens correct dialog', async () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of() } as any);

    component.createFolder(new Node('', '', 0, true));

    expect(dialogSpy.open).toHaveBeenCalledOnceWith(
      FolderCreateComponent,
      jasmine.anything()
    );
  });

  it('create_file opens correct dialog', async () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of('ret') } as any);

    component.createFile(new Node('', '', 0, true));

    expect(dialogSpy.open).toHaveBeenCalledOnceWith(
      FileCreateComponent,
      jasmine.anything()
    );
  });
  it('opens upload dialog when calling upload', async () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of('ret') } as any);

    const node = new Node(
      'https://example.org/solidcryptpad/test/',
      'test',
      1,
      true,
      false
    );

    component.upload(node);

    expect(dialogSpy.open).toHaveBeenCalledWith(FileUploadComponent, {
      data: {
        folder: {
          url: 'https://example.org/solidcryptpad/test/',
        },
      },
    });
  });
});
