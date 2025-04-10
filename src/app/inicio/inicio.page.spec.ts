import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { InicioPage } from './inicio.page';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('Página de Inicio', () => {
  let component: InicioPage;
  let fixture: ComponentFixture<InicioPage>;
  let httpMock: HttpTestingController;
  let router: Router;
  let alertController: jasmine.SpyObj<AlertController>;
  let loadingController: jasmine.SpyObj<LoadingController>;
  let modalController: jasmine.SpyObj<ModalController>;

  const mockToken = 'mockToken.eyJpZCI6IjEyMzQ1Njc4OTAifQ==.mockSignature';
  const mockGastos = [
    { _id: '1', description: 'Comida', amount: 50, lat: 4.60971, lng: -74.08175 },
    { _id: '2', description: 'Transporte', amount: 30 }
  ];

  beforeEach(waitForAsync(() => {
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    const loadingSpy = jasmine.createSpyObj('LoadingController', ['create']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['create']);

    const alertElementSpy = jasmine.createSpyObj('Alert', ['present']);
    alertSpy.create.and.returnValue(Promise.resolve(alertElementSpy));

    const loadingElementSpy = jasmine.createSpyObj('Loading', ['present', 'dismiss']);
    loadingSpy.create.and.returnValue(Promise.resolve(loadingElementSpy));

    const modalElementSpy = jasmine.createSpyObj('Modal', ['present']);
    modalSpy.create.and.returnValue(Promise.resolve(modalElementSpy));

    TestBed.configureTestingModule({
      declarations: [InicioPage],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'login', redirectTo: '' },
          { path: 'gasto', redirectTo: '' }
        ])
      ],
      providers: [
        { provide: AlertController, useValue: alertSpy },
        { provide: LoadingController, useValue: loadingSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: environment, useValue: { apiUrl: 'https://backend-1002994682941.us-central1.run.app' } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(InicioPage);
    component = fixture.componentInstance;
    
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    alertController = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    loadingController = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
  }));

  afterEach(() => {
    sessionStorage.clear();
    httpMock.verify(); 
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería redirigir a login si no hay token', () => {
    spyOn(router, 'navigate');
    component.verificarUsuario();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería obtener el userId del token válido', () => {
    sessionStorage.setItem('token', mockToken);
    component.verificarUsuario();
    expect(component.userId).toBe('1234567890');
  });

  it('debería redirigir a login si el token es inválido', () => {
    spyOn(router, 'navigate');
    sessionStorage.setItem('token', 'token.invalido.token');
    component.verificarUsuario();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería cargar los gastos correctamente', fakeAsync(() => {
    sessionStorage.setItem('token', mockToken);
    
    component.obtenerGastos();
    tick();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/api/expenses/list`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    
    req.flush(mockGastos);
    tick();
    
    expect(component.gastos).toEqual(mockGastos);
  }));

  it('debería manejar errores al cargar gastos', fakeAsync(() => {
    sessionStorage.setItem('token', mockToken);
    
    component.obtenerGastos();
    tick();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/api/expenses/list`);
    req.flush(null, { status: 500, statusText: 'Server Error' });
    tick();
    
    expect(alertController.create).toHaveBeenCalled();
  }));

  it('debería eliminar un gasto correctamente', fakeAsync(() => {
    sessionStorage.setItem('token', mockToken);
    component.gastos = [...mockGastos];
    const gastoId = '1';
    
    component.eliminarGasto(gastoId);
    tick();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/api/expenses/${gastoId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    tick();
    
    expect(component.gastos.length).toBe(1);
    expect(alertController.create).toHaveBeenCalled();
  }));

  it('debería manejar errores al eliminar gasto', fakeAsync(() => {
    sessionStorage.setItem('token', mockToken);
    component.gastos = [...mockGastos];
    const gastoId = '1';
    
    component.eliminarGasto(gastoId);
    tick();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/api/expenses/${gastoId}`);
    req.flush(null, { status: 500, statusText: 'Server Error' });
    tick();
    
    expect(alertController.create).toHaveBeenCalled();
  }));

  it('debería navegar a la página de gasto al agregar', () => {
    spyOn(router, 'navigate');
    component.agregarGasto();
    expect(router.navigate).toHaveBeenCalledWith(['/gasto']);
  });

  it('debería cerrar sesión correctamente', () => {
    spyOn(router, 'navigate');
    sessionStorage.setItem('token', mockToken);
    component.gastos = [...mockGastos];
    
    component.cerrarSesion();
    
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(component.userId).toBeNull();
    expect(component.gastos.length).toBe(0);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería mostrar modal de mapa con coordenadas', async () => {
    const lat = 4.60971;
    const lng = -74.08175;
    
    await component.verEnMapa(lat, lng);
    
    expect(modalController.create).toHaveBeenCalled();
  });

  it('debería parsear correctamente el token JWT', () => {
    const token = 'header.eyJpZCI6IjEyMzQ1NiIsIm5hbWUiOiJKdWFuIFBlcmV6In0=.signature';
    const result = component.parseJwt(token);
    expect(result).toEqual({ id: '123456', name: 'Juan Perez' });
  });

  it('debería retornar null para token inválido', () => {
    const result = component.parseJwt('token.invalido');
    expect(result).toBeNull();
  });
});