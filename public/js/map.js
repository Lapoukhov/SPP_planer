function updateCoordinates(lat, lng) {
	document.getElementById('lat').value = lat;
	document.getElementById('lng').value = lng;
}

function initMap() {
	var map, marker;
	var myLatlng = {lat: 55.7507, lng: 37.6177};
	
	document.getElementById('lat').value = myLatlng.lat;
	document.getElementById('lng').value = myLatlng.lng;

	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 4,
		center: myLatlng
	});

	marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		draggable:true
	});

	marker.addListener('dragend', function(e) {
		var position = marker.getPosition();
		console.log('lat:', position.lat(), 'lng:', position.lng());
		updateCoordinates(position.lat(), position.lng())
	});

	map.addListener('click', function(e) {
		marker.setPosition(e.latLng);
		console.log('lat:', e.latLng.lat(), 'lng:', e.latLng.lng());
		updateCoordinates(e.latLng.lat(), e.latLng.lng())
	});
}