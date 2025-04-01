import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-modal-mapa',
  templateUrl: './modal-mapa.component.html',
  styleUrls: ['./modal-mapa.component.scss'],
  standalone: false
})
export class ModalMapaComponent implements OnInit {
  @Input() lat: number = 0;
  @Input() lng: number = 0;
  mapUrl: SafeResourceUrl = '';

  constructor(private modalController: ModalController, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    const url = `https://maps.google.com/maps?q=${this.lat},${this.lng}&output=embed`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  async closeModal() {
    await this.modalController.dismiss();
  }
}
