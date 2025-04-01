import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-gasto',
  templateUrl: './gasto.page.html',
  styleUrls: ['./gasto.page.scss'],
  standalone: false
})
export class GastoPage {
  gasto = {
    nombre: '',
    descripcion: '',
    costo: null,
    ubicacion: { type: 'Point', coordinates: [0, 0] }, // Ubicación inicial
  };
  imagen: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  // Método para guardar el gasto con imagen
  async guardarGasto() {
    if (!this.gasto.nombre || !this.gasto.costo || !this.imagen) {
      this.showAlert('Error', 'Todos los campos obligatorios deben completarse.');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Guardando gasto...' });
    await loading.present();

    try {
      // Obtener ubicación
      const position = await Geolocation.getCurrentPosition();
      this.gasto.ubicacion = {
        type: 'Point',
        coordinates: [position.coords.longitude, position.coords.latitude] // Lon, Lat
      };
      console.log(this.gasto.ubicacion)
      // Convertir la imagen base64 a Blob
      const blob = await fetch(this.imagen).then(res => res.blob());

      // Preparar FormData
      const formData = new FormData();
      formData.append('nombre', this.gasto.nombre);
      formData.append('descripcion', this.gasto.descripcion);
      formData.append('costo', String(this.gasto.costo || 0));
      formData.append('ubicacion', JSON.stringify(this.gasto.ubicacion));
      formData.append('imagen', blob, 'gasto.jpg'); // Archivo de imagen

      console.log(formData)

      const token = sessionStorage.getItem('token');
      console.log("Token obtenido:", token);
      // Enviar datos al backend
      this.http.post(`${environment.apiUrl}/api/expenses/create`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe(
        async () => {
          await loading.dismiss();
          this.showAlert('Éxito', 'Gasto registrado correctamente.');
          this.router.navigate(['/inicio']);
        },
        async (error) => {
          await loading.dismiss();
          console.error('Error en la API:', error);
          this.showAlert('Error', error.error?.message || 'Error al guardar el gasto.');
        }
      );

    } catch (error: any) {
      await loading.dismiss();
      console.error('Error al obtener la ubicación:', error);
      if (error.code === 1) {
        this.showAlert('Error', 'Permiso de ubicación denegado.');
      } else if (error.code === 2) {
        this.showAlert('Error', 'No se pudo obtener la ubicación.');
      } else {
        this.showAlert('Error', 'Error desconocido al obtener la ubicación.');
      }
    }
  }

  // Método para tomar una foto o seleccionar una imagen
  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl, 
        source: CameraSource.Photos,  
        quality: 90
      });

      if (image.dataUrl) {
        this.imagen = image.dataUrl;
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      this.showAlert('Error', 'No se pudo tomar la foto. Intenta nuevamente.');
    }
  }

  // Mostrar alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }

  regresarInicio() {
    this.router.navigate(['/inicio']); // Cambia '/inicio' por la ruta de tu pantalla principal
  }
  
}
