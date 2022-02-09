//const { getDatalogConfig } = require("../../GlobalState");

const vscode = acquireVsCodeApi();
console.log("Datalog index file is loaded");
let inputOne = document.getElementById("inputOne");
let inputTwo = document.getElementById("inputTwo");
let inputThree = document.getElementById("inputThree");
let inputFour = document.getElementById("inputFour");


inputOne.addEventListener('change', updateValueOne);
inputTwo.addEventListener('change',updateValueTwo);
inputThree.addEventListener('change',updateValueThree);
inputFour.addEventListener('change',updateValueFour);

function updateValueOne(e){
   let newConfigData = {
      recordsPerPage: parseInt(e.target.value) ,
      currentPageNumber: parseInt(inputTwo.value),
      maxPageNumber: parseInt(inputThree.value),
      refreshRate:parseInt(inputFour.value)
   }
   vscode.postMessage({
       command:'updateDatalogConfig', newConfigData :newConfigData
   });
}

function updateValueTwo(e){
    let newConfigData = {
        recordsPerPage: parseInt(inputOne.value) ,
        currentPageNumber: parseInt(e.target.value),
        maxPageNumber: parseInt(inputThree.value),
        refreshRate:parseInt(inputFour.value)
     }
     vscode.postMessage({
        command:'updateDatalogConfig', newConfigData:newConfigData
    });
}

function updateValueThree(e){
    let newConfigData = {
        recordsPerPage: parseInt(inputOne.value) ,
        currentPageNumber: parseInt(inputTwo.value),
        maxPageNumber: parseInt(e.target.value),
        refreshRate:parseInt(inputFour.value)
     }
     vscode.postMessage({
        command:'updateDatalogConfig', newConfigData:newConfigData
    });
}

function updateValueFour(e){
    let newConfigData = {
        recordsPerPage: parseInt(inputOne.value) ,
        currentPageNumber: parseInt(inputTwo.value),
        maxPageNumber:  parseInt(inputThree.value),
        refreshRate:  parseInt(e.target.value)
     }
     vscode.postMessage({
        command:'updateDatalogConfig', newConfigData:newConfigData
    });
}



// function loadInitialTable(){
//     let table = document.getElementById("table2");
//     table.innerHTML=`<tr class="table-head">
//     <td>Server Name</td>
//     <td>Site</td>
//     <td>Measured Value</td>
//     <td>Test Method Name</td>
//    </tr>`;
  
//   }
 
  
  function datalogger(tableData){
    let table = document.getElementById("table2");
    table.innerHTML=`<tr class="table-head">
    <td>Server Name</td>
    <td>Site</td>
    <td>Measured Value</td>
    <td>Test Method Name</td>
</tr>`;
    tableData.reverse();
    tableData.forEach(data => {
        var x = table.insertRow(1);
        var a = x.insertCell(0);
        var b = x.insertCell(1);
        var c = x.insertCell(2);
        var d = x.insertCell(3);
        a.innerHTML=`${data.keyValuePair[3].Value}`;
        b.innerHTML=`${data.keyValuePair[0].Value}`;
        c.innerHTML=`${data.keyValuePair[1].Value}`;
        d.innerHTML=`${data.keyValuePair[2].Value}`;
    });
    
    // tableData.forEach(data => {
    //     table.innerHTML+=`<tr>
    //     <td>${data.keyValuePair[3].Value}</td>
    //     <td>${data.keyValuePair[0].Value}</td>
    //     <td>${data.keyValuePair[1].Value}</td>
    //     <td>${data.keyValuePair[2].Value}</td>
    //    </tr>`
    // });
//     table.innerHTML+=`<tr>
//     <td>${data.keyValuePair[3].Value}</td>
//     <td>${data.keyValuePair[0].Value}</td>
//     <td>${data.keyValuePair[1].Value}</td>
//     <td>${data.keyValuePair[2].Value}</td>
//    </tr>`
  }
  
  function updateTableData(tableData){
    let tableComponent2 = document.getElementById("tableComponent2");
    // tableComponent2.innerHTML=`<table id="table2"></table>`;
     //loadInitialTable();
     datalogger(tableData);

  }
//   function updateConfigData(data){
//       let a = document.getElementById("records");
//       let b = document.getElementById("current");
//       let c = document.getElementById("max");
//       let d = document.getElementById("refresh");
//       a.innerText = `Records per page: ${data.recordsPerPage}`;
//       b.innerText = `Current page number: ${data.currentPageNumber}`;
//       c.innerText = `Maximum page number: ${data.maxPageNumber}`;
//       d.innerText = `Refresh rate: ${data.refreshRate}`;
//   }

  window.addEventListener('message', event => {
    switch (event.data.command) {
    //   case 'updateTableData':
    //     updateTableData(event.data.tableData);
    //     break;
    
      case 'updateDatalogData':
        updateTableData(event.data.datalogData);
        break;
    //   case 'sendConfigData':
    //     updateConfigData(event.data.configData)
    //     break;
  
    }
  });
 