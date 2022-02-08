const vscode = acquireVsCodeApi();
console.log("Datalog index file is loaded");

function loadInitialTable(){
    let table = document.getElementById("table2");
    table.innerHTML=`<tr class="table-head">
    <td>Server Name</td>
    <td>Site</td>
    <td>Measured Value</td>
    <td>Test Method Name</td>
   </tr>`;
  
  }
  
  function datalogger(tableData){
    let table = document.getElementById("table2");
    tableData.forEach(data => {
        table.innerHTML+=`<tr>
        <td>${data.keyValuePair[3].Value}</td>
        <td>${data.keyValuePair[0].Value}</td>
        <td>${data.keyValuePair[1].Value}</td>
        <td>${data.keyValuePair[2].Value}</td>
       </tr>`
    });
//     table.innerHTML+=`<tr>
//     <td>${data.keyValuePair[3].Value}</td>
//     <td>${data.keyValuePair[0].Value}</td>
//     <td>${data.keyValuePair[1].Value}</td>
//     <td>${data.keyValuePair[2].Value}</td>
//    </tr>`
  }
  
  function updateTableData(tableData){
    let tableComponent2 = document.getElementById("tableComponent2");
     tableComponent2.innerHTML=`<table id="table2"></table>`;
     loadInitialTable();
     datalogger(tableData);

  }
  window.addEventListener('message', event => {
    switch (event.data.command) {
      case 'updateTableData':
        updateTableData(event.data.tableData);
        break;
  
    }
  });