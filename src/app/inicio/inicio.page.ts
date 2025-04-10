import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { ModalMapaComponent } from '../modal-mapa/modal-mapa.component'; 

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false
})
export class InicioPage implements OnInit {
  gastos: any[] = [];  
  userId: string | null = null;  

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController 
  ) {}

  ngOnInit() {
    this.verificarUsuario();
  }

  async ionViewWillEnter() {  
    await this.verificarUsuario();
  }

  async verificarUsuario() {
    const token = sessionStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const decodedToken = this.parseJwt(token);
    if (!decodedToken || !decodedToken.id) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.userId !== decodedToken.id) {
      this.userId = decodedToken.id;
      this.gastos = [];  
      this.cdr.detectChanges();  
      await this.obtenerGastos();
    }
  }

  async obtenerGastos() {
    const loading = await this.loadingController.create({
      message: 'Cargando gastos...',
      spinner: 'bubbles',
    });

    await loading.present();

    const token = sessionStorage.getItem('token');

    this.http.get(`${environment.apiUrl}/api/expenses/list`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(
      async (response: any) => {
        this.gastos = response || [];  
        this.cdr.detectChanges();  
        await loading.dismiss();
      },
      async (error) => {
        this.gastos = [];  
        await loading.dismiss();
        await this.mostrarAlerta('Error', 'No se pudieron cargar los gastos.');
      }
    );
  }

  async confirmarEliminarGasto(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar este gasto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => this.eliminarGasto(id) 
        }
      ]
    });

    await alert.present();
  }

  async eliminarGasto(id: string) {
    const loading = await this.loadingController.create({
      message: 'Eliminando gasto...',
      spinner: 'crescent',
    });

    await loading.present();

    const token = sessionStorage.getItem('token');

    this.http.delete(`${environment.apiUrl}/api/expenses/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(
      async () => {
        this.gastos = this.gastos.filter(gasto => gasto._id !== id);  
        this.cdr.detectChanges();  
        await loading.dismiss();
        await this.mostrarAlerta('Éxito', 'El gasto ha sido eliminado.');
      },
      async () => {
        await loading.dismiss();
        await this.mostrarAlerta('Error', 'No se pudo eliminar el gasto.');
      }
    );
  }

  parseJwt(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));  
    } catch (e) {
      return null;
    }
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  agregarGasto() {
    this.router.navigate(['/gasto']); 
  }

  cerrarSesion() {
    sessionStorage.clear();
    this.userId = null; 
    this.gastos = [];  
    this.cdr.detectChanges();  
    console.log('Sesión cerrada y sessionStorage destruido');
    this.router.navigate(['/login']);
  }

  async verEnMapa(lat: number, lng: number) {
    const modal = await this.modalController.create({
      component: ModalMapaComponent,
      componentProps: { lat, lng } // Pasar las coordenadas como propiedades
    });
    return await modal.present();
  }
  async handleRefresh(event: any) {
    await this.obtenerGastos();
    event.target.complete(); 
  }
}
