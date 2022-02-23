"use strict";

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = __dirname + "/testmethod.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const testMethodPackage = protoDescriptor.testmethod;

let startTime = undefined;
let configurationIndex = 0;

let tfeData = {};

let datalogData = [];
let datalogConfig = {
  recordsPerPage: 10,
  currentPageNumber: 1,
  maxPageNumber: 1,
  refreshRate: 100,
};

let bitMapToolGraphData = {
  mainGraphRowPoints: [],
  mainGraphColumnPoints: [],
  mainGraphDataPoints: [],
  mainGraphDataPointsInString: "",
  cursorGraphRowSamples: 200,
  cursorGraphColumnSamples: 5,
  cursorGraphRowScale: 999,
  cursorGraphColumnScale: 999,
  cursorGraphRowReference: 0,
  cursorGraphColumnReference: 0,
  cursorGraphRowPoints: [],
  cursorGraphColumnPoints: [],
  cursorGraphDataPoints: [],
  skipCursorGraph: false,
  cursorGraphRowRange: 0,
  cursorGraphColumnRange: 0,
  mainGraphRowCount: 2160,
  mainGraphColumnCount: 3840,
  exportGraphRowPoints: [],
  exportGraphColumnPoints: [],
  exportGraphDataPoints: [],
  exportGraphData: [],
  updateMainGraphData: (mainGraphData) => {
    for (let rowNumber = 0; rowNumber < bitMapToolGraphData.mainGraphRowCount; rowNumber++) {
      for (let columnNumber = 0; columnNumber < bitMapToolGraphData.mainGraphColumnCount; columnNumber++) {
        bitMapToolGraphData.mainGraphDataPoints[rowNumber][columnNumber] = mainGraphData[rowNumber][columnNumber];
      }
    }
  },
  updateCursorGraphData: (cursorGraphData) => {
    let cursorGraphDataLength = cursorGraphData.length;
    let rowReferenceOfSample = Math.ceil(bitMapToolGraphData.mainGraphRowCount / bitMapToolGraphData.cursorGraphRowScale);
    let columnReferenceOfSample = Math.ceil(bitMapToolGraphData.mainGraphColumnCount / bitMapToolGraphData.cursorGraphColumnScale);
    for (let rowNumber = 0; rowNumber < cursorGraphDataLength; rowNumber++) {
      let cursorGraphDataRowLength = cursorGraphData[rowNumber].length;
      for (let columnNumber = 0; columnNumber < cursorGraphDataRowLength; columnNumber++) {
        bitMapToolGraphData.cursorGraphDataPoints[bitMapToolGraphData.cursorGraphRowReference * rowReferenceOfSample + rowNumber][bitMapToolGraphData.cursorGraphColumnReference * columnReferenceOfSample + columnNumber] = cursorGraphData[rowNumber][columnNumber];
      }
    }
    bitMapToolGraphData.cursorGraphColumnReference++;

    if (bitMapToolGraphData.cursorGraphColumnReference >= bitMapToolGraphData.cursorGraphColumnSamples) {
      bitMapToolGraphData.cursorGraphColumnReference = 0;
      bitMapToolGraphData.cursorGraphRowReference++;
    }
  },
  updateExportGraphData: () => {
    let dataRowSize = 0;
    let dataColumnSize = 0;
    let rowPoints = [];
    let columnPoints = [];
    let dataPoints = [];
    let exportGraphData = bitMapToolGraphData.exportGraphData;
    let mainGraphDataPoints = bitMapToolGraphData.mainGraphDataPoints;
    exportGraphData.forEach((data) => {
      if (data.width > dataColumnSize) {
        dataColumnSize = data.width;
      }
      if (data.height > dataRowSize) {
        dataRowSize = data.height;
      }
    });

    for (let rowNumber = 0; rowNumber < dataRowSize; rowNumber++) {
      rowPoints.push(rowNumber);
    }
    for (let columnNumber = 0; columnNumber < dataColumnSize; columnNumber++) {
      columnPoints.push(columnNumber);
    }

    try {
      for (let rowNumber = 0; rowNumber < dataRowSize; rowNumber++) {
        let dataPoint = [];
        for (let columnNumber = 0; columnNumber < dataColumnSize; columnNumber++) {
          let result = undefined;
          exportGraphData.forEach((data) => {
            if (rowNumber < data.height && columnNumber < data.width) {
              if (mainGraphDataPoints[data.y + rowNumber] != null && mainGraphDataPoints[data.y + rowNumber][data.x + columnNumber] != null) {
                if (result === undefined) {
                  result = mainGraphDataPoints[data.y + rowNumber][data.x + columnNumber] === 1 ? true : false;
                } else {
                  if (data.Operator === "And") {
                    result = result && mainGraphDataPoints[data.y + rowNumber][data.x + columnNumber] === 1 ? true : false;
                  } else {
                    result = result || mainGraphDataPoints[data.y + rowNumber][data.x + columnNumber] === 1 ? true : false;
                  }
                }
              }
            }
          });
          dataPoint.push(result ? 1 : 0);
        }
        dataPoints.push(dataPoint);
      }
    } catch (e) {
      debugger;
    }

    bitMapToolGraphData.exportGraphRowPoints = rowPoints;
    bitMapToolGraphData.exportGraphColumnPoints = columnPoints;
    bitMapToolGraphData.exportGraphDataPoints = dataPoints;
  },
  addConfiguration: (xRange, yRange) => {
    bitMapToolGraphData.exportGraphData.push({
      x: Math.ceil(xRange[0]),
      y: Math.ceil(yRange[0]),
      width: Math.ceil(xRange[1] - xRange[0]),
      height: Math.ceil(yRange[1] - yRange[0]),
      Operator: "And",
      index: configurationIndex++,
    });
  },
  updateXValue: (value, index) => {
    let configuration = bitMapToolGraphData.exportGraphData.find((x) => x.index === index);
    configuration.x = parseInt(value);
  },
  updateYValue: (value, index) => {
    let configuration = bitMapToolGraphData.exportGraphData.find((x) => x.index === index);
    configuration.y = parseInt(value);
  },
  updateWidth: (value, index) => {
    let configuration = bitMapToolGraphData.exportGraphData.find((x) => x.index === index);
    configuration.width = parseInt(value);
  },
  updateHeight: (value, index) => {
    let configuration = bitMapToolGraphData.exportGraphData.find((x) => x.index === index);
    configuration.height = parseInt(value);
  },
  updateOperation: (value, index) => {
    let configuration = bitMapToolGraphData.exportGraphData.find((x) => x.index === index);
    configuration.Operator = value;
  },
  deleteConfiguration: (index) => {
    let configuration = bitMapToolGraphData.exportGraphData.find((x) => x.index === index);
    bitMapToolGraphData.exportGraphData.splice(bitMapToolGraphData.exportGraphData.indexOf(configuration), 1);
  },
};

function initializeBitMapToolGraph() {
  bitMapToolGraphData.cursorGraphRowRange = Math.ceil(bitMapToolGraphData.mainGraphRowCount / bitMapToolGraphData.cursorGraphRowScale) * bitMapToolGraphData.cursorGraphRowSamples;
  bitMapToolGraphData.cursorGraphColumnRange = Math.ceil(bitMapToolGraphData.mainGraphColumnCount / bitMapToolGraphData.cursorGraphColumnScale) * bitMapToolGraphData.cursorGraphColumnSamples;

  for (let rowNumber = 0; rowNumber < bitMapToolGraphData.mainGraphRowCount; rowNumber++) {
    bitMapToolGraphData.mainGraphRowPoints.push(rowNumber);
    bitMapToolGraphData.mainGraphDataPoints.push(new Array(bitMapToolGraphData.mainGraphColumnCount).fill(null));
  }
  for (let columnNumber = 0; columnNumber < bitMapToolGraphData.mainGraphColumnCount; columnNumber++) {
    bitMapToolGraphData.mainGraphColumnPoints.push(columnNumber);
  }

  for (let rowNumber = 0; rowNumber < bitMapToolGraphData.cursorGraphRowRange; rowNumber++) {
    bitMapToolGraphData.cursorGraphRowPoints.push(rowNumber);
    bitMapToolGraphData.cursorGraphDataPoints.push(new Array(bitMapToolGraphData.cursorGraphColumnRange).fill(null));
  }
  for (let columnNumber = 0; columnNumber < bitMapToolGraphData.cursorGraphColumnRange; columnNumber++) {
    bitMapToolGraphData.cursorGraphColumnPoints.push(columnNumber);
  }
}

initializeBitMapToolGraph();

let server1 = {
  name: "Server 1",
  debugConfiguration: {
    local: {
      name: ".NET Core Attach",
      type: "coreclr",
      request: "attach",
      processName: "TestMethodServer.exe",
    },
    remote: {
      name: "Remote 1",
      type: "coreclr",
      request: "attach",
      processName: "TestMethodServer.exe",
      pipeTransport: {
        pipeProgram: "ssh",
        pipeArgs: ["soliton@192.168.1.19"],
        debuggerPath: "C:/Users/Soliton/.vscode/extensions/ms-dotnettools.csharp-1.24.0/.debugger/vsdbg.exe",
        quoteArgs: false,
      },
    },
  },
  service: {
    testMethodService: new testMethodPackage.TestMethod("localhost:30051", grpc.credentials.createInsecure()),
    siteConfigurationService: new testMethodPackage.SiteConfiguration("localhost:30051", grpc.credentials.createInsecure()),
    pubsubService: new testMethodPackage.PubSub("localhost:30051", grpc.credentials.createInsecure(), { "grpc.max_receive_message_length": 1024 * 1024 * 1024 }),
  },
  subscription: {
    resumeSubscription: undefined,
    datalogSubscription: undefined,
    bitmaptoolSubscription: undefined,
  },
  sites: [],
  isActive: true,
};

let server2 = {
  name: "Server 2",
  debugConfiguration: {
    local: {
      name: ".NET Core Attach",
      type: "coreclr",
      request: "attach",
      processName: "TestMethodServer.exe",
    },
    remote: {
      name: "Remote 2",
      type: "coreclr",
      request: "attach",
      processName: "TestMethodServer.exe",
      pipeTransport: {
        pipeProgram: "ssh",
        pipeArgs: ["soliton@192.168.1.20"],
        debuggerPath: "C:/Users/Soliton/.vscode/extensions/ms-dotnettools.csharp-1.24.0/.debugger/vsdbg.exe",
        quoteArgs: false,
      },
    },
  },
  service: {
    testMethodService: new testMethodPackage.TestMethod("192.168.1.20:30051", grpc.credentials.createInsecure()),
    siteConfigurationService: new testMethodPackage.SiteConfiguration("192.168.1.20:30051", grpc.credentials.createInsecure()),
    pubsubService: new testMethodPackage.PubSub("192.168.1.20:30051", grpc.credentials.createInsecure()),
  },
  subscription: {
    resumeSubscription: undefined,
    datalogSubscription: undefined,
  },
  sites: [],
  isActive: false,
};

let servers = [server1, server2];

exports.getTFEData = () => tfeData;
exports.getDatalogData = () => datalogData;
exports.setDatalogData = (newDatalogData) => (datalogData = newDatalogData);
exports.getDatalogConfig = () => datalogConfig;
exports.setTFEData = (newTFEData) => (tfeData = newTFEData);
exports.getServers = () => servers;
exports.getBitMapToolGraphData = () => bitMapToolGraphData;
