import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import * as L from 'leaflet';
import {Map,tileLayer,marker} from 'leaflet';
import { PlacesService } from '../../places.service';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType } from '@capacitor/camera';
import { PlaceLocation } from '../../location.model';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss']
})
export class NewOfferPage implements OnInit {
  form!: FormGroup;
  map: any;
  newMarker:any;

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(500)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      imageUrl: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      location: new FormControl(null, { validators: [Validators.required] }),
    });
  }

  ionViewDidEnter(): void {
   //this.initMap();
  }

  initMap() {
    
    this.printCurrentPosition().then(result=>{

      if(result && result.coords){
        console.log('current location===',result);

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
          console.log("movestart",this.map.getCenter());
          this.newMarker.setLatLng([this.map.getCenter().lat,this.map.getCenter().lng])
      
      })
    
        this.map.locate({setView: true, watch: true, maxZoom: 17}).on("locationfound", (e: any)=> {
          console.log("locationfound===================", e);
          // this.newMarker = L.marker([e.latitude,e.longitude], {draggable: 
          // true}).addTo(this.map).bindPopup("You are located here!").openPopup();
         
          // this.newMarker.on("dragend", ()=> {
          //   const position = this.newMarker.getLatLng();
          //   console.log("position", position);
          //  });
        });
      }
    })
  }

  openCamera = async()=>{
    console.log("open camera click");

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri
      });
    
      // image.webPath will contain a path that can be set as an image src.
      // You can access the original file using image.path, which can be
      // passed to the Filesystem API to read the raw data of the image,
      // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
      var imageUrl = image.webPath;
    
       // Can be set to the src of an image now
      // imageElement.src = imageUrl;
      console.log("imageUrl=====", imageUrl);
      // this.form.value.imageUrl.value = imageUrl;
      console.log("this form======", this.form);
      //this.form.value.imageUrl.setValue(imageUrl);
      this.form.controls['imageUrl'].setValue(imageUrl);
  }

  printCurrentPosition  = async () => {
   this.checkPermission().then(result=>{
    console.log('result isPermissionAvailable:', result);

    if(result && result.location == 'denied' || result.coarseLocation == 'denied'){
       // await Geolocation.requestPermissions(['location', 'coorseLocation']))
        
    }
   });

    const coordinates = await Geolocation.getCurrentPosition().then(result=>{
      console.log('result position:', result);
      return result;

    }).catch(e=>{
      console.log('error position:', e);

    });

    return coordinates;
  
   // console.log('Current position:', coordinates);
  };

  onLocationPicked(location: PlaceLocation) {
    this.form.patchValue({ location: location });
  }

  checkPermission = async() => {
    console.log('check PermissionAvailable:', );
    const isPermissionAvailable = await Geolocation.checkPermissions().then(res=> res);
    console.log('check PermissionAvailable=======:', isPermissionAvailable);
    return isPermissionAvailable;
  }

  onCreateOffer() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Creating place...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.placesService
          .addPlace(
            this.form.value.title,
            this.form.value.description,
            this.form.value.imageUrl,
            +this.form.value.price,
            new Date(this.form.value.dateFrom),
            new Date(this.form.value.dateTo)
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
      });
  }
}
