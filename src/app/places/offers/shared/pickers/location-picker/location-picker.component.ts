import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import {
  ModalController,
  ActionSheetController,
  AlertController
} from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import {  Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

import { MapModalComponent } from '../../map-modal/map-modal.component';
import { PlaceLocation, Coordinates } from '../../../../location.model';
// import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { map } from 'rxjs';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss']
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;
  selectedLocationImage!: string;
  isLoading = false;

  latitude: any = 0; //latitude
  longitude: any = 0; //longitude
  address: string ='';

  // geocoder options
  nativeGeocoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5,
  };

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController, 
    private nativeGeocoder: NativeGeocoder
  ) {}

  ngOnInit() {}

  onPickLocation() {
    this.actionSheetCtrl
      .create({
        header: 'Please Choose',
        buttons: [
          {
            text: 'Auto-Locate',
            handler: () => {
              this.locateUser();
            }
          },
          {
            text: 'Pick on Map',
            handler: () => {
              this.openMap();
            }
          },
          { text: 'Cancel', role: 'cancel' }
        ]
      })
      .then(actionSheetEl => {
        actionSheetEl.present();
      });
  }

  private locateUser = async ()=>{
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }
    this.isLoading = true;
    await Geolocation.getCurrentPosition().then(geoPosition => {
      console.log("Geolocation", geoPosition);

        const coordinates: Coordinates = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude
        };
        this.createPlace(coordinates.lat, coordinates.lng);
        this.isLoading = false;
      })
      .catch(err => {
        this.isLoading = false;
        this.showErrorAlert();
      });
  }

  private showErrorAlert() {
    this.alertCtrl
      .create({
        header: 'Could not fetch location',
        message: 'Please use the map to pick a location!',
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

  private openMap() {
    this.modalCtrl.create({ component: MapModalComponent }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        const coordinates: Coordinates = {
          lat: modalData.data.lat,
          lng: modalData.data.lng
        };
        this.createPlace(coordinates.lat, coordinates.lng);
      });
      modalEl.present();
    });
  }

  private createPlace(lat: number, lng: number) {
    console.log("createPlace", lat+"====="+lng);
    const pickedLocation: PlaceLocation = {
      lat: lat,
      lng: lng,
      address: '',
      staticMapImageUrl: ''
    };
    this.isLoading = true;
    this.getAddress(lat, lng).then(()=> {
      pickedLocation.address = this.address;
      this.isLoading = false;
      this.locationPick.emit(pickedLocation);
    });
  }

  getAddress = async (lat: any, long: any) => {
    console.log("getAddress",lat+"====="+long);
    console.log("getAddress======",this.nativeGeocoder);
    console.log("getAddress=====rt=",this.nativeGeocoderOptions);

    await this.fetchAddress(lat, long)
      .then((res) => {
        this.address = this.pretifyAddress(res);
        console.log("getAddress result", res);

        return this.address;
      })
      .catch((error: any) => {
        alert('Error getting location' + JSON.stringify(error));
      });
  }
  // address
  pretifyAddress(address: any) {
    let obj = [];
    let data = '';
    for (let key in address) {
      obj.push(address[key]);
    }
    obj.reverse();
    for (let val in obj) {
      if (obj[val].length) data += obj[val] + ', ';
    }
    return address.slice(0, -2);
  }

  fetchAddress = async (lat: number, lng: number) =>  {
      return await this.http
      .get<string>(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`).pipe(
        (response) => {                           //next() callback
          console.log('response received', response)
          return response;
        },
      );
    
  }
}
