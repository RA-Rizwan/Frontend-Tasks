const files = {
  "Callback.js": `
const userWithTransactions=[
{id:1,name:"Raima",transactions:[100,200,50]},
{id:2,name:"Ali",transactions:[500,100]},
{id:3,name:"Hina",transactions:[]},
{id:4,name:"Mujtaba Alam",transactions:[2000,1500,800]},];

    const findUserById=(id,callback)=>{
    const user=userWithTransactions.find((u)=>u.id===id);
    user?callback(user):callback("User Not Found");}

    const getTransactions =(user,callback)=>{
    user.transactions && user.transactions.length>0 ?callback(user.transactions):callback("No Transaction Found")};

    const calculateTotal=(transactions,callback)=>{
        const total =transactions.reduce((sum,t)=>sum+t,0);
        callback(total);}

findUserById(4,(user)=>{
    console.log("User found :"+ user.name);

    getTransactions(user,(transactions)=>{
        console.log("Transactions :"+ transactions);

        calculateTotal(transactions,(total)=>{
            console.log("Total of all transactions :"+ total);
        });
    });
});

`,
};

let currentFile = "Callback.js";

let editor;

const editorContainer = document.getElementById("editor-container");
const consoleOutput = document.getElementById("console-output");
const runButton = document.getElementById("run-button");
const tabs = document.querySelectorAll(".tab");

require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs",
  },
});
require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(editorContainer, {
    value: files[currentFile],
    language: "javascript",
    theme: "vs-dark",
  });

  editor.onDidChangeModelContent(() => {
    files[currentFile] = editor.getValue();
  });
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const filename = tab.getAttribute("data-filename");
    currentFile = filename;

    if (editor) {
      editor.setValue(files[filename]);
    }
  });
});

const consoleOverrideScript = `
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            const originalInfo = console.info;

            const post = (type, args) => {
                const safeArgs = args.map(arg => {
                    try {
                        // Check for undefined, as it becomes 'null' in JSON.stringify
                        if (typeof arg === 'undefined') return 'undefined';
                        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                    } catch (e) {
                        return '[Unserializable Object]';
                    }
                });
                window.parent.postMessage({ type: type, data: safeArgs }, '*');
            };

            console.log = (...args) => {
                post('log', args);
                originalLog.apply(console, args);
            };

            console.error = (...args) => {
                post('error', args);
                originalError.apply(console, args);
            };
            console.warn = (...args) => {
                post('warn', args);
                originalWarn.apply(console, args);
            };
            console.info = (...args) => {
                post('info', args);
                originalInfo.apply(console, args);
            };

            window.addEventListener('error', (e) => {
                post('error', [e.message]);
            });
        `;

runButton.addEventListener("click", runCode);

function runCode() {
  consoleOutput.textContent = "";

  let iframe = document.querySelector("iframe");
  if (iframe) {
    iframe.remove();
  }
  iframe = document.createElement("iframe");

  iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");

  iframe.style.display = "none";

  iframe.onload = () => {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const iframeWindow = iframe.contentWindow;

    const scriptEl = iframeDoc.createElement("script");
    scriptEl.textContent = consoleOverrideScript;
    iframeDoc.head.appendChild(scriptEl);

    const blobUrls = {};
    const importMap = { imports: {} };

    for (const filename in files) {
      if (filename.endsWith(".js")) {
        const blob = new Blob([files[filename]], {
          type: "application/javascript",
        });
        const url = URL.createObjectURL(blob);
        blobUrls[filename] = url;

        const importName = filename.replace(".js", "");
        importMap.imports[importName] = url;
        importMap.imports["./" + filename] = url;
      }
    }

    const importMapScript = iframeDoc.createElement("script");
    importMapScript.type = "importmap";
    importMapScript.textContent = JSON.stringify(importMap);
    iframeDoc.head.appendChild(importMapScript);

    const mainScript = iframeDoc.createElement("script");
    mainScript.type = "module";
      mainScript.src = blobUrls["Callback.js"];
    mainScript.onerror = () => {
      console.error("Error: Failed to load main script module.");
    };

    iframeDoc.body.appendChild(mainScript);
  };

  document.body.appendChild(iframe);
}

window.addEventListener("message", (event) => {
  if (!event.data || typeof event.data !== "object" || !event.data.type) {
    return;
  }

  const { type, data } = event.data;
  const line = document.createElement("span");

  const message = data.join(" ");

  if (type === "error") {
    line.style.color = "#ff8a80";
    line.textContent = `! Error: ${message}\n`;
  } else if (type === "warn") {
    line.style.color = "#ffd54f";
    line.textContent = `> ${message}\n`;
  } else {
    line.style.color = "#ccc";
    line.textContent = `> ${message}\n`;
  }

  consoleOutput.appendChild(line);
});
