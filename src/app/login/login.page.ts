import { Component } from '@angular/core';
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
        localStorage.setItem('token', response.token); 
        console.log(localStorage['token']);
        this.showAlert('Login', 'Página en mantenimiento');
        //this.router.navigate(['/home']);
      },
      async (error) => {
        await loading.dismiss();
        const errorMessage = error.error?.message || 'Credenciales inválidas.';
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
