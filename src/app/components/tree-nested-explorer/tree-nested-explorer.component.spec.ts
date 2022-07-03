import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTreeHarness } from '@angular/material/tree/testing';
import { TreeNestedExplorerComponent } from './tree-nested-explorer.component';
import { FolderDataSource, Node } from './folder-data-source.class';
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
import { LinkShareService } from 'src/app/services/link-share/link-share.service';
import { FileEncryptionService } from 'src/app/services/encryption/file-encryption/file-encryption.service';
import { SolidPermissionService } from 'src/app/services/solid-permission/solid-permission.service';
import { FolderShareComponent } from '../dialogs/folder-share/folder-share.component';

describe('TreeNestedExplorerComponent', () => {
  let component: TreeNestedExplorerComponent;
  let fixture: ComponentFixture<TreeNestedExplorerComponent>;
  let fileHandlerServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;
  let fileEncryptionServiceSpy: jasmine.SpyObj<FileEncryptionService>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let linkShareSpy: jasmine.SpyObj<LinkShareService>;

  const getSampleNode = (
    url = 'https://example.org/test/',
    shortName = 'test'
  ) => new Node(url, shortName, 1, true, true);

  beforeEach(async () => {
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'error',
    ]);
    const fileHandlerSpy = jasmine.createSpyObj('SolidFileHandlerSpy', [
      'getContainerContent',
      'isContainer',
      'deleteFolder',
      'deleteFile',
      'isHiddenFile',
    ]);
    const fileEncryptionSpy = jasmine.createSpyObj('SolidEncryptionSpy', [
      'isCryptoDirectory',
      'getDefaultCryptoDirectoryUrl',
    ]);
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const profileServiceSpyObj = jasmine.createSpyObj('ProfileServiceSpy', [
      'getPodUrl',
    ]);
    const linkShareServiceSpy = jasmine.createSpyObj('LinkShareSpy', [
      'createReadOnlyFolderLink',
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
          provide: SolidPermissionService,
          useValue: {
            hasWritePermissions: async () => {
              return Promise.resolve(true);
            },
          },
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
        { provide: LinkShareService, useValue: linkShareServiceSpy },
        { provide: FileEncryptionService, useValue: fileEncryptionSpy },
      ],
    }).compileComponents();

    // eslint-disable-next-line unused-imports/no-unused-vars
    notificationSpy = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
    fileHandlerServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;
    fileEncryptionServiceSpy = TestBed.inject(
      FileEncryptionService
    ) as jasmine.SpyObj<FileEncryptionService>;
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    // eslint-disable-next-line unused-imports/no-unused-vars
    profileServiceSpy = TestBed.inject(
      ProfileService
    ) as jasmine.SpyObj<ProfileService>;
    // eslint-disable-next-line unused-imports/no-unused-vars
    linkShareSpy = TestBed.inject(
      LinkShareService
    ) as jasmine.SpyObj<LinkShareService>;

    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    // onInit calls this with the url param specified above, which is a crypto directory
    fileEncryptionServiceSpy.isCryptoDirectory.and.returnValue(true);

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
    fileHandlerServiceSpy.isContainer.and.callFake((url) => url.endsWith('/'));

    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);

    const tree = await loader.getHarness(MatTreeHarness);
    const nodes = await tree.getNodes();
    expect(nodes.length).toEqual(2);
    expect(await nodes[1].getText()).toBe('root1');
    await nodes[1].expand();

    expect((await tree.getNodes()).length).toBe(3);
  });

  it('tree does not load hidden files', async () => {
    fileHandlerServiceSpy.getContainerContent.and.returnValues(
      Promise.resolve(['example.url.com/solidcryptpad/root1/']),
      Promise.resolve(['example.url.com/solidcryptpad/root1/child.file'])
    );

    // for some reason if this is set to true the elements are not added
    fileHandlerServiceSpy.isContainer.and.returnValue(false);

    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);

    const tree = await loader.getHarness(MatTreeHarness);
    const nodes = await tree.getNodes();
    expect(nodes.length).toEqual(2);

    fileHandlerServiceSpy.isContainer.and.returnValue(true);

    await nodes[1].expand();

    expect((await tree.getNodes()).length).toBe(2);
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

  it('isExpandable returns true if node is expandable', () => {
    const node = new Node('https://example.org/test/', 'test', 1, true, true);

    expect(component.isExpandable(node)).toBeTrue();
  });

  it('createFolder opens correct dialog', async () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of('ret') } as any);
    component.dataSource = jasmine.createSpyObj('dataSource', [
      'reloadNode',
    ]) as jasmine.SpyObj<FolderDataSource>;

    await component.createFolder(new Node('', '', 0, true));

    expect(dialogSpy.open).toHaveBeenCalledOnceWith(
      FolderCreateComponent,
      jasmine.anything()
    );
  });

  it('createFile opens correct dialog', async () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of('ret') } as any);

    component.createFile(new Node('', '', 0, true));

    expect(dialogSpy.open).toHaveBeenCalledOnceWith(
      FileCreateComponent,
      jasmine.anything()
    );
  });

  it('opens upload dialog when calling upload', async () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of('ret') } as any);
    component.dataSource = jasmine.createSpyObj('dataSource', [
      'reloadNode',
    ]) as jasmine.SpyObj<FolderDataSource>;

    const node = new Node(
      'https://example.org/solidcryptpad/test/',
      'test',
      1,
      true,
      false
    );

    await component.upload(node);

    expect(dialogSpy.open).toHaveBeenCalledWith(FileUploadComponent, {
      data: {
        folder: {
          url: 'https://example.org/solidcryptpad/test/',
        },
      },
    });
  });

  it('deleteFolder deletes folder and reloads parent node if success', async () => {
    const node = getSampleNode();

    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);

    fileHandlerServiceSpy.deleteFolder.and.resolveTo();
    component['dataSource'] = jasmine.createSpyObj('dataSource', [
      'reloadNode',
      'getParent',
    ]);

    await component.deleteFolder(node);

    expect(fileHandlerServiceSpy.deleteFolder).toHaveBeenCalledWith(node.link);
    expect(component['dataSource'].getParent).toHaveBeenCalledWith(node);
  });

  it('deleteFile deletes file and reloads parent node', async () => {
    const node = getSampleNode();

    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);

    fileHandlerServiceSpy.deleteFile.and.resolveTo();
    component['dataSource'] = jasmine.createSpyObj('dataSource', [
      'reloadNode',
      'getParent',
    ]);

    await component.deleteFile(node);

    expect(fileHandlerServiceSpy.deleteFile).toHaveBeenCalledWith(node.link);
    expect(component['dataSource'].getParent).toHaveBeenCalledWith(node);
  });

  it('shareFolder opens FolderShare dialog', async () => {
    const node = getSampleNode();

    await component.shareFolder(node);

    expect(dialogSpy.open).toHaveBeenCalledWith(FolderShareComponent, {
      data: {
        folderUrl: node.link,
      },
    });
  });
});
