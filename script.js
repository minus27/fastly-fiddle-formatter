const FIDDLE_URL = "https://fiddle.fastlydemo.net/fiddle/";
const BOILERPLATE_URL = "https://docs.fastly.com/vcl/custom-vcl/creating-custom-vcl/#fastlys-vcl-boilerplate";
var oCfg;

function myGetElementsByClassName(eParent,className) {
    var colTmp = eParent.getElementsByClassName(className);
    if (colTmp.length==0) { throw new Error("Element with Class Name = \""+className+"\" not found"); }
    if (colTmp.length>1) { throw new Error("More than one element with Class Name = \""+className+"\" found"); }
    return colTmp[0];
}
function myCreateElement(eType,eParent,txtHtml) {
    var eTmp = document.createElement(eType);
    eParent.appendChild(eTmp);
    if (typeof txtHtml !== "undefined") { eTmp.innerHTML = txtHtml; }
    return eTmp;
}
function escapeHTML(html) {
    var eTmp = document.createElement('textarea');
    eTmp.textContent = html;
    return eTmp.innerHTML;
}
function unescapeHTML(html) {
    var eTmp = document.createElement('textarea');
    eTmp.innerHTML = html;
    return eTmp.textContent;
}

function formatConfig(oCfg) {
  var eOutput = document.getElementById("output"), eTmp, eTmp2;
  // Title & Description
  eTmp = myCreateElement("h1",myCreateElement("header",eOutput),"Fastly Fiddle: ");
  if (oCfg.title=="") {
      eTmp.innerHTML += "<i>Unnamed</i>";
  } else {
      eTmp2 = myCreateElement("a",eTmp,escapeHTML(oCfg.title));
      eTmp2.href = FIDDLE_URL + oCfg.id;
      eTmp2.setAttribute("target","_blank");
  }
  eTmp.innerHTML += " (" + oCfg.id + ")";
  eTmp2 = myCreateElement("button",eTmp,"Change ID");
  eTmp2.setAttribute("onclick","location.href=location.pathname");
  eTmp2.setAttribute("class","noprint");
  var eSection = myCreateElement("section",eOutput);
  if (oCfg.description != "") { myCreateElement("dd",myCreateElement("dl",eSection),escapeHTML(oCfg.description)); }
  // Origin Servers
  myCreateElement("h2",eSection,"Origin Servers");
  eTmp = myCreateElement("ol",eSection);
  eTmp.setAttribute("start","0");
  for (var i=0; i<oCfg.origins.length; i++) { myCreateElement("li",eTmp,(oCfg.origins[i]==null)?"&nbsp;":oCfg.origins[i]); }
  // Custom VCL Subroutines
  myCreateElement("h2",eSection,"Custom VCL");
  for ( let a="init,recv,hit,miss,pass,fetch,deliver,error".split(","),j=0; j<a.length; j++) {
      if (a[j] in oCfg.vcl) {
          eTmp = myCreateElement("h3",eSection,a[j]);
          if (oCfg.vcl[a[j]]=="") {
              eTmp.innerHTML += " - <i>No VCL</i>";
          } else {
              myCreateElement("pre",myCreateElement("dd",myCreateElement("dl",eSection)),escapeHTML(oCfg.vcl[a[j]]));
          }
      } else {
          eTmp.innerHTML += " - <i>Not Found</i>";
      }
  }
  // Request
  myCreateElement("h2",eSection,"Request");
  eTmp = myCreateElement("dd",myCreateElement("dl",eSection),oCfg.reqMethod);
  eTmp.innerHTML += " " + ((oCfg.reqUrl=="")?"<i>Not Specified</i>":escapeHTML(oCfg.reqUrl));
  // Headers
  eTmp = myCreateElement("h3",eSection,"Headers");
  if (oCfg.reqHeaders=="") {
      eTmp.innerHTML += " - <i>None Specified</i>";
  } else {
      myCreateElement("pre",myCreateElement("dd",myCreateElement("dl",eSection)),escapeHTML(oCfg.reqHeaders));
  }
  // Body
  eTmp = myCreateElement("h3",eSection,"Body");
  if (oCfg.reqBody=="") {
      eTmp.innerHTML += " - <i>None Specified</i>";
  } else {
      myCreateElement("pre",myCreateElement("dd",myCreateElement("dl",eSection)),escapeHTML(oCfg.reqBody));
  }
  // Options
  myCreateElement("h3",eSection,"Options");
  eTmp = myCreateElement("ul",eSection);
  for ( let a="purgeFirst,enableCluster,enableShield,useH2".split(","),j=0; j<a.length; j++) {
      let eTmp2 = myCreateElement("li",eTmp);
      let eTmp3 = myCreateElement("input",eTmp2);
      eTmp3.type = "checkbox";
      eTmp3.setAttribute("onclick","this.checked = !this.checked");
      if (a[j] in oCfg) {
          if (oCfg[a[j]]) eTmp3.setAttribute("checked","checked");
          eTmp2.innerHTML += " " + a[j];
     } else {
          eTmp2.innerHTML += " " + a[j] + " - <i>Not Found</i>";
      }
  }
  // Custom VCL File
  myCreateElement("hr",eSection);
  myCreateElement("h2",eSection,"Custom VCL File");
  eTmp = myCreateElement("pre",eSection);
  eTmp.id = "vcl_file";
  getVclBoilerplate();
  //
  eOutput.style.display = "";
}

function getFiddleConfig(id) {
  var xhr = new XMLHttpRequest();
  var url = FIDDLE_URL + id;
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
          if (xhr.status === 200) {
              oCfg = JSON.parse(xhr.responseText);
              formatConfig(oCfg.fiddle);
          } else if (xhr.status === 404) {
            document.getElementById("input").style.display = "";
            document.getElementById("message").innerText = xhr.responseText;
            document.getElementById("fid").value = id;
            document.getElementById("submit").disabled = false;
            document.getElementById("clear").disabled = false;
          } else {
              console.log("ERROR - HTTP Status: " + xhr.status);
          }
      } else {
          console.log("ERROR - HTTP State: " + xhr.readyState);
      }
  };
  xhr.send();
}
function parseVclBoilerplate(html) {
  var txtBefore = html, txtAfter = txtBefore.replace(/^[\s\S]*<\/h3>([\s\S]*)<h4[\s\S]*$/,"$1");
  if (txtAfter==txtBefore) {
    console.log("parseVclBoilerplate: Problems capturing text between \"</h3>\" and \"<h4\"");
    return;
  }
  txtBefore = txtAfter;
  txtAfter = txtBefore.replace(/^[\s\S]*<td class="rouge-code">([\s\S]*)<\/td>[\s\S]*$/,"$1");
  if (txtAfter==txtBefore) {
    console.log("parseVclBoilerplate: Problems capturing text between \"<td class=\"rouge-code\">\" and \"</td>\"");
    return;
  }
  txtBefore = txtAfter;
  txtAfter = txtBefore.replace(/<[^>]+>/g,"");
  if (txtAfter==txtBefore) {
    console.log("parseVclBoilerplate: Problems removing HTML elements");
    return;
  }
  
  txtBefore = unescapeHTML(txtAfter);
  
  for ( let a="init,recv,hit,miss,pass,fetch,deliver,error".split(","),j=0; j<a.length; j++) {
      if (a[j] in oCfg.fiddle.vcl || a[j] == "init") {
          if (oCfg.fiddle.vcl[a[j]]=="") continue;
          if (a[j] == "init") {
            txtBefore = oCfg.fiddle.vcl[a[j]] + "\n\n" + txtBefore;
            continue;
          }
          txtBefore = txtBefore.replace(new RegExp("(#FASTLY "+a[j]+")","g"), "\n" + oCfg.fiddle.vcl[a[j]] + "\n\n$1");
      } else {
          console.log(a[j] + " not found in Fiddle config");
      }
  }
  
  txtAfter = txtBefore;
  
  txtBefore  = "# VCL Boilerplate Source: " + BOILERPLATE_URL + "\n";
  txtBefore += "#   Fastly Fiddle Source: " + FIDDLE_URL + document.getElementById("fid").value + "\n";
  var o = [];
  for (var i=0; i<oCfg.fiddle.origins.length; i++) { if (oCfg.fiddle.origins[i]!=null) o.push("#   F_origin_" + i + " = " + oCfg.fiddle.origins[i]); }
  if (o.length!=0) txtBefore += "#\n# Remember to name your origin" + ((o.length==1)?"":"s") + " as follows:\n#\n" + o.join("\n") + "\n\n";
  txtBefore += txtAfter;
  
  document.getElementById('vcl_file').innerHTML = escapeHTML(txtBefore);
}
function getVclBoilerplate() {
  var xhr = new XMLHttpRequest();
  var url = "https://cors.io/?" + BOILERPLATE_URL;
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
          if (xhr.status === 200) {
              parseVclBoilerplate(xhr.responseText);
          } else {
              console.log("ERROR - HTTP Status: " + xhr.status);
          }
      } else {
          console.log("ERROR - HTTP State: " + xhr.readyState);
      }
  };
  xhr.send();
}

function submitFiddleId() {
  location.href = location.href.replace(/\?.*$/,"") + "?" + document.getElementById('fid').value;
}
function clearFiddleId() {
  document.getElementById('fid').value='';
  checkFiddleId();
}
function checkFiddleId() {
  var eId = document.getElementById("fid"),
      eMsg = document.getElementById("message"),
      eSubmit = document.getElementById("submit"),
      eClear = document.getElementById("clear");
  eMsg.innerHTML = (/^[a-z0-9]+$/.test(eId.value) || eId.value=="") ? "" : "ID can only contain numbers and lowercase letters";
  eSubmit.disabled = (eMsg.innerHTML != "" || eId.value=="");
  eClear.disabled = eSubmit.disabled;
}
function getFiddleId() {
  var eInput = document.getElementById("input");
  var eOutput = document.getElementById("output");
  var eId = document.getElementById("fid");
  var id = window.location.search.replace(/^\?/,"");
  eId.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      document.getElementById("submit").click();
    }
  });
  if (id=="") {
    eInput.style.display = "";
    return;
  }
  if (!(/^[a-z0-9]+$/.test(id))) {
    eInput.style.display = "";
    return;
  }
  getFiddleConfig(id);
}
