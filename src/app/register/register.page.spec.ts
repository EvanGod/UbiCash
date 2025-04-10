import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterPage } from './register.page';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment.mock';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('Página de Registro', () => {
  let componente: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let httpMock: HttpTestingController;
  let router: Router;
  let alertController: AlertController;
  let loadingController: LoadingController;

  const usuarioValido = {
    username: 'testuser',
    email: 'test@example.com',
    celular: '3101234567',
    password: 'password123',
    confirmPassword: 'password123'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterPage],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'login', redirectTo: '' }
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

    fixture = TestBed.createComponent(RegisterPage);
    componente = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    alertController = TestBed.inject(AlertController);
    loadingController = TestBed.inject(LoadingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse correctamente', () => {
    expect(componente).toBeTruthy();
  });

  it('debería inicializarse con campos vacíos', () => {
    expect(componente.username).toBe('');
    expect(componente.email).toBe('');
    expect(componente.celular).toBe('');
    expect(componente.password).toBe('');
    expect(componente.confirmPassword).toBe('');
  });

  it('debería mostrar error si algún campo está vacío', () => {
    spyOn(componente, 'showAlert');
    componente.register();
    expect(componente.showAlert).toHaveBeenCalledWith('Error', 'Todos los campos son obligatorios.');
  });

  it('debería mostrar error si las contraseñas no coinciden', () => {
    spyOn(componente, 'showAlert');
    componente.username = 'testuser';
    componente.email = 'test@example.com';
    componente.celular = '3101234567';
    componente.password = 'password123';
    componente.confirmPassword = 'differentPassword';
    componente.register();
    expect(componente.showAlert).toHaveBeenCalledWith('Error', 'Las contraseñas no coinciden.');
  });

  it('debería hacer una petición HTTP POST con datos válidos', fakeAsync(() => {
    spyOn(componente, 'showAlert').and.returnValue(Promise.resolve());
    spyOn(router, 'navigate');
    const loadingSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    spyOn(loadingController, 'create').and.returnValue(Promise.resolve(loadingSpy));
  
    componente.username = usuarioValido.username;
    componente.email = usuarioValido.email;
    componente.celular = usuarioValido.celular;
    componente.password = usuarioValido.password;
    componente.confirmPassword = usuarioValido.confirmPassword;
  
    componente.register();
    tick(); 
    tick(); 
    tick(); 
    tick(); 
  
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: usuarioValido.username,
      email: usuarioValido.email,
      celular: usuarioValido.celular,
      password: usuarioValido.password
    });
  
    req.flush({ success: true });
    tick(); 
    tick(); 
    tick(); 
  }));
  
  it('debería manejar errores de validación del backend', fakeAsync(() => {
    spyOn(componente, 'showAlert').and.returnValue(Promise.resolve());
    const loadingSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    spyOn(loadingController, 'create').and.returnValue(Promise.resolve(loadingSpy));
  
    componente.username = usuarioValido.username;
    componente.email = usuarioValido.email;
    componente.celular = usuarioValido.celular;
    componente.password = usuarioValido.password;
    componente.confirmPassword = usuarioValido.confirmPassword;
  
    componente.register();
    tick(); 
    tick(); 
    tick(); 
  
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/register`);
    req.flush({
      errors: [
        { msg: 'El nombre de usuario es obligatorio' },
        { msg: 'Debe ser un email válido' },
        { msg: 'La contraseña debe tener al menos 6 caracteres' }
      ]
    }, { status: 400, statusText: 'Bad Request' });
  
    tick(); 
    tick(); 
    expect(componente.showAlert).toHaveBeenCalled();
  }));

  it('debería mostrar error cuando el backend indica que el email ya existe', fakeAsync(() => {
    spyOn(componente, 'showAlert').and.returnValue(Promise.resolve());
    const loadingSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    spyOn(loadingController, 'create').and.returnValue(Promise.resolve(loadingSpy));
  
    componente.username = 'nuevousuario';
    componente.email = 'existente@example.com';
    componente.celular = '3101234567';
    componente.password = 'password123';
    componente.confirmPassword = 'password123';
  
    componente.register();
    
    tick(); 
    tick(); 
    tick(); 
  
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/register`);
    req.flush({
      message: 'El correo electrónico ya está registrado'
    }, { 
      status: 400, 
      statusText: 'Bad Request' 
    });
  
    tick(); 
    tick(); 
  
    expect(componente.showAlert).toHaveBeenCalledWith(
      'Error', 
      'El correo electrónico ya está registrado'
    );
    expect(loadingSpy.dismiss).toHaveBeenCalled();
  }));

  it('debería mostrar el loading durante el registro', fakeAsync(() => {
    const loadingSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    spyOn(loadingController, 'create').and.returnValue(Promise.resolve(loadingSpy));
  
    componente.username = usuarioValido.username;
    componente.email = usuarioValido.email;
    componente.celular = usuarioValido.celular;
    componente.password = usuarioValido.password;
    componente.confirmPassword = usuarioValido.confirmPassword;
  
    componente.register();
    tick(); 
  
    expect(loadingController.create).toHaveBeenCalledWith({
      message: 'Registrando...',
      spinner: 'bubbles',
      backdropDismiss: false
    });
    expect(loadingSpy.present).toHaveBeenCalled();
  
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/register`);
    req.flush({});
    tick(); 
  }));

  it('debería ocultar el loading después del registro', fakeAsync(() => {
    const loadingSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    spyOn(loadingController, 'create').and.returnValue(Promise.resolve(loadingSpy));
  
    componente.username = usuarioValido.username;
    componente.email = usuarioValido.email;
    componente.celular = usuarioValido.celular;
    componente.password = usuarioValido.password;
    componente.confirmPassword = usuarioValido.confirmPassword;
  
    componente.register();
    tick(); 
    tick(); 
  
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/register`);
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