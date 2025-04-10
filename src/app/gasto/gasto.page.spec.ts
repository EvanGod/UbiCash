import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { GastoPage } from './gasto.page';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertController, LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

describe('GastoPage', () => {
  let component: GastoPage;
  let fixture: ComponentFixture<GastoPage>;
  let httpMock: HttpTestingController;
  let router: Router;
  let alertController: jasmine.SpyObj<AlertController>;
  let loadingController: jasmine.SpyObj<LoadingController>;
  let loadingElementSpy: jasmine.SpyObj<any>;
  let alertElementSpy: jasmine.SpyObj<any>;

  beforeEach(waitForAsync(() => {
    alertElementSpy = jasmine.createSpyObj('Alert', ['present']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    alertSpy.create.and.returnValue(Promise.resolve(alertElementSpy));
    
    loadingElementSpy = jasmine.createSpyObj('Loading', ['present', 'dismiss']);
    const loadingSpy = jasmine.createSpyObj('LoadingController', ['create']);
    loadingSpy.create.and.returnValue(Promise.resolve(loadingElementSpy));

    TestBed.configureTestingModule({
      declarations: [GastoPage],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'inicio', redirectTo: '' }
        ])
      ],
      providers: [
        { provide: AlertController, useValue: alertSpy },
        { provide: LoadingController, useValue: loadingSpy },
        { provide: environment, useValue: { apiUrl: 'https://backend-1002994682941.us-central1.run.app' } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(GastoPage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    alertController = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    loadingController = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;

    spyOn(sessionStorage, 'getItem').and.returnValue('mock-token');
    spyOn(router, 'navigate');
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse correctamente con valores iniciales', () => {
    expect(component).toBeTruthy();
    expect(component.gasto).toEqual({
      nombre: '',
      descripcion: '',
      costo: null,
      ubicacion: { type: 'Point', coordinates: [0, 0] }
    });
    expect(component.imagen).toBeNull();
  });

  it('debería mostrar alerta cuando faltan campos obligatorios', fakeAsync(() => {
    component.guardarGasto();
    tick();
    
    expect(alertController.create).toHaveBeenCalledWith(jasmine.objectContaining({
      header: 'Error',
      message: 'Todos los campos obligatorios deben completarse.'
    }));
    expect(alertElementSpy.present).toHaveBeenCalled();

    component.gasto.nombre = 'Comida';
    component.guardarGasto();
    tick();
    
    expect(alertController.create).toHaveBeenCalledTimes(2);
  }));

  it('debería navegar a inicio al llamar regresarInicio', () => {
    component.regresarInicio();
    expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
  });


});