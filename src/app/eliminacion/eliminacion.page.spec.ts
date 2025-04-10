import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EliminacionPage } from './eliminacion.page';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertController, LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EliminacionPage', () => {
  let component: EliminacionPage;
  let fixture: ComponentFixture<EliminacionPage>;
  let alertController: AlertController;
  let loadingController: LoadingController;
  let router: Router;

  beforeEach(waitForAsync(() => {
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    const loadingSpy = jasmine.createSpyObj('LoadingController', ['create']);

    TestBed.configureTestingModule({
      declarations: [EliminacionPage],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: AlertController, useValue: alertSpy },
        { provide: LoadingController, useValue: loadingSpy },
        { provide: environment, useValue: { apiUrl: 'https://backend-1002994682941.us-central1.run.app' } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(EliminacionPage);
    component = fixture.componentInstance;
    alertController = TestBed.inject(AlertController);
    loadingController = TestBed.inject(LoadingController);
    router = TestBed.inject(Router);
  }));

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
    expect(component.email).toEqual('');
    expect(component.password).toEqual('');
  });
});