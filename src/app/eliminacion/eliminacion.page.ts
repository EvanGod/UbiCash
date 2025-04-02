import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-eliminacion',
  templateUrl: './eliminacion.page.html',
  styleUrls: ['./eliminacion.page.scss'],
  standalone: false
})
export class EliminacionPage {
  email: string = '';
  password: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  async confirmarEliminacion() {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => this.eliminar()
        }
      ]
    });
    await alert.present();
  }

  async eliminar() {
    if (!this.email || !this.password) {
      this.showAlert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Eliminando cuenta...',  
      spinner: 'bubbles',  
      backdropDismiss: false  
    });

    await loading.present();

    this.http.delete(`${environment.apiUrl}/api/auth/delete`, {
      body: {
        email: this.email,
        password: this.password
      }
    }).subscribe(
      async (response: any) => {
        await loading.dismiss();
        this.router.navigate(['/login']);
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
