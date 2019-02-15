function getFiddleConfig(id) {
  var xhr = new XMLHttpRequest();
  var url = "https://fiddle.fastlydemo.net/fiddle/"+id;
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.onreadystatechange = function() {
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
      if (xhr.readyState === 4) {
          if (xhr.status === 200) {
              var eOutput = document.getElementById("output"), eTmp, oCfg = JSON.parse(xhr.responseText).fiddle;
              // Title & Description
              eTmp = myCreateElement("h1",myCreateElement("header",eOutput),"Fastly Fiddle: ");
              if (oCfg.title=="") {
                  eTmp.innerHTML += "<i>Unnamed</i>";
              } else {
                  let eTmp2 = myCreateElement("a",eTmp,escapeHTML(oCfg.title));
                  eTmp2.href = url;
                  eTmp2.setAttribute("target","_blank");
              }
              eTmp.innerHTML += " (" + oCfg.id + ")";
              let eTmp2 = myCreateElement("button",eTmp,"Change ID");
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
              //
              eOutput.style.display = "";
          } if (xhr.status === 404) {
            document.getElementById("input").style.display = "";
            document.getElementById("message").innerText = xhr.responseText;
          } else {
              console.log("ERROR - HTTP Status: " + xhr.status);
          }
      } else {
          console.log("ERROR - HTTP State: " + xhr.readyState);
      }
  };
  xhr.send();
}
function checkId(eId) {
  var eMsg = document.getElementById("message"), eSubmit = document.getElementById("submit");
  eMsg.innerHTML = (/^[a-z0-9]+$/.test(eId.value) || eId.value=="") ? "" : "ID can only contain numbers and lowercase letters";
  eSubmit.disabled = (eMsg.innerHTML != "" || eId.value=="");
}
function getId() {
  var eInput = document.getElementById("input");
  var eOutput = document.getElementById("output");
  var id = window.location.search.replace(/^\?/,"");
  console.log("id=\""+id+"\"");
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