const vscode = acquireVsCodeApi();
vscode.postMessage({
    command: 'syncDatalogConfigData'
  });

  
console.log("Datalog index file is loaded");

let recordsInput = document.getElementById("recordsInput");
let currentPageInput = document.getElementById("currentPageInput");
let refreshInput = document.getElementById("refreshInput");
let maxPageNumber = document.getElementById("max");


recordsInput.addEventListener('change', updateRecords);
currentPageInput.addEventListener('change',updateCurrentPageNumber);
refreshInput.addEventListener('change',updateRefreshRate);

function updateRecords(e){
   let newConfigData = {
      recordsPerPage: parseInt(e.target.value) ,
      currentPageNumber: parseInt(currentPageInput.value),
      refreshRate:parseInt(refreshInput.value)
   }
   vscode.postMessage({
       command:'updateDatalogConfig', newConfigData :newConfigData
   });
}

function updateCurrentPageNumber(e){
    let newConfigData = {
        recordsPerPage: parseInt(recordsInput.value) ,
        currentPageNumber: parseInt(e.target.value),
        refreshRate:parseInt(refreshInput.value)
     }
     vscode.postMessage({
        command:'updateDatalogConfig', newConfigData:newConfigData
    });
}



function updateRefreshRate(e){
    let newConfigData = {
        recordsPerPage: parseInt(recordsInput.value) ,
        currentPageNumber: parseInt(currentPageInput.value),
        refreshRate:  parseInt(e.target.value)
     }
     vscode.postMessage({
        command:'updateDatalogConfig', newConfigData:newConfigData
    });
}

  

  
  function updateTableData(tableData){
    
     let table = document.getElementById("table2");
    table.innerHTML = ``;
    table.innerHTML= `<tr class="table-head">
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
    

  }

  function updateDatalogConfig(data){
    
    recordsInput.value = data.recordsPerPage;
    currentPageInput.value = data.currentPageNumber;
    maxPageNumber.innerHTML = `Max Page Number: ${data.maxPageNumber}`;
    refreshInput.value = data.refreshRate;
  }

//   function updateMaxPageNumber(data){
//     let maxPageNumber = document.getElementById("max");  
//     maxPageNumber.innerHTML = `Max Page Number: ${data}`;  
//   }

  window.addEventListener('message', event => {
    switch (event.data.command) {
      case 'updateDatalogData':
        updateTableData(event.data.datalogData);
        break;
      case 'updateDatalogConfig':
        updateDatalogConfig(event.data.datalogConfig);
        break;
    }
  });
 