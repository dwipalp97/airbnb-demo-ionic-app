import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
  OnDestroy,
  Input
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as L from 'leaflet';
import {Map,tileLayer,marker} from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType } from '@capacitor/camera';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss']
})
export class MapModalComponent implements OnInit,  OnDestroy {
  @Input() center = { lat: -34.397, lng: 150.644 };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';
 
  map: any;
  newMarker:any;

  constructor(
    private modalCtrl: ModalController,
    private renderer: Renderer2
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.getUserCurrentLocation()
      .then(result => {

        if(result && result.coords){
          console.log('Map Modal current location===',result);
  
          const {latitude, longitude} = result.coords;
  
          this.map = new Map('map', { center: [latitude, longitude], zoom: 8, zoomControl: false});
      
          const tiles = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 18,
              minZoom: 10,
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OSM</a>'
          });
      
          tiles.addTo(this.map);
          this.newMarker = new L.Marker(this.map.getCenter()).addTo(this.map).bindPopup('Your Location.').openPopup();
      
          this.map.on('movestart',(e: any)=>{
            console.log("Map Modal movestart",this.map.getCenter());
            this.newMarker.setLatLng([this.map.getCenter().lat,this.map.getCenter().lng])
        
        })
      
          this.map.locate({setView: true, watch: true, maxZoom: 17}).on("locationfound", (e: any)=> {
            console.log("Map Modal locationfound===================", e);
            // this.newMarker = L.marker([e.latitude,e.longitude], {draggable: 
            // true}).addTo(this.map).bindPopup("You are located here!").openPopup();
           
            // this.newMarker.on("dragend", ()=> {
            //   const position = this.newMarker.getLatLng();
            //   console.log("position", position);
            //  });
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy() {
  
  }

  getUserCurrentLocation()  : Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.checkPermission().then((result)=>{
        console.log('Map Modal result isPermissionAvailable:', result);
    
        if(result && result.location == 'denied' || result.coarseLocation == 'denied'){
           // await Geolocation.requestPermissions(['location', 'coorseLocation']))
           reject('Map Modal Location Permission is not available');
        }
       });

      await Geolocation.getCurrentPosition().then(result=>{
        console.log('Map Modal result position:', result);
        resolve(result);
      }).catch(e=>{
        console.log('Map Modal error position:', e);
      });

      });
 
   // console.log('Current position:', coordinates);
  };

  checkPermission = async() => {
    console.log('Map Modal check PermissionAvailable:', );
    const isPermissionAvailable = await Geolocation.checkPermissions().then(res=> res);
    console.log('Map Modal check PermissionAvailable=======:', isPermissionAvailable);
    return isPermissionAvailable;
  }
}
