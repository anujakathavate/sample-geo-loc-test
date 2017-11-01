import { Component } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
	lat = 0;
	lng = 0;

	// 12.905458, 77.5206685
	// 12.915623, 77.528147
	startLat = 12.905458;
	startLng = 77.522854;
	// startLat = 0;
	// startLng = 0;
	distance = 0;
	limit = 100;

	locationEbanled = false;
	coords = {};

	constructor(public geolocation: Geolocation, 
		private locationAccuracy: LocationAccuracy,
		private diagnostic: Diagnostic
	) {
		this.getAndWatchLocation();
	}

	getAndWatchLocation() {
		this.geolocation.getCurrentPosition().then((resp) => {
			console.log(resp);
			this.lat = resp.coords.latitude;
			this.lng = resp.coords.longitude;
			this.coords = resp.coords;
			// this.startLat = resp.coords.latitude;
 			// this.startLng = resp.coords.longitude;
		}).catch((error) => {
			console.log('Error getting location', error);
		});

		let watch = this.geolocation.watchPosition();		
		watch.subscribe((data) => {
			console.log(data);
			this.lat = data.coords.latitude;
			this.lng = data.coords.longitude;

			this.diagnostic.isLocationEnabled().then((location: boolean) => {				
				this.locationEbanled = location;
			});

			this.coords = data.coords;	
			this.distance = this.calculateDistance(this.startLat, this.lat, this.startLng, this.lng);
		});
	}

	enableLocactionAccuracy() {
		this.locationAccuracy.canRequest().then((canRequest: boolean) => {			
			if(canRequest) {
				// the accuracy option will be ignored by iOS
				this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
					() => {
						this.locationEbanled = true;
						this.getAndWatchLocation()
					},
					error => console.log('Error requesting location permissions', error)
				);
			}
		});
	}

	calculateDistance(lat1, lat2, long1, long2) {
		let p = 0.017453292519943295; // Math.PI / 180
		let c = Math.cos;
		let a = 0.5 - c((lat1 - lat2) * p) / 2 + c(lat2 * p) * c((lat1) * p) * (1 - c(((long1- long2) * p))) / 2;
		let dis = (12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
		return dis * 1000;
	}
}
