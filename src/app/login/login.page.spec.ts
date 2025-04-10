import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('Página de Login', () => {
  let componente: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let httpMock: HttpTestingController;
  let router: Router;
  let alertController: AlertController;
  let loadingController: LoadingController;

  const credencialesValidas = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'inicio', redirectTo: '' }
        ]),
        IonicModule.forRoot(),
        FormsModule
      ],
      providers: [
        AlertController,
        LoadingController,
        { provide: environment, useValue: { apiUrl: 'https://backend-1002994682941.us-central1.run.app' } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    componente = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    alertController = TestBed.inject(AlertController);
    loadingController = TestBed.inject(LoadingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
    httpMock.verify();
  });

  it('debería crearse correctamente', () => {
    expect(componente).toBeTruthy();
  });

  it('debería inicializarse con campos vacíos', () => {
    expect(componente.email).toBe('');
    expect(componente.password).toBe('');
  });

  it('debería mostrar error si algún campo está vacío', () => {
    spyOn(componente, 'showAlert');
    componente.login();
    expect(componente.showAlert).toHaveBeenCalledWith('Error', 'Todos los campos son obligatorios.');
  });

  it('debería hacer una petición HTTP POST con datos válidos', fakeAsync(() => {
    spyOn(componente, 'showAlert');
    spyOn(router, 'navigate');
    const loadingSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    spyOn(loadingController, 'create').and.returnValue(Promise.resolve(loadingSpy));
  
    componente.email = credencialesValidas.email;
    componente.password = credencialesValidas.password;
  
    componente.login();
    tick(); 
    tick(); 
    tick(); 
  
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: credencialesValidas.email,
      password: credencialesValidas.password
    });
  
    req.flush({ token: 'token-de-prueba' });
    tick(); 
    tick(); 
  
    expect(sessionStorage.getItem('token')).toBe('token-de-prueba');
    expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
  }));
  
  it('debería manejar credenciales incorrectas', fakeAsync(() => {
    spyOn(componente, 'showAlert').and.returnValue(Promise.resolve());
    const loadingSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    spyOn(loadingController, 'create').and.returnValue(Promise.resolve(loadingSpy));
  
    componente.email = credencialesValidas.email;
    componente.password = 'contrasena-incorrecta';
  
    componente.login();
    tick(); 
    tick(); 
    tick(); 
  
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
    req.flush({
      message: 'Credenciales incorrectas'
    }, { status: 401, statusText: 'Unauthorized' });
  
    tick(); 
    tick(); 
  
    expect(componente.showAlert).toHaveBeenCalledWith('Error', 'Credenciales incorrectas');
    expect(sessionStorage.getItem('token')).toBeNull();
  }));

  it('debería redirigir a inicio si ya hay sesión activa', () => {
    spyOn(router, 'navigate');
    sessionStorage.setItem('token', 'token-existente');
    
    componente.verificarSesion();
    
    expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
  });

  it('debería mostrar el loading durante el login', fakeAsync(() => {
    const loadingSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    spyOn(loadingController, 'create').and.returnValue(Promise.resolve(loadingSpy));
  
    componente.email = credencialesValidas.email;
    componente.password = credencialesValidas.password;
  
    componente.login();
    tick(); 
  
    expect(loadingController.create).toHaveBeenCalledWith({
      message: 'Iniciando sesión...',
      spinner: 'bubbles',
      backdropDismiss: false
    });
    expect(loadingSpy.present).toHaveBeenCalled();
  
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
    req.flush({});
    tick(); 
  }));

  it('debería ocultar el loading después del login', fakeAsync(() => {
    const loadingSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    spyOn(loadingController, 'create').and.returnValue(Promise.resolve(loadingSpy));
  
    componente.email = credencialesValidas.email;
    componente.password = credencialesValidas.password;
  
    componente.login();
    tick(); 
    tick(); 
  
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
    req.flush({});
    tick(); 
    tick(); 
  
    expect(loadingSpy.dismiss).toHaveBeenCalled();
  }));

  it('debería mostrar alerta con los parámetros correctos', fakeAsync(() => {
    const alertSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    spyOn(alertController, 'create').and.returnValue(Promise.resolve(alertSpy));
  
    componente.showAlert('Test Header', 'Test Message');
    tick();
  
    expect(alertController.create).toHaveBeenCalledWith({
      header: 'Test Header',
      message: 'Test Message',
      buttons: ['OK']
    });
    expect(alertSpy.present).toHaveBeenCalled();
  }));
});