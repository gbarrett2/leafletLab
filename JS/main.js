//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:
//1. Create the Leaflet map--done (in createMap())
//2. Import GeoJSON data--done (in getData())
//3. Add circle markers for point features to the map--done (in AJAX callback)
//4. Determine which attribute to visualize with proportional symbols
//5. For each feature, determine its value for the selected attribute
//6. Give each feature's circle marker a radius based on its attribute value

var attributes = [];
//Step 1:
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('map', {
        center: [38, -97],
        zoom: 4
    });

    //  L.geoJson(rent, {
    //      filter: function(feature, layer) {
    //        if(filter = "schools"){
    //         return feature.properties.schools;
    //       }
    //       else if(filter = "pop"){
    //         return feature.properties.pop;
    //       }
    //       else if(filter = "transportation"){
    //         return feature.properties.transportation;
    //       }
    //       else {
    //         return false;
    //       }
    //      }
    //  }).addTo(map);

     //
    //  L.geoJson(rent, {
    //      filter: function(feature, layer) {
    //         return feature.properties.pop;
    //      }
    //  }).addTo(map);


//     $('.menu-ui a').on('click', function() {
//     // For each filter link, get the 'data-filter' attribute value.
//     var filter = $(this).data('filter');
//     $(this).addClass('active').siblings().removeClass('active');
//     markers.setFilter(function(f) {
//         // If the data-filter attribute is set to "all", return
//         // all (true). Otherwise, filter on markers that have
//         // a value set to true based on the filter name.
//         return (filter === 'all') ? true : f.properties[filter] === true;
//     });
//     return false;
// });

    //add OSM base tilelayer
    var Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
}).addTo(map);
    //call getData function
    getData(map);

};


//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
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
      // var attribute = "Rent";
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
          //Step 5: For each feature, determine its value for the selected attribute
          var attValue = Number(feature.properties.Rent_For_Dec15);
          //Step 6: Give each feature's circle marker a radius based on its attribute value
          geojsonMarkerOptions.radius = calcPropRadius(feature.properties.Rent_For_Dec15);
          //create circle markers of each data point
          return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
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
            createLegend(map,attributes);
        }
    });
};

//Step 3: build an attributes array from the data
function processData(data){
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
    //console.log(attributes);
    return attributes;
};


//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 1;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    return radius;
};

//retrieve function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
  //Step 4: Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    //console.log(attribute);
    //Determine which attribute to visualize with proportional symbols
    //var attribute = "Dec 15 Rent";

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);


    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //Example 2.1 line 27...bind the popup to the circle marker
     layer.bindPopup(popupContent);
     //original popupContent changed to panelContent...Example 2.2 line 1

         //popup content is now just the city name
         var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>";


         var year = attribute.split("_")[2];
         popupContent += "<p><b>" + attribute + ": </b> " +
         feature.properties[attribute] + "</p>";


         //bind the popup to the circle marker
         layer.bindPopup(popupContent, {
             offset: new L.Point(0,-options.radius),
             closeButton: false
         });

         //build popup content string, the string includes the city and the median rent for a 1 bedroom apt. in Decemeber 2015
         //var panelContent = "<p><b>City:</b> " + feature.properties.City + "</p><p><b>" + attribute + ": </b> " +
         //feature.properties.Rent_For_Dec15 + "</p>";

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
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');
            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');
            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');

            //  $('#reverse').html('<img src="data/reversearrow.png">');
            //  $('#forward').html('<img src="data/forwardarrow.png">');

              //kill any mouse event listeners on the map
              $(container).on('mousedown dblclick', function(e){
                  L.DomEvent.stopPropagation(e);
              });

            return container;
        }
    });

    map.addControl(new SequenceControl());
   $('.range-slider').attr({
       max: 6,
       min: 0,
       value: 0,
       step: 1
   });
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
        index = $(this).val();
    });




};
//Called in both skip button and slider event listener handlers
//Step 9: pass new attribute to update symbols
//updatePropSymbols(map, attributes[index]);
//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
 if (layer.feature && layer.feature.properties[attribute]){
      //access feature properties
           var props = layer.feature.properties;
           //update each feature's radius based on new attribute values
           var radius = calcPropRadius(props[attribute]);
           layer.setRadius(radius);

           //add city to popup content string
           var popupContent = "<p><b>City:</b> " + props.City + "</p>";

           //add formatted attribute to panel content string
           var month = attribute.split("_")[2];

           popupContent += "<p><b>Rent " + month + ":</b> " + props[attribute] + " dollars</p>";

        //   "</p><p><b>" + attribute + ": </b> " + feature.properties.Rent_For_Dec15 + "</p>"

      //  "<p><b>City:</b> " + feature.properties.City + "</p><p><b>" + attribute + ": </b> " +
        //feature.properties.attribute + "</p>"
           //replace the layer popup
           layer.bindPopup(popupContent, {
               offset: new L.Point(0,-radius)
           });
    };
});
updateLegend(map, attribute);
};

//Example 2.7 line 1...function to create the legend
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function(map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')


            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            var circles = {
              max: 20,
              mean: 40,
              min: 60
            };

            //loop to add each circle and text to svg string
               for (var circle in circles){
                   //circle string
                   svg += '<circle class="legend-circle" id="' + circle + '" fill="#ff7800" fill-opacity="0.8" stroke="black" cx="40"/>';

                   //text string
                   svg += '<text id="' + circle + '-text" x="100" y="' + circles[circle] + '"></text>';
               };
          svg += "</svg>";
            //add attribute legend svg to container
            $(container).append(svg);
            return container;
        }
    });

    map.addControl(new LegendControl());
    updateLegend(map, attributes[0]);
};




//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);
            console.log(layer.feature.properties[attribute]);
            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};
//Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend

    var year = attribute.split("_")[2];
    var content = "Rent in " + year;

    //replace legend content
    $('#temporal-legend').html(content);







    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);
    //console.log(attributes[1]);
    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 70 - radius,
            r: radius
        });
        //Step 4: add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + " dollars");
    };
};

$(document).ready(createMap);
