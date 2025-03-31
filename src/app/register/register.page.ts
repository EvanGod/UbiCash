import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {
  username: string = '';
  email: string = '';
  celular: string = '';
  password: string = '';
  confirmPassword: string = '';  

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async register() {
    if (!this.username || !this.email || !this.celular || !this.password || !this.confirmPassword) {
      this.showAlert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showAlert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Registrando...',  
      spinner: 'bubbles',  
      backdropDismiss: false  
    });

    await loading.present();

    this.http.post(`${environment.apiUrl}/api/auth/register`, {
      username: this.username,
      email: this.email,
      celular: this.celular,
      password: this.password
    }).subscribe(
      async () => {
        await loading.dismiss();
        this.showAlert('Éxito', 'Registro exitoso. Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      async (error) => {
        await loading.dismiss();
        console.log(error);
        const errorMessage = error.error.message || 'Ocurrió un error en el registro.';
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
