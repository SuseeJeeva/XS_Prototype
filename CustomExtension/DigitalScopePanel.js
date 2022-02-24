"use strict";

const fs = require("fs");
const vscode = require("vscode");
const nodeHtmlToImage = require("node-html-to-image");
const { getServers, getDigitalWaveformGraphData } = require("./GlobalState");
const graphDirectory = __dirname + "/digitalgraphdata/";

const noOfChannels = 512;

var selfWebView = undefined;

clearGraphDirectory();

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
exports.DigitalScopePanel = void 0;

var DigitalScopePanel = /** @class */ (function () {
  function DigitalScopePanel(panel, extensionUri) {
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

  DigitalScopePanel.createOrShow = function (extensionUri) {
    var column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
    // If we already have a panel, show it.
    if (DigitalScopePanel.currentPanel) {
      DigitalScopePanel.currentPanel._panel.reveal(column);
      DigitalScopePanel.currentPanel._update();
      return;
    }

    // Otherwise, create a new panel.
    var panel = vscode.window.createWebviewPanel(DigitalScopePanel.viewType, "Digital Scope Tool", column || vscode.ViewColumn.One, {
      // Enable javascript in the webview
      enableScripts: true,
      // And restrict the webview to only loading content from our extension's `media` directory.
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media"), vscode.Uri.joinPath(extensionUri, "out/compiled")],
    });
    DigitalScopePanel.currentPanel = new DigitalScopePanel(panel, extensionUri);
  };

  DigitalScopePanel.kill = function () {
    var _a;
    (_a = DigitalScopePanel.currentPanel) === null || _a === void 0 ? void 0 : _a.dispose();
    DigitalScopePanel.currentPanel = undefined;
  };

  DigitalScopePanel.revive = function (panel, extensionUri) {
    DigitalScopePanel.currentPanel = new DigitalScopePanel(panel, extensionUri);
  };

  DigitalScopePanel.prototype.dispose = function () {
    DigitalScopePanel.currentPanel = undefined;
    // Clean up our resources
    this._panel.dispose();
    while (this._disposables.length) {
      var x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  };

  DigitalScopePanel.prototype._update = function () {
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
                case "syncData":
                  let digitalWaveformGraphData = getDigitalWaveformGraphData();
                  selfWebView.postMessage({
                    command: "syncData",
                    allChannels: digitalWaveformGraphData.getAllChannels(),
                    dataPoints: digitalWaveformGraphData.graphData,
                    scrollCounter: digitalWaveformGraphData.scrollCounter,
                    maxScrollCounter: Math.max(digitalWaveformGraphData.getActiveChannels().length - digitalWaveformGraphData.channelsPerView, 0),
                    cursorMode: digitalWaveformGraphData.cursorMode,
                    annotations: digitalWaveformGraphData.annotations,
                    cursors: digitalWaveformGraphData.cursors,
                  });
                  break;
                case "execute":
                  clearGraphDirectory();
                  execute();
                  break;
                case "updateScrollCounter":
                  getDigitalWaveformGraphData().scrollCounter = data.value;
                  fetchData();
                  break;
                case "updateChannelActive":
                  getDigitalWaveformGraphData().updateChannelActive(data.index, data.value);
                  fetchData();
                case "cursorModeChanged":
                  updateCursorMode(data.value);
                  break;
                case "annotationsUpdated":
                  updateAnnotations(data.value);
                  break;
                case "cursorsUpdated":
                  updateCursors(data.value);
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

  DigitalScopePanel.prototype._getHtmlForWebview = function (webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "digitalscope", "index.js"));
    const resetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
    const vscodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "digitalscope", "index.css"));
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
                  <div class="main-container" id="maincontainer">
                    <div class="function-buttons">
                      <button onclick="execute()" class="button-1">Fetch Graph Data</button>
                      <button onclick="scrollDown()" class="button-1">Scroll Down</button>
                      <button onclick="scrollUp()" class="button-1">Scroll Up</button>
                    </div>
                    <div class="graph-container">
                      <div id="graph"></div>
                      <div class="graph-controls">
                        <div class="channel-container-wrapper">
                          <div class="channel-container-header">Channel Configuration</div>
                          <div class="channel-container" id="channelcontainer"></div>
                        </div>
                        <div class="cursor-container-wrapper">
                          <div class="channel-container-header">Cursor Configuration</div>
                          <div class="cursor-container">
                            <select name="cursorType" id="cursorType">
                              <option value="Disabled" selected="selected">Disabled</option>
                              <option value="Vertical">Vertical</option>
                              <option value="Horizontal">Horizontal</option>
                            </select>
                          </div>
                        </div>
                        <div class="scale-container"></div>
                      </div>
                    </div>
                  </div>
                </body>
                <script src="${scriptUri}"></script>
                </html>
        `;
  };

  DigitalScopePanel.viewType = "DigitalScopePanel";
  return DigitalScopePanel;
})();

(function SubscribeDigitalWaveformGraph() {
  getServers()
    .filter((x) => x.isActive)
    .forEach((server) => {
      server.subscription.digitalWaveformSubscription = server.service.pubsubService.SubscribeDigitalWaveformTopic({
        ClientName: "Digital Waveform Client",
      });
      server.subscription.digitalWaveformSubscription.on("data", (data) => {
        //console.timeEnd("Time taken to receive data");
        //console.log(data.Data.length);
        //console.time("Time taken to receive data");
        let dataBasedOnChannels = data.Data.split("\r\n");
        appendDataToFile(dataBasedOnChannels);
        appendGraphData(dataBasedOnChannels);
        updateGraph();
      });
    });
})();

async function fetchData() {
  let digitalWaveformGraphData = getDigitalWaveformGraphData();
  let activeChannels = digitalWaveformGraphData.getActiveChannelsBasedOnScrollCounter();
  if (activeChannels.length === 0) {
    updateGraphData([]);
  } else {
    let graphData = await fetchActiveChannelsInfo(activeChannels);
    updateGraphData(graphData);
  }
}

function updateGraph() {
  var digitalWaveformGraphData = getDigitalWaveformGraphData();
  selfWebView.postMessage({ command: "updateGraph", dataPoints: digitalWaveformGraphData.graphData, maxScrollCounter: Math.max(digitalWaveformGraphData.getActiveChannels().length - digitalWaveformGraphData.channelsPerView, 0), allChannels: digitalWaveformGraphData.getAllChannels() });
}

function appendGraphData(data) {
  getDigitalWaveformGraphData().appendGraphData(data);
  updateGraph();
}

function updateGraphData(data) {
  getDigitalWaveformGraphData().updateGraphData(data);
  updateGraph();
}

function resetGraphData() {
  getDigitalWaveformGraphData().resetGraphData();
}

function updateCursorMode(data) {
  getDigitalWaveformGraphData().cursorMode = data;
}

function updateCursors(data) {
  getDigitalWaveformGraphData().cursors = data;
}

function updateAnnotations(data) {
  getDigitalWaveformGraphData().annotations = data;
}

function appendDataToFile(data) {
  for (let i = 0; i < noOfChannels; i++) {
    fs.appendFile(
      `${graphDirectory}${i}.txt`,
      data[i],
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
  }
}

function execute() {
  resetGraphData();
  getServers()
    .filter((x) => x.isActive)
    .forEach((server) => {
      //console.time("Time taken to receive data");
      server.service.testMethodService.ExecuteTestMethodForDigitalWaveformGraph({}, (err) => {
        console.log("Receiving gRPC Response from ExecuteTestMethodForDigitalWaveformGraph");
        if (err) {
          console.log(err);
        } else {
          vscode.window.showInformationMessage("Test Method Executed Successfully...");
        }
      });
    });
}

function clearGraphDirectory() {
  if (fs.existsSync(graphDirectory)) {
    fs.rmdirSync(graphDirectory, { recursive: true });
  }
  fs.mkdirSync(graphDirectory);
}

function fetchActiveChannelsInfo(activeChannels) {
  return new Promise((resolve) => {
    let graphData = [];
    let counter = 0;
    activeChannels.forEach(async (channel, index) => {
      let actualFileName = `${graphDirectory}${channel.index}.txt`;
      fs.readFile(actualFileName, "utf8", (err, data) => {
        counter++;
        if (err) {
          console.log(err);
          graphData[index] = "";
        } else {
          graphData[index] = data;
        }
        if (counter === activeChannels.length) {
          return resolve(graphData);
        }
      });
    });
  });
}
exports.DigitalScopePanel = DigitalScopePanel;
