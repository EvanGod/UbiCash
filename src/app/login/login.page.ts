import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController  } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.verificarSesion();
  }

  verificarSesion() {
    const token = sessionStorage.getItem('token');
    if (token) {
      this.router.navigate(['/inicio']);
    }
  }

  async login() {
    if (!this.email || !this.password) {
      this.showAlert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',  
      spinner: 'bubbles',  
      backdropDismiss: false  
    });

    await loading.present();

    this.http.post(`${environment.apiUrl}/api/auth/login`, {
      email: this.email,
      password: this.password
    }).subscribe(
      async (response: any) => {
        await loading.dismiss();
        sessionStorage.setItem('token', response.token);
        console.log('Token guardado:', sessionStorage.getItem('token'));
        this.router.navigate(['/inicio']);
      },
      async (error) => {
        await loading.dismiss();
        const errorMessage = error?.error?.message || 'Error de conexión. Inténtalo de nuevo.';
        this.showAlert('Error', errorMessage);
      }
    );
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
