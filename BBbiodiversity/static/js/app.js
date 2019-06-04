// This file builds out a metadata legend with dropdown to choose samples
// Whose data are then visualized as pie and bubble and guage buildCharts.
// app.py served in bash to index.html in Browser at http://127.0.0.1:5000/

// Database bellybutton.sqlite has all necessary data for this visualization:
// table "sample_metadata": sampleid, event, ethnicity, gender, age, wFreq, BBtype, location, etc
// table "samples": otu_id, uto_label*****, and BB_940 - BB_1601

function buildMetadata(sample) {   // Build the metadata panel
  // Use `d3.json` to fetch the metadata for a sample
  console.log("doing buildMetadata");
  d3.json(`/metadata/${sample}`).then(function(data) {
    // Use d3 to select the panel with id of `#sample-metadata`
    var metaSample = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    metaSample.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(data).forEach(function([key, value]) {
      // Construct HTML line of indexed data for appended row:
      var rowMeta = (`${key}: ${value}`); 
      // Append a cell to the row for each value pair; check if empty data.
        var cell = metaSample.append("h5");
        // Inside loop, use d3 to append new tag for each key-value in metadata.
        cell.text(rowMeta);
    });
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
  });
}

function buildCharts(sample) {
  console.log("doing buildCharts");
  // Fetch the sample data for the plots...
  d3.json(`/samples/${sample}`).then((data) => {
    // Build a Bubble Chart using the sample data

    var BBlabels = data.otu_labels;
    var BBsamples = data.sample_values;
    var BBids = data.otu_ids;
    // console.log(BBsamples, BBlabels, BBids);
    
    var trace1 = {
      x: BBids,
      y: BBsamples,
      text: BBlabels,
      mode: "markers",
      marker: {
        size: BBsamples, 
        color: BBids,
        symbol: "star"
      },
      type: "scatter"
    };
    var traceData = [trace1];
    var layout = {
      margin: {t: 0},
      hovermode: "closest",
      xaxis: {title: "OTU ID"},
      // showlegend: true,
      // height: 600,
      // width: 600,
    };

    console.log("plotting BUBBLE");
    Plotly.newPlot("bubble", traceData, layout);

    // @TODO: Build a Pie Chart
    console.log("plotting PIE");
    var pieData = [
      {
        values: BBsamples.slice(0, 10),
        labels: BBids.slice(0, 10),
        hovertext: BBlabels.slice(0, 10),
        hoverinfo: "hovertext",
        type: "pie"
      }
    ];
 
    var pieLayout = {
      margin: { t: 0, l: 0 }
    };
 
    Plotly.plot("pie", pieData, pieLayout);
    });

    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
}    

function init() {
  console.log("doing init");
    // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
 d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}


function optionChanged(newSample) {
  console.log("doing optionChanged");
  console.log(newSample);
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
};

// Initialize the dashboard
init();
