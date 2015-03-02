var settings = require('cloud/settings.js');


// do reverse geocoding
var reverseGeocode = function(latlng, callback){
    Parse.Cloud.httpRequest({
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        params: {
            latlng: latlng,
            key: settings.GOOGLE_GEOCODING_API_KEY
        },
        success: function(httpResponse){
            callback(httpResponse.data, null);
        },
        error: function(httpResponse){
            console.log('Request failed!, status code: ' + httpResponse.status);
            callback(null, httpResponse.status);
        }
    });
};


// We do reverse geocoding after object is saved into database.
Parse.Cloud.afterSave('GasStation', function(request){
    var location = request.object;
    var geopoint = location.get('point');
    var latlng = geopoint.latitude + ',' + geopoint.longitude;

    if(location.get('address') != undefined && location.get('address') != '')
        return;

    reverseGeocode(latlng, function(resp, err){
        if(err === null){
            if(resp.status == 'OK'){

                var results = resp.results;

                // I don't want the result that are too detail since its often
                // resolving into wrong neighborhood. So I use the less detail one
                // which is usually in results index of 1 (results[1]),
                // but in case it only return 1 result we'll use it anyway(results[0]).
                var address = '';

                if(results.length >= 2)
                    address = results[1].formatted_address;
                else
                    address = results[0].formatted_address;

                // Since the app will be used only in Bali area,
                // We remove the word "Bali" and "Indonesia" from the formatted address.
                var addressParts = address.split(', ');
                var newAddressParts = [];

                for(i=0; i<addressParts.length; i++){
                    if(/Bali|bali|Indonesia|indonesia/.test(addressParts[i]) == false){
                        newAddressParts.push(addressParts[i]);
                    }
                }

                location.set('address', newAddressParts.join(', '));
                location.save();
            }else{
                console.log('Geocoding failed! response status: ' + resp.status);
            }
        }
    });
});
