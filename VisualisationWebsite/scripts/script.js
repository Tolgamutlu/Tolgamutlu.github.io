// ----------- CHANGE BUTTON STATE WHEN CLICKED -----------
const buttons = document.querySelectorAll('.category');

// Add click event listener to each button
buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (button !== save) {
      // Remove active class from all buttons except save button
      buttons.forEach(btn => {
        if (btn !== save) {
          btn.classList.remove('active');
        }
      });
      // Add active class to the clicked button
      button.classList.add('active');
    }
  });
});
// ------------------- END BUTTON STATE -------------------

 // ---- CHANGE CSV FILE DEPENDANT ON BUTTON SELLECTED ----
 // Get references to the buttons
  var button2008to2021 = document.getElementById("2008to2021");
  var button2008to2012 = document.getElementById("2008to2012");
  var button2013to2017 = document.getElementById("2013to2017");
  var button2018to2021 = document.getElementById("2018to2021");
  var save = document.getElementById("save");

  // default data set is all data from 2008 to 2021
  var file = "Data/sum_of_events_2008_2021.csv";

  // Load external data and boot
function reloadMapData() {
  d3.queue()
    .defer(d3.json, "world.json")
    .defer(d3.csv, file, function(d) {
      data.set(d.ISO3, { name: d.Name, sum: +d.Sum });
    })
    .await(ready);
  }
  // Load the initial map data
  reloadMapData();

  // Load file depending on button pressed
  button2008to2021.addEventListener("click", function() {
    file = "Data/sum_of_events_2008_2021.csv";
    reloadMapData();
  });
  button2008to2012.addEventListener("click", function() {
    file = "Data/displacements_2008_2012.csv";
    reloadMapData();
  });
  button2013to2017.addEventListener("click", function() {
    file = "Data/displacements_2013_2017.csv";
    reloadMapData();
  });
  button2018to2021.addEventListener("click", function() {
    file = "Data/displacements_2018_2021.csv";
    reloadMapData();
  });

// --- END CHANGE CSV FILE DEPENDANT ON BUTTON SELLECTED ---

// The svg
var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// tool tip setup
var div = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(150)
  .center([15, 60]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleLog()
  .domain([1, 10000000])
  .range(["#f7fbff", "#08306b"]);

function ready(error, topo) {
  let mouseOver = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .5)
      .style("stroke", "transparent");

    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black");

    var countryData = data.get(d.id) || { name: 'Country Not Recorded', sum: null };
    var name = countryData.name;
    var sum = countryData.sum;
    div.transition()
      .duration(200)
      .style("opacity", .9);
    div.html(name + "'s Total Displacements: " + sum)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
  };

  let mouseLeave = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "transparent");

    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "transparent");

    div.transition()
      .duration(200)
      .style("opacity", 0);
  };

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("fill", function(d) {
      var countryData = data.get(d.id) || { sum: null };
      var sum = countryData.sum;
      return colorScale(sum);
    })
    .style("stroke", "transparent")
    .attr("class", function(d) {
      return "Country";
    })
    .style("opacity", 1)
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave);
}


// ------------------- SAVE SVG TO PNG -------------------
// Set-up Save image button
d3.select('#save').on('click', function(){
	var svgString = getSVGString(svg.node());
	svgString2Image( svgString, 2*width, 2*height, 'png', save );

  //FileSaver.js function
	function save( dataBlob, filesize ){
		saveAs( dataBlob, 'Migration Data Visualisation.png' );
	}
});

// Setup Export Functions
function getSVGString( svgNode ) {
	svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
	var cssStyleText = getCSSStyles( svgNode );
	appendCSS( cssStyleText, svgNode );

	var serializer = new XMLSerializer();
	var svgString = serializer.serializeToString(svgNode);
	svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
	svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

	return svgString;

  // Check for CSS styling
	function getCSSStyles( parentElement ) {
		var selectorTextArr = [];

		// Add Parent element Id and Classes to the list
		selectorTextArr.push( '#'+parentElement.id );
		for (var c = 0; c < parentElement.classList.length; c++)
				if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
					selectorTextArr.push( '.'+parentElement.classList[c] );

		// Add Children element Ids and Classes to the list
		var nodes = parentElement.getElementsByTagName("*");
		for (var i = 0; i < nodes.length; i++) {
			var id = nodes[i].id;
			if ( !contains('#'+id, selectorTextArr) )
				selectorTextArr.push( '#'+id );

			var classes = nodes[i].classList;
			for (var c = 0; c < classes.length; c++)
				if ( !contains('.'+classes[c], selectorTextArr) )
					selectorTextArr.push( '.'+classes[c] );
		}

		// Extract CSS Rules
		var extractedCSSText = "";
		for (var i = 0; i < document.styleSheets.length; i++) {
			var s = document.styleSheets[i];
			
      // fire fox test case (needs to be here to function on firefox, could not get it to run without)
			try {
			    if(!s.cssRules) continue;
			} catch( e ) {
		    		if(e.name !== 'SecurityError') throw e;
		    		continue;
		    	}

			var cssRules = s.cssRules;
			for (var r = 0; r < cssRules.length; r++) {
				if ( contains( cssRules[r].selectorText, selectorTextArr ) )
					extractedCSSText += cssRules[r].cssText;
			}
		}
		
		return extractedCSSText;

		function contains(str,arr) {
			return arr.indexOf( str ) === -1 ? false : true;
		}

	}

	function appendCSS( cssText, element ) {
		var styleElement = document.createElement("style");
		styleElement.setAttribute("type","text/css"); 
		styleElement.innerHTML = cssText;
		var refNode = element.hasChildNodes() ? element.children[0] : null;
		element.insertBefore( styleElement, refNode );
	}
}


function svgString2Image( svgString, width, height, format, callback ) {
	var format = format ? format : 'png';

	var imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");

	canvas.width = width;
	canvas.height = height;

	var image = new Image();
	image.onload = function() {
		context.clearRect ( 0, 0, width, height );
		context.drawImage(image, 0, 0, width, height);

		canvas.toBlob( function(blob) {
			var filesize = Math.round( blob.length/1024 ) + ' KB';
			if ( callback ) callback( blob, filesize );
		});

		
	};

	image.src = imgsrc;
}
// ------------------- END SAVE SVG TO PNG -------------------