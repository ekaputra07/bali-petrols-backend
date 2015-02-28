// The first version of Bali Petrols DB tabels doesn't includes address field
// we use this function to loop through existing data and
// insert address info to it by using Google Geocoding API.
Parse.Cloud.define('initReverseGeocoding', function(request, response){
    // TODO: do reverse geocoding here
    response.success('success');
});


// We do reverse geocoding after object is saved into database.
Parse.Cloud.afterSave('GasStation', function(request){
    // TODO: do reverse geocoding for this object.
    var geopoint = request.object.get('point');
});
