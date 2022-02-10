"use strict";

const vscode = require("vscode");
const { getServers, getDatalogData, getDatalogConfig, setDatalogData } = require('./GlobalState');
const fs = require('fs');
var lineReader = require('reverse-line-reader');

const logFileDirectory = __dirname + "/logs/";
const logFilePath = logFileDirectory + "logs.txt";

const enableFileWriteOption = false;

if (fs.existsSync(logFilePath)) {
	fs.unlinkSync(logFilePath);
}

fs.writeFile(logFilePath, '\r\n', function (err) {
	if (err) throw err;
});

var selfWebView = undefined;

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	return new (P || (P = Promise))(function (resolve, reject) {
		function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
		function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
		function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
};

var __generator = (this && this.__generator) || function (thisArg, body) {
	var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
	function verb(n) { return function (v) { return step([n, v]); }; }
	function step(op) {
		if (f) throw new TypeError("Generator is already executing.");
		while (_) try {
			if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
			if (y = 0, t) op = [op[0] & 2, t.value];
			switch (op[0]) {
				case 0: case 1: t = op; break;
				case 4: _.label++; return { value: op[1], done: false };
				case 5: _.label++; y = op[1]; op = [0]; continue;
				case 7: op = _.ops.pop(); _.trys.pop(); continue;
				default:
					if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
					if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
					if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
					if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
					if (t[2]) _.ops.pop();
					_.trys.pop(); continue;
			}
			op = body.call(thisArg, _);
		} catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
		if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	}
};

Object.defineProperty(exports, "__esModule", { value: true });
exports.DataLogPanel = void 0;

var DataLogPanel = /** @class */ (function () {

	function DataLogPanel(panel, extensionUri) {
		var _this = this;
		this._disposables = [];
		this._panel = panel;
		this._extensionUri = extensionUri;
		this._update();
		this._panel.onDidDispose(function () { return _this.dispose(); }, null, this._disposables);
	}

	DataLogPanel.createOrShow = function (extensionUri) {
		var column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;
		// If we already have a panel, show it.
		if (DataLogPanel.currentPanel) {
			DataLogPanel.currentPanel._panel.reveal(column);
			DataLogPanel.currentPanel._update();
			return;
		}

		// Otherwise, create a new panel.
		var panel = vscode.window.createWebviewPanel(DataLogPanel.viewType, "DataLog Panel", column || vscode.ViewColumn.One, {
			// Enable javascript in the webview
			enableScripts: true,
			// And restrict the webview to only loading content from our extension's `media` directory.
			localResourceRoots: [
				vscode.Uri.joinPath(extensionUri, "media"),
				vscode.Uri.joinPath(extensionUri, "out/compiled"),
			],
		});
		DataLogPanel.currentPanel = new DataLogPanel(panel, extensionUri);
	};

	DataLogPanel.kill = function () {
		var _a;
		(_a = DataLogPanel.currentPanel) === null || _a === void 0 ? void 0 : _a.dispose();
		DataLogPanel.currentPanel = undefined;
	};

	DataLogPanel.revive = function (panel, extensionUri) {
		DataLogPanel.currentPanel = new DataLogPanel(panel, extensionUri);
	};

	DataLogPanel.prototype.dispose = function () {
		DataLogPanel.currentPanel = undefined;
		// Clean up our resources
		this._panel.dispose();
		while (this._disposables.length) {
			var x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	};

	DataLogPanel.prototype._update = function () {
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
								case 'updateDatalogConfig':
									getDatalogConfig().recordsPerPage = data.newConfigData.recordsPerPage;
									getDatalogConfig().refreshRate = data.newConfigData.refreshRate;
									getDatalogConfig().currentPageNumber = data.newConfigData.currentPageNumber;
									break;
								case 'syncDatalogConfigData':
									selfWebView.postMessage({ command: 'updateDatalogConfig', datalogConfig: getDatalogConfig() });
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

	DataLogPanel.prototype._getHtmlForWebview = function (webview) {
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "datalog", "index.js")
		);
		const resetUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
		);
		const vscodeUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
		);
		const styleUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "datalog", "index.css")
		);
		return `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="${resetUri}" rel="stylesheet">
                    <link href="${vscodeUri}" rel="stylesheet">
                    <link href="${styleUri}" rel="stylesheet">
                </head>
                <body>
									<div id="config">
										<div><h4 id="records">Records per page: </h4><input id="recordsInput" type="number" min="0" value="${getDatalogConfig().recordsPerPage}"></div>
										<div><h4 id="current">Current page: </h4><input id="currentPageInput" type="number" min="0" value="${getDatalogConfig().currentPageNumber}"></div>
										<div><h4 id="max">Max page number: ${getDatalogConfig().maxPageNumber} </h4></div>
										<div><h4 id="refresh">Refresh rate: </h4><input id="refreshInput" type="number" min="0" value="${getDatalogConfig().refreshRate}"></div>
									</div>
									<div class="tableComponent2" id="tableComponent2">
										<table id="table2">
											<tr class="table-head">
												<td>Server Name</td>
												<td>Site</td>
												<td>Measured Value</td>
												<td>Test Method Name</td>
											</tr>
										</table>
									</div>
                </body>
                <script src="${scriptUri}"></script>
                </html>
        `;
	};

	DataLogPanel.viewType = "DataLogPanel";
	return DataLogPanel;
}());

function subscribeDataLogTopic() {
	getServers().filter(x => x.isActive).forEach((server) => {
		server.subscription.datalogSubscription = server.service.pubsubService.SubscribeDataLogTopic({
			ClientName: "DataLog"
		});
		server.subscription.datalogSubscription.on("data", (data) => {
			data.keyValuePair.push({
				"Key": "Server Name",
				"Value": server.name
			})
			getDatalogData().push(data);

			if (!enableFileWriteOption) {
				setDatalogData(getDatalogData().reverse().splice(0, 2000).reverse());
			}
		})
	});
};

function refreshDatalogData() {
	var datalogConfig = getDatalogConfig();
	if (enableFileWriteOption) {
		try {
			if (getDatalogData().length > 0) {
				var newDataAsString = getNewDataAsString();
				updateLogFileWithNewData(newDataAsString, datalogConfig, updateDatalogPanelFromFileData);
			}
			else {
				updateDatalogPanelFromFileData(datalogConfig);
			}
		} catch (e) {
			console.log("Error on Datalog operation " + e);
			setTimeout(refreshDatalogData, datalogConfig.refreshRate);
		}
	} else {
		updateDatalogPanelFromInMemoryData(datalogConfig);
	}
}

function getNewDataAsString() {
	var newData = getDatalogData().splice(0, 1000000);
	var newDataAsString = "";
	newData.forEach(data => {
		data.keyValuePair.forEach(keyValuePair => {
			newDataAsString += keyValuePair.Value + "|";
		})
		newDataAsString += "\r\n";
	})
	return newDataAsString;
}

function updateLogFileWithNewData(newDataAsString, datalogConfig, callbackFn) {
	console.log("Writing to a file");
	fs.appendFile(logFilePath, newDataAsString, {
		flags: 'a'
	}, (err) => {
		console.log("Written to a file");
		callbackFn(datalogConfig);
	});
}

function updateDatalogPanelFromFileData(datalogConfig) {
	if (selfWebView == null) {
		setTimeout(refreshDatalogData, getDatalogConfig().refreshRate);
		return;
	}

	try {
		var datalogData = [];
		var startIndex = ((datalogConfig.currentPageNumber - 1) * datalogConfig.recordsPerPage) + 1;
		var stopIndex = startIndex + datalogConfig.recordsPerPage - 1;
		var counter = 0;

		console.log("Reading from a file using line Reader");
		lineReader.eachLine(logFilePath, (data, last) => {
			if (last) {
				console.log(counter);
				getDatalogConfig().maxPageNumber = Math.ceil(counter / datalogConfig.recordsPerPage);
				//selfWebView.postMessage({ command: 'updateDatalogConfig', datalogConfig: getDatalogConfig() });
				selfWebView.postMessage({ command: 'updateDatalogData', datalogData: datalogData.slice().reverse() });
				setTimeout(refreshDatalogData, getDatalogConfig().refreshRate);
				console.log("Read everything");
				return false;
			}

			if (data.indexOf("|") !== -1) {
				counter++;
				if (startIndex <= counter && counter <= stopIndex) {
					var values = data.split("|");
					datalogData.push([{
						"Key": "Site",
						"Value": values[0]
					}, {
						"Key": "Measured Value",
						"Value": values[1]
					}, {
						"Key": "Test Method Name",
						"Value": values[2]
					}, {
						"Key": "Server Name",
						"Value": values[3]
					}])
				}
			}
			return true;
		})
	} catch (e) {
		throw e;
	}
}

function updateDatalogPanelFromInMemoryData(datalogConfig) {
	if (selfWebView == null) {
		setTimeout(refreshDatalogData, getDatalogConfig().refreshRate);
		return;
	}

	try {
		var datalogData = [];
		var startIndex = ((datalogConfig.currentPageNumber - 1) * datalogConfig.recordsPerPage) + 1;
		var stopIndex = startIndex + datalogConfig.recordsPerPage - 1;

		var counter = 0;
		var actualData = getDatalogData();
		actualData.forEach((data) => {
			counter++;
			if (startIndex <= counter && counter <= stopIndex) {
				var newData = [];
				data.keyValuePair.forEach(keyValuePair => {
					newData.push({
						"Key": keyValuePair.Key,
						"Value": keyValuePair.Value
					})
				})
				datalogData.push(newData);
			}
		})

		getDatalogConfig().maxPageNumber = Math.ceil(counter / datalogConfig.recordsPerPage);
		selfWebView.postMessage({ command: 'updateDatalogData', datalogData: datalogData });
		setTimeout(refreshDatalogData, getDatalogConfig().refreshRate);
	} catch (e) {
		throw e;
	}
}

subscribeDataLogTopic();
refreshDatalogData();

exports.DataLogPanel = DataLogPanel;