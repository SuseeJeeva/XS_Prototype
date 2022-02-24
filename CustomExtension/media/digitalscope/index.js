const vscode = acquireVsCodeApi();

let scrollCounter = 0;
let minScrollCounter = 0;
let maxScrollCounter = 0;

let globalX = [];
let globalY = [];
let cursors = [];
let cursorMode = "Disabled";
let axisValAnnotations = [];
let tracesAnnotations = [];
let cursorAnnotations = [];
let annotations;
let cursorTracker;
let cursorClicked;
let attachListenersFirstTime = true;
let xAxisCursorValue;
let cursorMovementDecision;

let plotHandle = document.getElementById("graph");
let cursorSelection = document.getElementById("cursorType");

let currentActiveChannels = [];
let data = [];
let layout = {
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
    title: "Time (microsecond)",
    type: "linear",
    domain: [0, 1],
    ticksuffix: "us",
    gridcolor: "rgba(0,0,0,0)",
  },
  yaxis: {
    title: "Voltage (v)",
    showticklabels: false,
    gridcolor: "rgba(0,0,0,0)",
  },
};
let configuration = {
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
};

function execute() {
  vscode.postMessage({
    command: "execute",
  });
}

function clearCursorData() {
  layout.shapes = [];
  cursors = [];
  globalX = [];
  globalY = [];
  cursorAnnotations = [];
  cursorTracker = {};
  updateAnnotations();
  Plotly.relayout(plotHandle, layout);
  vscode.postMessage({
    command: "clearCursorData",
  });
}

function generateTraces(dataPoints) {
  dataPoints.reverse();
  data = [];
  axisValAnnotations = [];
  tracesAnnotations = [];
  let factor = 1 / dataPoints.length;
  let minValue = 0;
  let maxValue = factor;
  let margin = (maxValue - minValue) / 4;
  for (let i = 0; i < dataPoints.length; i++) {
    let yPoints = dataPoints[i].split("").map((x) => {
      return x === "0" ? minValue + margin : maxValue - margin;
    });
    let text = dataPoints[i].split("").map((x) => {
      return x === "0" ? "0" : "3.3";
    });
    let xValues = [...Array(dataPoints[i].length).keys()].map((x) => x * 0.0296);
    data.push({
      x: xValues,
      y: yPoints,
      type: "scatter",
      mode: "lines",
      marker: {
        size: 5,
      },
      text: text,
      hovertemplate: "<b>Voltage(V)</b>: %{text}V" + "<br><b>Time(us)</b>: %{x}<br>",
      line: {
        color: "green",
      },
    });
    if (dataPoints[i].length > 0) {
      axisValAnnotations.push({
        xref: "paper",
        yref: "y",
        x: 0,
        y: parseFloat(maxValue - margin),
        xanchor: "right",
        yanchor: "center",
        text: `1`,
        font: {
          family: "Arial",
          size: 10,
          color: "green",
        },
        showarrow: false,
      });
      axisValAnnotations.push({
        xref: "paper",
        yref: "y",
        x: 0,
        y: parseFloat(minValue + margin),
        xanchor: "right",
        yanchor: "center",
        text: `0`,
        font: {
          family: "Arial",
          size: 10,
          color: "green",
        },
        showarrow: false,
      });

      tracesAnnotations.push({
        xref: "x",
        yref: "y",
        x: xValues[xValues.length - 1],
        y: (maxValue - margin - (minValue + margin)) / 2 + (minValue + margin),
        xanchor: "left",
        yanchor: "center",
        text: `${currentActiveChannels[i].name}`,
        font: {
          family: "Arial",
          size: 12,
          color: "green",
        },
        showarrow: false,
      });
    }
    minValue = maxValue;
    maxValue = maxValue + factor;
  }
}

function plotGraph() {
  if (attachListenersFirstTime) {
    Plotly.newPlot("graph", data, layout, configuration).then(attachGraphListeners);
    attachListenersFirstTime = false;
  } else {
    Plotly.newPlot("graph", data, layout, configuration);
  }
}

function scrollUp() {
  let value = scrollCounter > minScrollCounter ? scrollCounter - 1 : minScrollCounter;
  if (value !== scrollCounter) {
    scrollCounter = value;
    vscode.postMessage({
      command: "updateScrollCounter",
      value: scrollCounter,
    });
  }
}

function scrollDown() {
  let value = scrollCounter < maxScrollCounter ? scrollCounter + 1 : maxScrollCounter;
  if (value !== scrollCounter) {
    scrollCounter = value;
    vscode.postMessage({
      command: "updateScrollCounter",
      value: scrollCounter,
    });
  }
}

function setMaxScrollCounter(activeChannelCount) {
  maxScrollCounter = activeChannelCount;
  if (maxScrollCounter < scrollCounter) {
    scrollCounter = maxScrollCounter;
    vscode.postMessage({
      command: "updateScrollCounter",
      value: scrollCounter,
    });
  }
}

function updateCurrentActiveChannels(channels) {
  currentActiveChannels = channels;
  currentActiveChannels.reverse();
}

function updateChannels(channels) {
  var channelContainer = document.getElementById("channelcontainer");
  channelContainer.innerHTML = "";

  let selectContainer = document.createElement("div");
  selectContainer.classList.add("selectcontainer");

  let checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = channels.find((x) => !x.isActive) ? false : true;
  checkbox.addEventListener("click", (e) => {
    vscode.postMessage({
      command: "updateChannelActive",
      value: e.target.checked,
      index: -1,
    });
  });

  selectContainer.append(checkbox);

  let label = document.createElement("div");
  label.classList.add("bold");
  label.classList.add("channel-label");
  label.innerHTML = "Select All";
  selectContainer.append(label);

  channelContainer.append(selectContainer);

  channels.forEach((channel) => {
    let selectContainer = document.createElement("div");
    selectContainer.classList.add("selectcontainer");

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = channel.isActive;
    checkbox.addEventListener("click", (e) => {
      vscode.postMessage({
        command: "updateChannelActive",
        value: e.target.checked,
        index: channel.index,
      });
    });

    selectContainer.append(checkbox);

    let label = document.createElement("div");
    label.classList.add("channel-label");
    label.innerHTML = channel.name;
    selectContainer.append(label);

    channelContainer.append(selectContainer);
  });
}

function updateTotalChannels(e) {
  vscode.postMessage({
    command: "updateTotalChannels",
    value: e.value,
  });
}

function updateTotalCycles(e) {
  vscode.postMessage({
    command: "updateTotalCycles",
    value: e.value,
  });
}

cursorSelection.onchange = function () {
  cursorMode = this.value == "Horizontal" ? this.value : this.value == "Vertical" ? this.value : "Disabled";
  layout.dragmode = cursorMode == "Disabled" ? true : false;
  vscode.postMessage({
    command: "cursorModeChanged",
    value: cursorMode,
  });
};

function updateLocals() {
  layout.dragmode = cursorMode == "Disabled" ? true : false;
  cursorSelection.value = cursorMode;
  layout.shapes = cursors;
  axisValAnnotations = annotations.axisValAnnotations;
  tracesAnnotations = annotations.tracesAnnotations;
  cursorAnnotations = annotations.cursorAnnotations;
  layout.annotations = axisValAnnotations.concat(tracesAnnotations, cursorAnnotations);
  globalX = cursorTracker.globalX;
  globalY = cursorTracker.globalY;
}

function attachGraphListeners() {
  let yClicked;
  let xClicked;
  plotHandle.addEventListener("mousedown", function (evt) {
    var bb = evt.target.getBoundingClientRect();
    var x = plotHandle._fullLayout.xaxis.p2d(evt.clientX - bb.left).toFixed();
    var y = plotHandle._fullLayout.yaxis.p2d(evt.clientY - bb.top).toFixed(2);
    if (cursorMode == "Vertical") {
      for (let i = 0; i < cursors.length; i++) {
        if (cursors[i].x0 == x || (cursors[i].x0 <= x && cursors[i].x0 >= x)) {
          if (evt.button === 2) {
            cursors.splice(i, 1);
            globalX.filter(function (el) {
              return el != x;
            });
            cursorAnnotations.splice(i, 1);
          } else {
            cursorClicked = i;
            xClicked = x;
            cursors[i].opacity = 0.3;
            cursorAnnotations[i].opacity = 0.3;
          }
          layout.shapes = cursors;
          updateAnnotations();
          Plotly.relayout(plotHandle, layout);
          break;
        }
      }
    } else if (globalY.includes(y) && cursorMode == "Horizontal") {
      for (let i = 0; i < cursors.length; i++) {
        if (cursors[i].y0 == y) {
          if (evt.button === 2) {
            cursors.splice(i, 1);
            globalY.filter(function (el) {
              return el != y;
            });
            cursorAnnotations.splice(i, 1);
          } else {
            cursorClicked = i;
            yClicked = y;
            cursors[i].opacity = 0.3;
            cursorAnnotations[i].opacity = 0.3;
          }
          layout.shapes = cursors;
          updateAnnotations();
          Plotly.relayout(plotHandle, layout);
        }
      }
    }
    updateCursorTracker();
  });

  plotHandle.addEventListener("click", function (evt) {
    if (evt.toElement.localName == "rect" && cursorMode != "Disabled") {
      if (cursorClicked < cursors.length) {
        cursors.splice(cursorClicked, 1);
        if (cursorMode == "Vertical") {
          globalX.filter(function (el) {
            return el != xClicked;
          });
        } else if (cursorMode == "Horizontal") {
          globalY.filter(function (el) {
            return el != yClicked;
          });
        }

        cursorAnnotations.splice(cursorClicked, 1);
        cursorClicked = undefined;
        xClicked = undefined;
        yClicked = undefined;
      }
      var bb = evt.target.getBoundingClientRect();
      var xCoordinate = plotHandle._fullLayout.xaxis.p2d(evt.clientX - bb.left).toFixed();
      var yCoordinate = plotHandle._fullLayout.yaxis.p2d(evt.clientY - bb.top).toFixed(2);
      if (cursorMode == "Vertical" && !globalX.includes(xCoordinate)) {
        globalX[globalX.length] = xCoordinate;
      } else if (cursorMode == "Horizontal" && !globalY.includes(yCoordinate)) {
        globalY[globalY.length] = yCoordinate;
        let factoredValue = (yCoordinate * 10) % 1;
        xAxisCursorValue = factoredValue >= 0.2 && factoredValue <= 0.8 ? (factoredValue - 0.2) * 2 * 3.3 : 0.0;
        if (xAxisCursorValue > 3.3) {
          xAxisCursorValue = 3.3;
        }
      }
      updateCursorTracker();
      drawYellowLine();
    }
  });
}

function updateCursorTracker() {
  cursorTracker = { globalX, globalY };
  vscode.postMessage({
    command: "updateCursorTracker",
    value: cursorTracker,
  });
}

function drawYellowLine() {
  if (cursorMode == "Horizontal") {
    cursors.push({
      opacity: 1,
      type: "line",
      x0: 0,
      y0: globalY[globalY.length - 1],
      x1: 1,
      xref: "paper",
      y1: globalY[globalY.length - 1],
      line: {
        color: "yellow",
        width: 1.5,
        dash: "solid",
      },
    });
    cursorAnnotations.push({
      opacity: 1,
      y: globalY[globalY.length - 1],
      xref: "paper",
      x: 0,
      text: Math.round(xAxisCursorValue * 10) / 10,
      showarrow: false,
      font: {
        size: 12,
      },
      bgcolor: "yellow",
    });
  } else {
    cursors.push({
      opacity: 1,
      type: "line",
      x0: globalX[globalX.length - 1],
      y0: 0,
      x1: globalX[globalX.length - 1],
      yref: "paper",
      y1: 1,
      line: {
        color: "yellow",
        width: 1.5,
        dash: "solid",
      },
    });
    cursorAnnotations.push({
      opacity: 1,
      x: globalX[globalX.length - 1],
      yref: "paper",
      y: 0,
      text: globalX[globalX.length - 1],
      showarrow: false,
      font: {
        size: 12,
      },
      bgcolor: "yellow",
    });
  }

  vscode.postMessage({
    command: "cursorsUpdated",
    value: cursors,
  });
  layout.shapes = cursors;
  updateAnnotations();
  Plotly.relayout(plotHandle, layout);
}

function updateAnnotations() {
  layout.annotations = [];
  layout.annotations = axisValAnnotations.concat(tracesAnnotations, cursorAnnotations);
  annotations = { axisValAnnotations, tracesAnnotations, cursorAnnotations };
  vscode.postMessage({
    command: "annotationsUpdated",
    value: annotations,
  });
}

window.addEventListener("message", (event) => {
  switch (event.data.command) {
    case "updateGraph":
      updateCurrentActiveChannels(event.data.currentActiveChannels);
      generateTraces(event.data.dataPoints);
      updateChannels(event.data.allChannels);
      setMaxScrollCounter(event.data.maxScrollCounter);
      updateAnnotations();
      plotGraph();
      break;
    case "syncData":
      updateCurrentActiveChannels(event.data.currentActiveChannels);
      generateTraces(event.data.dataPoints);
      updateChannels(event.data.allChannels);
      scrollCounter = event.data.scrollCounter;
      setMaxScrollCounter(event.data.maxScrollCounter);
      annotations = event.data.annotations;
      cursorMode = event.data.cursorMode;
      cursors = event.data.cursors;
      cursorTracker = event.data.cursorTracker;
      updateLocals();
      plotGraph();
      break;
    case "updateTotalChannels":
      updateCurrentActiveChannels(event.data.currentActiveChannels);
      updateChannels(event.data.allChannels);
      break;
  }
});

vscode.postMessage({
  command: "syncData",
});
