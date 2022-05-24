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

describe('TreeNestedExplorerComponent', () => {
  let component: TreeNestedExplorerComponent;
  let fixture: ComponentFixture<TreeNestedExplorerComponent>;
  let fileHandlerServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const fileHandlerSpy = jasmine.createSpyObj('SolidFileHandlerSpy', [
      'getContainerContent',
      'isContainer',
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
              url: 'example.url.com/',
            }),
          },
        },
        {
          provide: MatDialog,
          useValue: matDialogSpy,
        },
      ],
    }).compileComponents();

    fileHandlerServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    // eslint-disable-next-line unused-imports/no-unused-vars
    profileServiceSpy = TestBed.inject(
      ProfileService
    ) as jasmine.SpyObj<ProfileService>;

    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    fixture = TestBed.createComponent(TreeNestedExplorerComponent);

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('tree loads root components correctly', async () => {
    fileHandlerServiceSpy.getContainerContent.and.returnValue(
      Promise.resolve(['example.url.com/test0', 'example.url.com/test1/'])
    );
    fileHandlerServiceSpy.isContainer.and.returnValue(false);

    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);

    expect(fileHandlerServiceSpy.getContainerContent).toHaveBeenCalledWith(
      'example.url.com/'
    );

    const tree = await loader.getHarness(MatTreeHarness);

    const root_nodes = await tree.getNodes();
    expect(root_nodes.length).toBe(2);
  });

  it('tree loads elements correctly when opening directory', async () => {
    fileHandlerServiceSpy.getContainerContent.and.returnValue(
      Promise.resolve(['example.url.com/root0', 'example.url.com/root1/'])
    );

    // for some reason if this is set to true the elements are not added
    fileHandlerServiceSpy.isContainer.and.returnValue(true);

    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);

    // add two elements

    fileHandlerServiceSpy.getContainerContent.and.returnValue(
      Promise.resolve([
        'example.url.com/root1/test0',
        'example.url.com/root1/test1',
        'example.url.com/root1/test2',
      ])
    );

    const tree = await loader.getHarness(MatTreeHarness);
    const nodes = await tree.getNodes();
    expect(nodes.length).toEqual(2);
    await nodes[1].expand();

    expect((await tree.getNodes()).length).toBe(5);
  });

  it('tree closes elements correctly', async () => {
    fileHandlerServiceSpy.getContainerContent.and.returnValue(
      Promise.resolve(['example.url.com/root0', 'example.url.com/root1/'])
    );
    fileHandlerServiceSpy.isContainer.and.returnValue(true);

    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);

    // add two elements

    fileHandlerServiceSpy.getContainerContent.and.returnValue(
      Promise.resolve([
        'example.url.com/root1/test0',
        'example.url.com/root1/test1',
        'example.url.com/root1/test2',
      ])
    );

    const tree = await loader.getHarness(MatTreeHarness);
    const nodes = await tree.getNodes();
    await nodes[1].expand();
    expect((await tree.getNodes()).length).toBe(5);

    await nodes[1].collapse();
    expect((await tree.getNodes()).length).toBe(2);
  });

  it('create_folder opens correct dialog', async () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of('ret') } as any);

    component.create_folder(new Node('', '', 0, true));

    expect(dialogSpy.open).toHaveBeenCalledOnceWith(
      FolderCreateComponent,
      jasmine.anything()
    );
  });

  it('create_file opens correct dialog', async () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of('ret') } as any);

    component.create_file(new Node('', '', 0, true));

    expect(dialogSpy.open).toHaveBeenCalledOnceWith(
      FileCreateComponent,
      jasmine.anything()
    );
  });
  it('opens upload dialog when calling upload', async () => {
    const node = new Node('https://example.org/test/', 'test', 1, true, false);

    component.upload(node);

    expect(dialogSpy.open).toHaveBeenCalledWith(FileUploadComponent, {
      data: {
        folder: {
          url: 'https://example.org/test/',
        },
      },
    });
  });
});
