"use strict";

const fs = require("fs");
const vscode = require("vscode");
const { getServers, getBitMapToolGraphData } = require("./GlobalState");
const graphDirectory = __dirname + "/graphdata/";
let graphFileCounter = 1;
let isMainGraphRenderInProgress = false;
var selfWebView = undefined;

if (fs.existsSync(graphDirectory)) {
  fs.rmdirSync(graphDirectory, { recursive: true });
  fs.mkdirSync(graphDirectory);
}

var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };

var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (((f = 1), y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)) return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };

Object.defineProperty(exports, "__esModule", { value: true });
exports.BitMapToolPanel = void 0;

var BitMapToolPanel = /** @class */ (function () {
  function BitMapToolPanel(panel, extensionUri) {
    var _this = this;
    this._disposables = [];
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._update();
    this._panel.onDidDispose(
      function () {
        return _this.dispose();
      },
      null,
      this._disposables
    );
  }

  BitMapToolPanel.createOrShow = function (extensionUri) {
    var column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
    // If we already have a panel, show it.
    if (BitMapToolPanel.currentPanel) {
      BitMapToolPanel.currentPanel._panel.reveal(column);
      BitMapToolPanel.currentPanel._update();
      return;
    }

    // Otherwise, create a new panel.
    var panel = vscode.window.createWebviewPanel(BitMapToolPanel.viewType, "BitMap Tool", column || vscode.ViewColumn.One, {
      // Enable javascript in the webview
      enableScripts: true,
      // And restrict the webview to only loading content from our extension's `media` directory.
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media"), vscode.Uri.joinPath(extensionUri, "out/compiled")],
    });
    BitMapToolPanel.currentPanel = new BitMapToolPanel(panel, extensionUri);
  };

  BitMapToolPanel.kill = function () {
    var _a;
    (_a = BitMapToolPanel.currentPanel) === null || _a === void 0 ? void 0 : _a.dispose();
    BitMapToolPanel.currentPanel = undefined;
  };

  BitMapToolPanel.revive = function (panel, extensionUri) {
    BitMapToolPanel.currentPanel = new BitMapToolPanel(panel, extensionUri);
  };

  BitMapToolPanel.prototype.dispose = function () {
    BitMapToolPanel.currentPanel = undefined;
    // Clean up our resources
    this._panel.dispose();
    while (this._disposables.length) {
      var x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  };

  BitMapToolPanel.prototype._update = function () {
    return __awaiter(this, void 0, void 0, function () {
      var webview;
      var _this = this;
      return __generator(this, function (_a) {
        webview = this._panel.webview;
        selfWebView = webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
        webview.onDidReceiveMessage(function (data) {
          return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
              switch (data.command) {
                case "execute":
                  execute();
                  break;
                case "exportGraphData":
                  exportGraphData();
                  break;
                case "syncData":
                  let bitMapToolGraphData = getBitMapToolGraphData();
                  selfWebView.postMessage({
                    command: "syncData",
                    mainGraphRowPoints: bitMapToolGraphData.mainGraphRowPoints,
                    mainGraphColumnPoints: bitMapToolGraphData.mainGraphColumnPoints,
                    mainGraphDataPoints: bitMapToolGraphData.mainGraphDataPoints,
                    cursorGraphRowPoints: bitMapToolGraphData.cursorGraphRowPoints,
                    cursorGraphColumnPoints: bitMapToolGraphData.cursorGraphColumnPoints,
                    cursorGraphDataPoints: bitMapToolGraphData.cursorGraphDataPoints,
                  });
                  break;
                case "loadMainGraphData":
                  loadMainGraphData(data.x, data.y);
                  break;
              }
              return [2 /*return*/];
            });
          });
        });
        return [2 /*return*/];
      });
    });
  };

  BitMapToolPanel.prototype._getHtmlForWebview = function (webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "bitmaptool", "index.js"));
    const resetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
    const vscodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "bitmaptool", "index.css"));
    const plotlyUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "plotly", "plotly.js"));
    return `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="${resetUri}" rel="stylesheet">
                    <link href="${vscodeUri}" rel="stylesheet">
                    <link href="${styleUri}" rel="stylesheet">
                    <script src="${plotlyUri}"></script>
                </head>
                <body>
                  <div class="function-buttons">
                    <button onclick="execute()" class="button-1">Fetch Graph Data</button>
                    <button onclick="openConfiguration()" class="button-1">Export Graph Data</button>
                  </div>
                  <div class="graph-container">
                    <div id="main-graph"></div>
                    <div id="cursor-graph"></div>
                    <div id="download-graph"></div>
                  </div>
                  <img id="jpg-export"></img>
                  <div class="export-configuration hide" id="exportconfiguration">
                    <div class="header">
                      <div class="label pad-6-4 bold">
                        Export Configuration
                      </div>
                      <button class="button-2" onclick="closeConfiguration()">X</button>
                    </div>
                    <div class="export-source-configuration">
                      <div class="label pad-6-4 bold">
                        Source Configuration
                      </div>
                      <div class="export-source-configuration-controls">
                        <div class="control-container">
                          <div class="label pad-6-4">
                            X
                          </div>
                          <input type="number" min="1" value="${getBitMapToolGraphData().exportGraphData.source.x}">
                        </div>
                        <div class="control-container">
                          <div class="label pad-6-4">
                            Y
                          </div>
                          <input type="number" min="1" value="${getBitMapToolGraphData().exportGraphData.source.y}">
                        </div>
                        <div class="control-container">
                          <div class="label pad-6-4">
                            Width
                          </div>
                          <input type="number" min="1" value="${getBitMapToolGraphData().exportGraphData.width}">
                        </div>
                        <div class="control-container">
                          <div class="label pad-6-4">
                            Height
                          </div>
                          <input type="number" min="1" value="${getBitMapToolGraphData().exportGraphData.height}">
                        </div>
                      </div>
                    </div>
                    <div class="export-target-configuration">
                      <div class="label pad-6-4 bold">
                        Target Configuration
                      </div>
                      <div class="function-buttons">
                        <button onclick="addTargetConfiguration()" class="button-1">Add</button>
                        <button onclick="deleteTargetConfiguration()" class="button-1">Delete</button>
                      </div>
                      <div class="target-configurations">
                        <div class="export-target-configuration-controls">
                          <div class="control-container">
                            <div class="label pad-6-4">
                              X
                            </div>
                            <input type="number" min="1" value="${getBitMapToolGraphData().exportGraphData.target[0].x}">
                          </div>
                          <div class="control-container">
                            <div class="label pad-6-4">
                              Y
                            </div>
                            <input type="number" min="1" value="${getBitMapToolGraphData().exportGraphData.target[0].y}">
                          </div>
                        </div>
                        <div class="export-target-configuration-controls">
                          <div class="control-container">
                            <div class="label pad-6-4">
                              X
                            </div>
                            <input type="number" min="1" value="${getBitMapToolGraphData().exportGraphData.target[1].x}">
                          </div>
                          <div class="control-container">
                            <div class="label pad-6-4">
                              Y
                            </div>
                            <input type="number" min="1" value="${getBitMapToolGraphData().exportGraphData.target[1].y}">
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="function-buttons">
                      <button onclick="onExportClick()" class="button-1">Export</button>
                    </div>
                  </div>
                </body>
                <script src="${scriptUri}"></script>
                </html>
        `;
  };

  BitMapToolPanel.viewType = "BitMapToolPanel";
  return BitMapToolPanel;
})();

function execute() {
  getServers()
    .filter((x) => x.isActive)
    .forEach((server) => {
      console.time("Time taken to receive data");
      server.service.testMethodService.ExecuteTestMethodForBitmapToolGraph({}, (err) => {
        console.log("Receiving gRPC Response from ExecuteTestMethodForBitmapToolGraph");
        if (err) {
          console.log(err);
        } else {
          vscode.window.showInformationMessage("Test Method Executed Successfully...");
        }
      });
    });
}

function exportGraphData() {
  getBitMapToolGraphData().updateExportGraphData();
  selfWebView.postMessage({ command: "exportGraphData", rowPoints: getBitMapToolGraphData().exportGraphRowPoints, columnPoints: getBitMapToolGraphData().exportGraphColumnPoints, dataPoints: getBitMapToolGraphData().exportGraphDataPoints });
}

function loadMainGraphData(x, y) {
  if (isMainGraphRenderInProgress) {
    return;
  }
  isMainGraphRenderInProgress = true;
  var bitMapToolGraphData = getBitMapToolGraphData();
  var cursorGraphRowRange = bitMapToolGraphData.cursorGraphRowRange;
  var cursorGraphColumnRange = bitMapToolGraphData.cursorGraphColumnRange;
  var cursorGraphRowSamples = bitMapToolGraphData.cursorGraphRowSamples;
  var cursorGraphColumnSamples = bitMapToolGraphData.cursorGraphColumnSamples;
  var columnValue = Math.ceil(x / (cursorGraphColumnRange / cursorGraphColumnSamples));
  var rowValue = Math.ceil(y / (cursorGraphRowRange / cursorGraphRowSamples));
  var fileName = (rowValue - 1) * cursorGraphColumnSamples + columnValue;

  var actualFileName = `${graphDirectory}${fileName}.txt`;

  if (fs.existsSync(actualFileName)) {
    fs.readFile(actualFileName, "utf8", (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      updateMainGraphDataWithString(data);
      plotMainGraphWithStringData(data);
      isMainGraphRenderInProgress = false;
    });
  } else {
    isMainGraphRenderInProgress = false;
  }
}

function updateMainGraphDataWithString(stringData) {
  let rowLines = stringData.split("\n");
  let mainGraphData = [];
  rowLines.forEach((row, index) => {
    if (row.trim() === "") {
      return;
    }
    mainGraphData[index] = row.split(",").map(Number);
  });
  getBitMapToolGraphData().updateMainGraphData(mainGraphData);
}

function plotMainGraph() {
  selfWebView.postMessage({ command: "plotMainGraph", mainGraphDataPoints: getBitMapToolGraphData().mainGraphDataPoints });
}

function plotMainGraphWithStringData(data) {
  selfWebView.postMessage({ command: "plotMainGraphWithStringData", mainGraphDataPointsInString: data });
}

function plotCursorGraph() {
  selfWebView.postMessage({ command: "plotCursorGraph", cursorGraphDataPoints: getBitMapToolGraphData().cursorGraphDataPoints });
}

(function subscribeBitMapToolGraph() {
  let isFirstSample = true;
  getServers()
    .filter((x) => x.isActive)
    .forEach((server) => {
      server.subscription.bitmaptoolSubscription = server.service.pubsubService.SubscribeBitmapToolTopic({
        ClientName: "BitMapTool",
      });
      server.subscription.bitmaptoolSubscription.on("data", (data) => {
        // console.timeEnd("Time taken to receive data");
        // console.log("Total Samples Received - " + ++totolSamplesReceived);
        // console.time("Time taken to receive data");
        // return;
        let receivedData = getDataInArrayFormat(data.Data);
        let receivedDataInStringFormat = data.Data;
        try {
          updateCursorGraphPattern(receivedData);
          if (isFirstSample) {
            isFirstSample = false;
            getBitMapToolGraphData().updateMainGraphData(receivedData);
            plotMainGraphWithStringData(receivedDataInStringFormat);
          }
          fs.appendFile(
            `${graphDirectory}${graphFileCounter++}.txt`,
            receivedDataInStringFormat,
            {
              flags: "a",
            },
            (err) => {
              if (err) {
                console.error(err);
                return;
              }
            }
          );
        } catch (e) {
          debugger;
        }
      });
    });
})();

function getDataInArrayFormat(data) {
  let formattedData = [];
  let rowData = data.split("\n");
  rowData.forEach((row) => {
    formattedData.push(row.split(",").map(Number));
  });
  return formattedData;
}

function updateCursorGraphPattern(mainGraphPattern) {
  var cursorGraphPattern = [];
  let processedEndRowNumber = 0;
  let processedEndColumnNumber = 0;
  let mainGraphRowCount = getBitMapToolGraphData().mainGraphRowCount;
  let mainGraphColumnCount = getBitMapToolGraphData().mainGraphColumnCount;
  let cursorGraphRowScale = getBitMapToolGraphData().cursorGraphRowScale;
  let cursorGraphColumnScale = getBitMapToolGraphData().cursorGraphColumnScale;

  for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
    for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
      if (rowNumber != 0 && columnNumber != 0 && (rowNumber + 1) % cursorGraphRowScale == 0 && (columnNumber + 1) % cursorGraphColumnScale == 0) {
        scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), columnNumber - (cursorGraphColumnScale - 1), rowNumber, columnNumber);
        processedEndRowNumber = rowNumber;
        processedEndColumnNumber = columnNumber;
      }
    }
  }

  if (processedEndRowNumber < mainGraphRowCount - 1) {
    for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
      if ((columnNumber + 1) % cursorGraphColumnScale == 0) {
        scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, columnNumber - (cursorGraphColumnScale - 1), mainGraphRowCount - 1, columnNumber);
      }
    }
  }

  if (processedEndColumnNumber < mainGraphColumnCount - 1) {
    for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
      if ((rowNumber + 1) % cursorGraphRowScale == 0) {
        scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), processedEndColumnNumber + 1, rowNumber, mainGraphColumnCount - 1);
      }
    }
  }

  if (processedEndRowNumber < mainGraphRowCount - 1 && processedEndColumnNumber < mainGraphColumnCount - 1) {
    scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, processedEndColumnNumber + 1, mainGraphRowCount - 1, mainGraphColumnCount - 1);
  }

  getBitMapToolGraphData().updateCursorGraphData(cursorGraphPattern);
  plotCursorGraph();
}

function scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, startRowNumber, startColumnNumber, endRowNumber, endColumnNumber) {
  let cursorGraphRowScale = getBitMapToolGraphData().cursorGraphRowScale;
  let cursorGraphColumnScale = getBitMapToolGraphData().cursorGraphColumnScale;
  var collectionRowNumber = Math.floor([endRowNumber / cursorGraphRowScale]);
  var collectionColumnNumber = Math.floor([endColumnNumber / cursorGraphColumnScale]);
  let count = 0;
  let sum = 0;

  for (let rowNumber = startRowNumber; rowNumber <= endRowNumber; rowNumber++) {
    for (let columnNumber = startColumnNumber; columnNumber <= endColumnNumber; columnNumber++) {
      count++;
      sum += mainGraphPattern[rowNumber][columnNumber];
    }
  }

  if (cursorGraphPattern[collectionRowNumber] === undefined) {
    cursorGraphPattern[collectionRowNumber] = [];
  }

  cursorGraphPattern[collectionRowNumber][collectionColumnNumber] = sum >= count * 0.5 ? 1 : 0;
}

exports.BitMapToolPanel = BitMapToolPanel;
