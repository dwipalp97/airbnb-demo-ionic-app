import { Component, OnDestroy, OnInit } from '@angular/core';
import { Place } from '../../place.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../../places.service';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place!: Place;
  placeId!: string | null;
  form!: FormGroup;
  isLoading = false;
  private placeSub: Subscription = new Subscription;

  constructor(
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private navCtrl: NavController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('placeId')) {     
        this.placeId = paramMap.get('placeId');
        this.isLoading = true;
        this.placeSub = this.placesService
          .getPlace(this.placeId !=null ? this.placeId : '')
          .subscribe(
            place => {
              this.place = place;
              this.form = new FormGroup({
                title: new FormControl(this.place.title, {
                  updateOn: 'blur',
                  validators: [Validators.required]
                }),
                description: new FormControl(this.place.description, {
                  updateOn: 'blur',
                  validators: [Validators.required, Validators.maxLength(800)]
                })
              });
              this.isLoading = false;
            },
            error => {
              this.alertCtrl
                .create({
                  header: 'An error occurred!',
                  message: 'Place could not be fetched. Please try again later.',
                  buttons: [
                    {
                      text: 'Okay',
                      handler: () => {
                        this.router.navigate(['/places/tabs/offers']);
                      }
                    }
                  ]
                })
                .then((alertEl: { present: () => void; }) => {
                  alertEl.present();
                });
            }
          );
        return;
      }else{
        this.navCtrl.navigateBack('/places/tabs/offers');
      }
    });
  }

  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Updating place...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.placesService
          .updatePlace(
            this.place.id,
            this.form.value.title,
            this.form.value.description
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
      });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
