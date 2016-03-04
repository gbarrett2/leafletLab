//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:
//1. Create the Leaflet map--done (in createMap())
//2. Import GeoJSON data--done (in getData())
//3. Add circle markers for point features to the map--done (in AJAX callback)
//4. Determine which attribute to visualize with proportional symbols
//5. For each feature, determine its value for the selected attribute
//6. Give each feature's circle marker a radius based on its attribute value


//Step 1:
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('map', {
        center: [25, -100],
        zoom: 2.5
    });

    //add OSM base tilelayer
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
maxZoom: 18,
attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
'Imagery © <a href="http://mapbox.com">Mapbox</a>',
id: 'mapbox.streets'
    }).addTo(map);

    //call getData function
    getData(map);
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
 $.ajax("data/rent.geojson", {
     dataType: "json",
     success: function(response){
       console.log(mydata);
         //create marker options
         var geojsonMarkerOptions = {
             radius: 8,
             fillColor: "#ff7800",
             color: "#000",
             weight: 1,
             opacity: 1,
             fillOpacity: 0.8
         };

         //create a Leaflet GeoJSON layer and add it to the map
         L.geoJson(response, {
             pointToLayer: function (feature, latlng){
                 return L.circleMarker(latlng, geojsonMarkerOptions);
             }
         }).addTo(map);
     }
 });
}
$(document).ready(createMap);

//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, map){
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    //Step 4: Determine which attribute to visualize with proportional symbols
  //   var attribute = "Rent";
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
          //Step 5: For each feature, determine its value for the selected attribute
              var attValue = Number(feature.properties.Rent_For_Dec15);

              //examine the attribute value to check that it is correct
              //console.log(feature.properties);


              //Step 6: Give each feature's circle marker a radius based on its attribute value
              geojsonMarkerOptions.radius = calcPropRadius(feature.properties.Rent_For_Dec15);

              //create circle markers of each data point
              return L.circleMarker(latlng, geojsonMarkerOptions);
          }

    }).addTo(map);
};

//Above Example 3.8...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Rent") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/rent.geojson", {
        dataType: "json",
        success: function(response){
          //create an attributes array
            var attributes = processData(response);
            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);


        }
    });
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 0.05;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//retrieve//function to convert markers to circle markers
function pointToLayer(feature, latlng,attributes){
  //Step 4: Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    console.log(attribute);
    //Determine which attribute to visualize with proportional symbols
    var attribute = "Dec 15 Rent";

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties.Rent_For_Dec15);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //Example 2.1 line 27...bind the popup to the circle marker
     layer.bindPopup(popupContent);
     //original popupContent changed to panelContent...Example 2.2 line 1

         //popup content is now just the city name
         var popupContent = feature.properties.City;

         //bind the popup to the circle marker
         layer.bindPopup(popupContent, {
             offset: new L.Point(0,-options.radius),
             closeButton: false
         });

         //build popup content string, the string includes the city and the median rent for a 1 bedroom apt. in Decemeber 2015
         var panelContent = "<p><b>City:</b> " + feature.properties.City + "</p><p><b>" + attribute + ": </b> " + feature.properties.Rent_For_Dec15 + "</p>";

     //event listeners to open popup on hover
     layer.on({
         mouseover: function(){
             this.openPopup();
         },
         mouseout: function(){
             this.closePopup();
         },
        click: function(){
            $("#panel").html(panelContent);
        }
     });
     //Example 2.5 line 1...bind the popup to the circle marker
   layer.bindPopup(popupContent, {
       offset: new L.Point(0,-options.radius)
   });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature,latlng){
          return pointToLayer(feature,latlng,attributes);
        }
    }).addTo(map);
};

//GOAL: Allow the user to sequence through the attributes and resymbolize the map
//   according to each attribute
//STEPS:
//1. Create UI affordances for sequencing
//2. Listen for user input via affordances
//3. Respond to user input by changing the selected attribute
//4. Resize proportional symbols according to each feature's value for the new attribute

//GOAL: Allow the user to sequence through the attributes and resymbolize the map
//   according to each attribute
//STEPS:
//1. Create slider widget
//2. Create skip buttons
//3. Create an array of the sequential attributes to keep track of their order
//4. Assign the current attribute based on the index of the attributes array
//5. Listen for user input via affordances
//6. For a forward step through the sequence, increment the attributes array index;
//   for a reverse step, decrement the attributes array index
//7. At either end of the sequence, return to the opposite end of the seqence on the next step
//   (wrap around)
//8. Update the slider position based on the new index
//9. Reassign the current attribute based on the new attributes array index
//10. Resize proportional symbols according to each feature's value for the new attribute


//Step 1: Create new sequence controls
function createSequenceControls(map){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    //below Example 3.4...add skip buttons
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    //Below Example 3.5...replace button content with images
    //   $('#reverse').html('<img src="data/reversearrow.png">');
    //   $('#forward').html('<img src="data/forwardarrow.png">');
    //set slider attributes
   $('.range-slider').attr({
       max: 6,
       min: 0,
       value: 0,
       step: 1
   });
   //Below Example 3.6 in createSequenceControls()
    //Step 5: click listener for buttons
    $('.skip').click(function(){
      //get the old index value
      var index = $('.range-slider').val();

      //Step 6: increment or decrement depending on button clicked
      if ($(this).attr('id') == 'forward'){
          index++;
          //Step 7: if past the last attribute, wrap around to first attribute
          index = index > 6 ? 0 : index;
      } else if ($(this).attr('id') == 'reverse'){
          index--;
          //Step 7: if past the first attribute, wrap around to last attribute
          index = index < 0 ? 6 : index;
      };

      //Step 8: update slider
      $('.range-slider').val(index);
      updatePropSymbols(map, attributes[index]);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
      updatePropSymbols(map, attributes[index]);
        //Step 6: get the new index value
        var index = $(this).val();
    });
};
//Called in both skip button and slider event listener handlers
//Step 9: pass new attribute to update symbols
//updatePropSymbols(map, attributes[index]);
//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
            //access feature properties
            //access feature properties
                 var props = layer.feature.properties;

                 //update each feature's radius based on new attribute values
                 var radius = calcPropRadius(props[attribute]);
                 layer.setRadius(radius);

                 //add city to popup content string
                 var popupContent = "<p><b>City:</b> " + props.City + "</p>";

                 //add formatted attribute to panel content string
                 var year = attribute.split("_")[1];
                 popupContent += "<p><b>Rent in " + year + ":</b> " + props[attribute] + " dollars</p>";

                 //replace the layer popup
                 layer.bindPopup(popupContent, {
                     offset: new L.Point(0,-radius)
                 });
             };
    });
};
