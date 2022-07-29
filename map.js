// Assign dimensions for map container
var width = 500,
	height = 500;

// Field refernce to csv column
var field = "Reg Voters"

//Number formatting
//
//Create a function that take a number, adds commas for thousands,
//and removes decimal values, e.g. 1234567.89 --> 1,234,567
//
var valueFormat = d3.format(",");

// Get and prepare the Mustache template; parsing it speeds up future uses
var template = d3.select('#template').html();
Mustache.parse(template);

// Logic to handle hover event when its firedup
var hoveron = function(d) {
	console.log('d', d, 'event', event);
	var div = document.getElementById('tooltip');
	div.style.left = event.pageX + 'px';
	div.style.top = event.pageY + 'px';

	
	//Fill yellow to highlight
	d3.select(this)
		.style("fill", "white");

	//Show the tooltip
	d3.select("#tooltip")
		.style("opacity", 1);

	//Populate name in tooltip
	d3.select("#tooltip .name")
		.text(d.properties.dist);

	//Populate value in tooltip
	d3.select("#tooltip .value")
		.text(valueFormat(d.properties.field) + "");
		//console.log(JSON.stringify(d.properties))	
		
}

var hoverout = function(d) {

	//Restore original choropleth fill
	d3.select(this)
		.style("fill", function(d) {
			var value = d.properties.field;
			if (value) {
				return color(value);
			} else {
				return "#ddd";
			}
		});

	//Hide the tooltip
	d3.select("#tooltip")
		.style("opacity", 0);

}


// Create SVG inside map container and assign dimensions
var svg = d3.select("#map").append('svg')
	.attr("width", width)
	.attr("height", height);

// Define a geographical projection
// Also, set initial zoom to show the features
var projection	= d3.geo.mercator()
	.scale(1);

// Prepare a path object and apply the projection to it 
var path = d3.geo.path()
	.projection(projection);

// We prepare an object to later have easier access to the data.
var dataById = d3.map();

//Define quantize scale to sort data values into buckets of color
//Colors by Cynthia Brewer (colorbrewer2.org), 9-class YlGnBu

var color = d3.scale.quantize()
					//.range(d3.range(9),map(function(i) { return 'q' + i + '-9';}));
				.range([    "#00ff00",
							"#00ff00",
							"#00ff00",
							"#00ff00",
							"#00ff00",
							"#00ff00",
							"#00ff00",
							"#00ff00",
							"#00ff00",
							"#00ff00",
							"#00ff00" ]);

// Load in coverage score data
d3.csv("disdata.csv", function(cdata) {
	//console.log(cdata)					
	//Set input domain for color scale
	color.domain([
		d3.min(cdata, function(d) { return +d[field]; }),
		d3.max(cdata, function(d) { return +d[field]; })

		]);
		
	var data = cdata.map(
		function(row){
			var district_id = row.District.slice(0,3)
			var district_name = row.District.slice(4)

			row.id =  district_id;
			row.District =  district_name;
			
			return row;
		}
	);
	console.log(data);
	// This maps the data of the CSV so it can be easily accessed by
    // the ID of the district, for example: dataById[2196]
    dataById = d3.nest()
      .key(function(d) { return d.id; })
      .rollup(function(d) { return d[0]; })
      .map(data);
	  //console.log(dataById);

	// Load features from GeoJSON                                                     
	d3.json('ug_districts3.geojson', function(error, json) {

		
		// Get the scale and center parameters from the features.
		var scaleCenter = calculateScaleCenter(json);

		// Apply scale, center and translate parameters.
		projection.scale(scaleCenter.scale)
				.center(scaleCenter.center)
				.translate([width/2, height/2]);

		// Merge the coverage data amd GeoJSON into a single array
		// Also loop through once for each coverage score data value

		for (var i=0; i < data.length ; i++ ) {

			// Grab district name
			var dataDistrict = data[i].District;
			//console.log(dataDistrict); 

			//Grab data value, and convert from string to float
			var dataValue = +data[i][field];
			//console.log(dataValue);

			//Find the corresponding district inside GeoJSON
			for (var j=0; j < json.features.length ; j++ ) {

				// Check the district reference in json
				var jsonDistrict = json.features[j].properties.dist;
				//console.log(jsonDistrict);

				if (dataDistrict == jsonDistrict) {

					//Copy the data value into the GeoJSON
					json.features[j].properties.field = dataValue;
					json.features[j].properties.distId =data[i]["id"];

					//Stop looking through JSON
					break;
				}
			}
		}
		
		// Add a <g> element to the SVG element and give a class to style later
		svg.append('g')
			.attr('class', 'features')			
		// Bind data and create one path per GeoJSON feature
		svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.on("mouseover", function(d) {

				// Get data value
				
				console.log('d', d, 'event', event);
	var div = document.getElementById('tooltip');
	div.style.left = event.pageX + 'px';
	div.style.top = event.pageY + 'px';

	
	//Fill yellow to highlight
	d3.select(this)
		.style("fill", "white");

	//Show the tooltip
	d3.select("#tooltip")
		.style("opacity", 1);

	//Populate name in tooltip
	d3.select("#tooltip .name")
		.text(d.properties.dist);

	//Populate value in tooltip
	d3.select("#tooltip .value")
		.text("Reg Voters: "+valueFormat(d.properties.field) + "");
		//console.log(JSON.stringify(d.properties))	
		//console.log(cdata);
		for (var i=0; i < cdata.length ; i++ ) {
			if(d.properties.dist==cdata[i]["District"]){
				d3.select("#tooltip .AMURIAT")
				.text("AMURIAT: "+valueFormat(cdata[i]["AMURIAT"]) + "");
				d3.select("#tooltip .KABULETA")
				.text("KABULETA: "+valueFormat(cdata[i]["KABULETA"]) + "");
				d3.select("#tooltip .KALEMBE")
				.text("KALEMBE: "+valueFormat(cdata[i]["KALEMBE"]) + "");
				d3.select("#tooltip .KATUMBA")
				.text("KATUMBA: "+valueFormat(cdata[i]["KATUMBA"]) + "");
				d3.select("#tooltip .KYAGULANYI")
				.text("KYAGULANYI: "+valueFormat(cdata[i]["KYAGULANYI"]) + "");
				d3.select("#tooltip .NOBERT")
				.text("NOBERT: "+valueFormat(cdata[i]["NOBERT"]) + "");
				d3.select("#tooltip .MAYAMBALA")
				.text("MAYAMBALA: "+valueFormat(cdata[i]["MAYAMBALA"]) + "");
				d3.select("#tooltip .MUNTU")
				.text("MUNTU: "+valueFormat(cdata[i]["MUNTU"]) + "");
				d3.select("#tooltip .MWESIGYE")
				.text("MWESIGYE: "+valueFormat(cdata[i]["MWESIGYE"]) + "");
				d3.select("#tooltip .TUMUKUNDE")
				.text("TUMUKUNDE: "+valueFormat(cdata[i]["TUMUKUNDE"]) + "");
				d3.select("#tooltip .YOWERI")
				.text("YOWERI: "+valueFormat(cdata[i]["YOWERI"]) + "");
				

				d3.select("#tooltip .ValidVotes")
				.text("Valid Votes: "+valueFormat(cdata[i]["ValidVotes"]) + "");
				//console.log(cdata[i]["ValidVotes"]);
				d3.select("#tooltip .InvalidVotes")
				.text("Invalid Votes: "+valueFormat(cdata[i]["InvalidVotes"]) + "");
				d3.select("#tooltip .TotalVotes")
				.text("Total Votes: "+valueFormat(cdata[i]["TotalVotes"]) + "");

			}

			// Grab district name
			var dataDistrict = cdata[i].District;
			//console.log(dataDistrict); 
		}
			})
			.on("mouseout", hoverout)
			.on('click', showDetails)
			.style("cursor", "pointer")
			.style("stroke", "#999")
			.style("fill", function(d) {

				// Get data value
				
				var value = d.properties.field;
				//console.log(value);

				if (value) {
					// If value exists ...
					return color(value);
				} else {
					// If value is undefines ...
					return "#ddd";
				}
			});

	}); // End d3.json
}); // End d3.csv

// NEW: function to dynamically calculate the scale factror and center

function calculateScaleCenter(features) {
	// Get the bounding box of the paths (in pixels) and calculate a scale factor based on box and map size
	var bbox_path = path.bounds(features),
		scale = 0.95 / Math.max(
			(bbox_path[1][0] - bbox_path[0][0]) / width,
			(bbox_path[1][1] - bbox_path[0][1]) / height
			);

	// Get the bounding box of the features (in map units) and use it to calculate the center of the features.
	var bbox_feature = d3.geo.bounds(features),
		center = [
			(bbox_feature[1][0] + bbox_feature[0][0]) / 2,
			(bbox_feature[1][1] + bbox_feature[0][1]) / 2];

	return {
		'scale':scale,
		'center':center
	};
}

// NEW: function to show details on click
function showDetails(f) {
	var id = getIdOfFeature(f); //Get the ID of the feature
	var d = dataById[id]; // Use the ID to get the data entry

	console.log(d) //testing
	var detailsHtml = Mustache.render(template, d); // Render the Mustace template with the data object

	//Hide the initial container.
	d3.select('#initial').classed('hidden', true);

	// Put the HTML output in the details container and show (unhide) it.
	d3.select('#details').html(detailsHtml);
	d3.select('#details').classed('hidden', false);
}

// NEW: Defining getIdOfFeature
function getIdOfFeature(f) {
  return f.properties.distId
}