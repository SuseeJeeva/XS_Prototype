const vscode = acquireVsCodeApi();

let mainGraphRowPoints = [];
let mainGraphColumnPoints = [];
let mainGraphDataPoints = [];

let cursorGraphRowPoints = [];
let cursorGraphColumnPoints = [];
let cursorGraphDataPoints = [];

let hasFailValuesInMainGraph = true;
let hasPassValuesInMainGraph = true;

let hasFailValuesInCursorGraph = true;
let hasPassValuesInCursorGraph = true;

let samples = 0;

function plotMainGraph() {
  function getColorScale() {
    if (hasFailValuesInMainGraph && hasPassValuesInMainGraph) {
      return [
        [0, "#FF0000"],
        [1, "#00FF00"],
      ];
    }
    if (hasFailValuesInMainGraph) {
      return [
        [0, "#FF0000"],
        [1, "#FF0000"],
      ];
    }
    return [
      [0, "#00FF00"],
      [1, "#00FF00"],
    ];
  }
  Plotly.newPlot(
    "main-graph",
    [
      {
        x: mainGraphRowPoints,
        y: mainGraphColumnPoints,
        z: mainGraphDataPoints,
        colorscale: getColorScale(),
        type: "heatmap",
        showscale: false,
        hoverinfo: "x+y",
      },
    ],
    {
      autosize: true,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: "",
      showlegend: false,
      margin: {
        l: 40,
        r: 0,
        t: 20,
        b: 40,
      },
      xaxis: {
        showgrid: false,
        zeroline: false,
        visible: true,
        ticks: "",
        ticksuffix: " ",
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        visible: true,
        ticks: "",
        ticksuffix: " ",
      },
    },
    {
      displaylogo: false,
      displayModeBar: true,
      modeBarButtons: [
        [
          {
            name: "Snapshot",
            icon: Plotly.Icons.camera,
            click: () => {
              vscode.postMessage({
                command: "postMessage",
                message: "Saving Snapshot...",
              });
              vscode.postMessage({
                command: "saveGraphData",
              });
            },
          },
        ],
        ["pan2d"],
        ["zoom2d"],
        ["zoomIn2d"],
        ["zoomOut2d"],
        ["autoScale2d"],
        ["select2d"],
      ],
    }
  ).then((gd) => {
    gd.on("plotly_selected", (eventData) => {
      vscode.postMessage({
        command: "addConfiguration",
        x: eventData.range.x,
        y: eventData.range.y,
      });
    });
  });
}

function plotCursorGraph() {
  function getColorScale() {
    if (hasFailValuesInCursorGraph && hasPassValuesInCursorGraph) {
      return [
        [0, "#FF0000"],
        [1, "#00FF00"],
      ];
    }
    if (hasFailValuesInCursorGraph) {
      return [
        [0, "#FF0000"],
        [1, "#FF0000"],
      ];
    }
    return [
      [0, "#00FF00"],
      [1, "#00FF00"],
    ];
  }
  Plotly.newPlot(
    "cursor-graph",
    [
      {
        x: cursorGraphRowPoints,
        y: cursorGraphColumnPoints,
        z: cursorGraphDataPoints,
        colorscale: getColorScale(),
        type: "heatmap",
        showscale: false,
        hoverinfo: "none",
      },
    ],
    {
      autosize: true,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: "",
      showlegend: false,
      margin: {
        l: 40,
        r: 10,
        t: 20,
        b: 40,
      },
      xaxis: {
        showgrid: false,
        zeroline: false,
        visible: false,
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        visible: false,
      },
    },
    { displayModeBar: false }
  );

  var myPlot = document.getElementById("cursor-graph");
  myPlot.on("plotly_click", function (data) {
    vscode.postMessage({
      command: "loadMainGraphData",
      x: data.points[0].x,
      y: data.points[0].y,
    });
  });

  dragLayer = myPlot.getElementsByClassName("nsewdrag")[0];

  myPlot.on("plotly_hover", function (data) {
    dragLayer.style.cursor = "pointer";
  });

  myPlot.on("plotly_unhover", function (data) {
    dragLayer.style.cursor = "";
  });

  myPlot.on("plotly_relayout", function (data) {
    console.log("relayout DATA ", data);
  });
}

function updateMainGraphDataWithString(stringData) {
  var rowLines = stringData.split("\n");
  rowLines.forEach((row, index) => {
    if (row.trim() === "") {
      return;
    }
    mainGraphDataPoints[index] = row.split(",");
  });
}

function execute() {
  vscode.postMessage({
    command: "execute",
  });
}

function onExportClick() {
  vscode.postMessage({
    command: "postMessage",
    message: "Exporting Graph Data...",
  });
  vscode.postMessage({
    command: "exportGraphData",
  });
}

function updateSamples(e) {
  vscode.postMessage({
    command: "updateSamples",
    value: e.value,
  });
}

function openImageContainer() {
  document.getElementById("maincontainer").classList.add("hide");
  document.getElementById("imagecontainer").classList.remove("hide");
}

function closeImageContainer() {
  document.getElementById("maincontainer").classList.remove("hide");
  document.getElementById("imagecontainer").classList.add("hide");
}

function loadConfiguration(data) {
  let parentContainer = document.getElementById("exportconfigcontainer");
  parentContainer.innerHTML = "";
  data.forEach((datum, index) => {
    let wrapperContainer = document.createElement("div");
    wrapperContainer.classList.add("export-configuration-controls");

    let nameComponent = document.createElement("div");
    nameComponent.classList.add("control-container");
    let nameHeader = document.createElement("div");
    nameHeader.classList.add("label");
    nameHeader.classList.add("bold");
    nameHeader.classList.add("pad-6-4");
    nameHeader.innerHTML = "Layer";
    let nameContent = document.createElement("div");
    nameContent.classList.add("label");
    nameContent.classList.add("bold");
    nameContent.classList.add("pad-6-4");
    nameContent.innerHTML = datum.name;
    nameComponent.appendChild(nameHeader);
    nameComponent.appendChild(nameContent);

    let xValueComponent = document.createElement("div");
    xValueComponent.classList.add("control-container");
    let xValueHeader = document.createElement("div");
    xValueHeader.classList.add("label");
    xValueHeader.classList.add("pad-6-4");
    xValueHeader.innerHTML = "X";
    let xValueContent = document.createElement("input");
    xValueContent.type = "number";
    xValueContent.min = "1";
    xValueContent.value = datum.x;
    xValueContent.addEventListener("change", (e) => {
      vscode.postMessage({
        command: "updateXValue",
        value: e.target.value,
        index: datum.index,
      });
    });
    xValueComponent.appendChild(xValueHeader);
    xValueComponent.appendChild(xValueContent);

    let yValueComponent = document.createElement("div");
    yValueComponent.classList.add("control-container");
    let yValueHeader = document.createElement("div");
    yValueHeader.classList.add("label");
    yValueHeader.classList.add("pad-6-4");
    yValueHeader.innerHTML = "Y";
    let yValueContent = document.createElement("input");
    yValueContent.type = "number";
    yValueContent.min = "1";
    yValueContent.value = datum.y;
    yValueContent.addEventListener("change", (e) => {
      vscode.postMessage({
        command: "updateYValue",
        value: e.target.value,
        index: datum.index,
      });
    });
    yValueComponent.appendChild(yValueHeader);
    yValueComponent.appendChild(yValueContent);

    let widthComponent = document.createElement("div");
    widthComponent.classList.add("control-container");
    let widthHeader = document.createElement("div");
    widthHeader.classList.add("label");
    widthHeader.classList.add("pad-6-4");
    widthHeader.innerHTML = "Width";
    let widthContent = document.createElement("input");
    widthContent.type = "number";
    widthContent.min = "1";
    widthContent.value = datum.width;
    widthContent.addEventListener("change", (e) => {
      vscode.postMessage({
        command: "updateWidth",
        value: e.target.value,
        index: datum.index,
      });
    });
    widthComponent.appendChild(widthHeader);
    widthComponent.appendChild(widthContent);

    let heightComponent = document.createElement("div");
    heightComponent.classList.add("control-container");
    let heightHeader = document.createElement("div");
    heightHeader.classList.add("label");
    heightHeader.classList.add("pad-6-4");
    heightHeader.innerHTML = "Height";
    let heightContent = document.createElement("input");
    heightContent.type = "number";
    heightContent.min = "1";
    heightContent.value = datum.height;
    heightContent.addEventListener("change", (e) => {
      vscode.postMessage({
        command: "updateHeight",
        value: e.target.value,
        index: datum.index,
      });
    });
    heightComponent.appendChild(heightHeader);
    heightComponent.appendChild(heightContent);

    let operationComponent = document.createElement("div");
    operationComponent.classList.add("control-container");
    let operationHeader = document.createElement("div");
    operationHeader.classList.add("label");
    operationHeader.classList.add("pad-6-4");
    operationHeader.innerHTML = "Operator";
    let operationContent = document.createElement("select");
    let option1 = document.createElement("option");
    option1.text = "And";
    operationContent.add(option1);
    let option2 = document.createElement("option");
    option2.text = "Or";
    operationContent.add(option2);
    operationContent.selectedIndex = datum.Operator === "And" ? 0 : 1;
    operationContent.addEventListener("change", (e) => {
      vscode.postMessage({
        command: "updateOperation",
        value: e.target.value,
        index: datum.index,
      });
    });
    operationComponent.appendChild(operationHeader);
    operationComponent.appendChild(operationContent);

    if (index === 0) {
      operationComponent.classList.add("visibility-hide");
    }

    let deleteComponent = document.createElement("button");
    deleteComponent.classList.add("button-2");
    deleteComponent.innerHTML = "X";
    deleteComponent.addEventListener("click", (e) => {
      vscode.postMessage({
        command: "deleteConfiguration",
        index: datum.index,
      });
      parentContainer.removeChild(wrapperContainer);
    });

    wrapperContainer.appendChild(nameComponent);
    wrapperContainer.appendChild(xValueComponent);
    wrapperContainer.appendChild(yValueComponent);
    wrapperContainer.appendChild(widthComponent);
    wrapperContainer.appendChild(heightComponent);
    wrapperContainer.appendChild(operationComponent);
    wrapperContainer.appendChild(deleteComponent);
    parentContainer.appendChild(wrapperContainer);
  });
}

function exportGraphData(rowPoints, columnPoints, dataPoints) {
  var img_jpg = document.getElementById("imageelement");
  Plotly.newPlot(
    "download-graph",
    [
      {
        x: rowPoints,
        y: columnPoints,
        z: dataPoints,
        colorscale: [
          [0, "#FF0000"],
          [1, "#00FF00"],
        ],
        type: "heatmap",
        showscale: false,
        hoverinfo: "none",
      },
    ],
    {
      autosize: true,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: "",
      showlegend: false,
      margin: {
        l: 0,
        r: 0,
        t: 0,
        b: 0,
      },
      xaxis: {
        showgrid: false,
        zeroline: false,
        visible: false,
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        visible: false,
      },
    },
    { displayModeBar: false }
  ).then((gd) => {
    vscode.postMessage({
      command: "generateSnapshot",
      htmlString: gd.innerHTML,
    });
    Plotly.toImage(gd, { height: 768, width: 1024 }).then((url) => {
      img_jpg.src = url;
      openImageContainer();
    });
  });
}

function saveGraphData(rowPoints, columnPoints, dataPoints) {
  Plotly.newPlot(
    "download-graph",
    [
      {
        x: rowPoints,
        y: columnPoints,
        z: dataPoints,
        colorscale: [
          [0, "#FF0000"],
          [1, "#00FF00"],
        ],
        type: "heatmap",
        showscale: false,
        hoverinfo: "none",
      },
    ],
    {
      autosize: true,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: "",
      showlegend: false,
      margin: {
        l: 0,
        r: 0,
        t: 0,
        b: 0,
      },
      xaxis: {
        showgrid: false,
        zeroline: false,
        visible: false,
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        visible: false,
      },
    },
    { displayModeBar: false }
  ).then((gd) => {
    vscode.postMessage({
      command: "generateSnapshot",
      htmlString: gd.innerHTML,
    });
  });
}

window.addEventListener("message", (event) => {
  switch (event.data.command) {
    case "updateMainGraphRowPoints":
      mainGraphRowPoints = event.data.mainGraphRowPoints;
      break;
    case "updateMainGraphColumnPoints":
      mainGraphColumnPoints = event.data.mainGraphColumnPoints;
      break;
    case "plotMainGraph":
      mainGraphDataPoints = event.data.mainGraphDataPoints;
      plotMainGraph();
      break;
    case "plotMainGraphWithStringData":
      hasFailValuesInMainGraph = event.data.mainGraphDataPointsInString.includes("0");
      hasPassValuesInMainGraph = event.data.mainGraphDataPointsInString.includes("1");
      updateMainGraphDataWithString(event.data.mainGraphDataPointsInString);
      plotMainGraph();
      break;
    case "updateCursorGraphRowPoints":
      cursorGraphRowPoints = event.data.cursorGraphRowPoints;
      break;
    case "updateCursorGraphColumnPoints":
      cursorGraphColumnPoints = event.data.cursorGraphColumnPoints;
      break;
    case "plotCursorGraph":
      cursorGraphDataPoints = event.data.cursorGraphDataPoints;
      let stringValue = event.data.cursorGraphDataPoints.toString();
      hasFailValuesInCursorGraph = stringValue.includes("0");
      hasPassValuesInCursorGraph = stringValue.includes("1");
      plotCursorGraph();
      break;
    case "syncData":
      mainGraphRowPoints = event.data.mainGraphRowPoints;
      mainGraphColumnPoints = event.data.mainGraphColumnPoints;
      mainGraphDataPoints = event.data.mainGraphDataPoints;
      cursorGraphRowPoints = event.data.cursorGraphRowPoints;
      cursorGraphColumnPoints = event.data.cursorGraphColumnPoints;
      cursorGraphDataPoints = event.data.cursorGraphDataPoints;
      samples = event.data.samples;
      document.getElementById("samples").value = samples;
      loadConfiguration(event.data.loadConfiguration);
      plotCursorGraph();
      plotMainGraph();
      break;
    case "exportGraphData":
      exportGraphData(event.data.rowPoints, event.data.columnPoints, event.data.dataPoints);
      break;
    case "saveGraphData":
      saveGraphData(event.data.rowPoints, event.data.columnPoints, event.data.dataPoints);
      break;
    case "loadConfiguration":
      loadConfiguration(event.data.data);
      break;
  }
});

vscode.postMessage({
  command: "syncData",
});
