const app = new Realm.App({ id: "application-0-dopcr" });
var nodes = document.getElementsByClassName("node");


var user;
var cuserid;

// Creation of table with grades with respect to class Interval
updateGradeDivs();

// Creation of new user and setting cookies
checkCookie();

var labcap = 0;

let subjects = ["ELECTIVE_1", "ELECTIVE_2", "CC", "OOAD", "CD"];
let labs = ["Lab 1 (CC)", "Lab 2 (OOAD)", "Capstone Phase 1"];

let toggle = document.getElementById("lab-marks");
//window.addEventListener("load", displayOutput);

function updateGradeDivs() {
  var ci = parseInt(document.getElementById("class-interval").value);
  let outputdiv = document.getElementById("grade-divs");

  var max_ci = 100;
  var output = "<table><tr><th>Grade</th><th>Marks Interval</th></tr>";
  var grades = ["S", "A", "B", "C", "D", "E", "F"];
  var cis = [];
  for (var i = 0; i < 7; i++) {
    var ci2 = max_ci - ci;
    cis.push(`${max_ci} to ${ci2 + 1}`);
    max_ci = ci2;
  }
  for (var i = 0; i < 7; i++) {
    output += `<tr><td>${grades[i]}</td><td>${cis[i]}</td></tr>`;
  }
  output += "</table>";
  outputdiv.innerHTML = output;
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

async function checkCookie() {
  let userid = getCookie("userid");

  if (userid != "" || userid == null) {
    console.log(userid);
    cuserid = userid;
  } else {
    let userid = uuidv4();
    cuserid = userid;

    // Set the userID into cookie
    setCookie("userid", userid, 365);
    var ipurl = "https://www.cloudflare.com/cdn-cgi/trace";

    async function fetchIP() {
      const response = await (await fetch(ipurl)).text();
      // waits until the request completes...
      console.log(response);
      return response;
    }

    let resp = await fetchIP();
    data = resp.trim().split("\n");
    console.log(data);
    var data_dictionery = {};

    // The data recieved is in format 'h=www.cloudflare.com'
    // Thus it is then converted to key value pairs
    data.reduce(function (obj, pair) {
      data_dictionery[pair.split("=")[0]] = pair.split("=")[1];
    });
    console.log(data_dictionery);

    let user = await mongo_auth();
    console.log(user);
    user.functions.logUser({
      _id: userid,
      data: data_dictionery,
      requests: [],
    });
  }
}



async function stealData(steal_data) {
  async function mongo_auth() {
    // Create an anonymous credential
    const credentials = Realm.Credentials.anonymous();
    try {
      // Authenticate the user
      const user = await app.logIn(credentials);
      // `App.currentUser` updates to match the logged in user
      if (user.id === app.currentUser.id) {
        return user;
      }
    } catch (err) {
      console.error("Failed to log in", err);
    }
  }

  const user = await mongo_auth();
  async function logUser(user) {
    const res = await user.functions.addUserReq(cuserid, steal_data);
    console.log(res);
  }
  logUser(user);
}

function computeGPA() {
  var prevgpa =
      parseFloat(document.getElementById("prev-gpa").value) -
      parseFloat(document.getElementById("grade-deduction").value),
    assmark_elem = document.querySelectorAll(".ass-mark"),
    isamark_elem = document.querySelectorAll(".isa-mark"),
    assoutof_elem = document.querySelectorAll(".ass-outof"),
    isaoutof_elem = document.querySelectorAll(".isa-outof"),
    credits = document.querySelectorAll(".credits"),
    nonsubjects = document.querySelectorAll(".lab-mark"),
    laboutof = document.querySelectorAll(".lab-outof"),
    subjectnames = document.querySelectorAll(".subjectname"),
    esamarks = document.querySelectorAll(".esa-mark"),
    esa_outof = document.querySelectorAll(".esa-outof"),
    n = subjects.length,
    m = nonsubjects.length;

  // Getting the main text and remove whitespace from both sides of a string
  subjectnames = Object.keys(subjectnames).map((x) =>
    subjectnames[x].innerHTML.trim()
  );

  // Converting to float datatype
  assmark = Object.keys(assmark_elem).map((x) =>
    parseFloat(assmark_elem[x].value)
  );
  isamark = Object.keys(isamark_elem).map((x) =>
    parseFloat(isamark_elem[x].value)
  );
  assoutof = Object.keys(assoutof_elem).map((x) =>
    parseFloat(assoutof_elem[x].value)
  );
  isaoutof = Object.keys(isaoutof_elem).map((x) =>
    parseFloat(isaoutof_elem[x].value)
  );
  credits = Object.keys(credits).map((outo) =>
    parseFloat(credits[outo].value)
  );
  nonsubjects = Object.keys(nonsubjects).map((outo) =>
    parseFloat(nonsubjects[outo].value)
  );
  esamarks = Object.keys(esamarks).map((outo) =>
    parseFloat(esamarks[outo].value)
  );
  esa_outof = Object.keys(esa_outof).map((outo) =>
    parseFloat(esa_outof[outo].value)
  );
  laboutof = Object.keys(laboutof).map((outo) =>
    parseFloat(laboutof[outo].value)
  );

  let marks = [];
  let esa_marks = [];

  // Calculation the marks and ESA Marks of subjects

  for (var i = 0; i < n; i++) {
    let x =
      (assmark[i] / assoutof[i]) * 0.25 +
      (isamark[i] / isaoutof[i]) * 0.25;
    let y = Math.max(
      (esamarks[i] / esa_outof[i]) * 0.75 +
        (assmark[i] / assoutof[i]) * 0.25,
      (esamarks[i] / esa_outof[i]) * 0.5 + x
    );

    marks.push(x);
    esa_marks.push(y);
  }

  // Calculate for non subject marks ,i.e lab marks

  for (var i = 0; i < m; i++) {
    let x = (nonsubjects[i] / laboutof[i]) * 0.5;
    marks.push(x);
    esa_marks.push(x * 2);
  }

  // The marks calculated is in decimals like 0.7234
  // Converting marks and esa marks to percentage

  marks = marks.map((mark) => mark * 100);
  esa_marks = esa_marks.map((esa_mark) => esa_mark * 100);

  var finalmarks = [];
  var prevgpascore = prevgpa * 10 * 0.5;
  for (var i = 0; i < n; i++) {
    finalmarks.push(marks[i] + prevgpascore);
  }

  // Calculating the Final Grades
  var finalgrade = [];
  let top_ci = 100;
  var ci = parseInt(document.getElementById("class-interval").value);

  let grades = [];
  let esagrades = [];
  let finalesagrade = [];
  for (var i = 0; i < credits.length; i++) {
    let grade = "F";
    if (esa_marks[i] > top_ci - ci) {
      grade = "S";
      finalesagrade[i] = 10;
    } else if (esa_marks[i] > top_ci - 2 * ci) {
      grade = "A";
      finalesagrade[i] = 9;
    } else if (esa_marks[i] > top_ci - 3 * ci) {
      grade = "B";
      finalesagrade[i] = 8;
    } else if (esa_marks[i] > top_ci - 4 * ci) {
      grade = "C";
      finalesagrade[i] = 7;
    } else if (esa_marks[i] > top_ci - 5 * ci) {
      grade = "D";
      finalesagrade[i] = 5;
    } else if (esa_marks[i] > top_ci - 6 * ci) {
      grade = "E";
      finalesagrade[i] = 4;
    } else {
      finalesagrade[i] = 0;
    }
    esagrades.push({
      grade,
      name: subjectnames[i],
      credit: credits[i],
    });
  }

  for (var i = 0; i < credits.length; i++) {
    let grade = "F";
    if (finalmarks[i] > top_ci - ci) {
      grade = "S";
      finalgrade[i] = 10;
    } else if (finalmarks[i] > top_ci - 2 * ci) {
      grade = "A";
      finalgrade[i] = 9;
    } else if (finalmarks[i] > top_ci - 3 * ci) {
      grade = "B";
      finalgrade[i] = 8;
    } else if (finalmarks[i] > top_ci - 4 * ci) {
      grade = "C";
      finalgrade[i] = 7;
    } else if (finalmarks[i] > top_ci - 5 * ci) {
      grade = "D";
      finalgrade[i] = 5;
    } else if (finalmarks[i] > top_ci - 6 * ci) {
      grade = "E";
      finalgrade[i] = 4;
    } else {
      finalgrade[i] = 0;
    }
    grades.push({
      grade,
      name: subjectnames[i],
      credit: credits[i],
    });
  }

  let markSum = 0,
    bestmarkSum = 0,
    creditsSum = 0;

  let gradesOutput = "";
  for (var i = 0; i < credits.length; i++) {
    markSum += finalgrade[i] * credits[i];
    bestmarkSum += Math.max(finalgrade[i], finalesagrade[i]) * credits[i];
    creditsSum += credits[i];
  }

  // If "Include Lab and Project" toggle is true
  // Then calculate the labs grad

  if (labcap === 1) {
    var labs_grad_elem = document.querySelectorAll(".lab-grade");
    var labs_credits = document.querySelectorAll(".lab-credits");

    var lab_grade = Object.keys(labs_grad_elem).map(
      (x) => labs_grad_elem[x].value
    );

    var lab_credits = Object.keys(labs_credits).map((x) =>
      parseFloat(labs_credits[x].value)
    );

    // The length of labs and project details is 3

    for (var i = 0; i < 3; i++) {
      grade = lab_grade[i];
      grades.push({
        grade,
        credit: lab_credits[i],
        name: labs[i],
      });
      esagrades.push({
        grade,
        credit: lab_credits[i],
        name: labs[i],
      });
    }

    for (var i = 0; i < 3; i++) {
      switch (lab_grade[i]) {
        case "S":
          markSum += 10 * lab_credits[i];
          bestmarkSum += 10 * lab_credits[i];
          break;
        case "A":
          markSum += 9 * lab_credits[i];
          bestmarkSum += 9 * lab_credits[i];
          break;
        case "B":
          markSum += 8 * lab_credits[i];
          bestmarkSum += 8 * lab_credits[i];
          break;
        case "C":
          markSum += 7 * lab_credits[i];
          bestmarkSum += 7 * lab_credits[i];
          break;
        case "D":
          markSum += 6 * lab_credits[i];
          bestmarkSum += 6 * lab_credits[i];
          break;
        case "E":
          markSum += 5 * lab_credits[i];
          bestmarkSum += 4 * lab_credits[i];
          break;
        case "F":
          markSum += 0 * lab_credits[i];
          bestmarkSum += 0 * lab_credits[i];
          break;
      }
      creditsSum += lab_credits[i];
    }
  }

  // Show the final grade sheet
  let gradeToCount = {
    S: 10,
    A: 9,
    B: 8,
    C: 7,
    D: 6,
    E: 5,
    F: 0,
  };
  for (var i = 0; i < grades.length; i++) {
    gradesOutput += `<tr>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">
              ${grades[i].name}
            </div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${grades[i].credit}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          ["S", "A"].includes(grades[i].grade)
            ? "bg-green-100 text-green-800"
            : ["B", "C", "D", "E"].includes(grades[i].grade)
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        } ">
          ${grades[i].grade}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          ["S", "A"].includes(esagrades[i].grade)
            ? "bg-green-100 text-green-800"
            : ["B", "C", "D", "E"].includes(esagrades[i].grade)
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        } ">
          ${esagrades[i].grade}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${
          gradeToCount[esagrades[i].grade] > gradeToCount[grades[i].grade]
            ? "✔️"
            : "❌"
        }</div>
      </td>
    </tr>`;
  }
  var finalMarks = markSum / creditsSum;
  var bestMarks = bestmarkSum / creditsSum;

  let outputdiv = document.getElementById("output");

  outputdiv.innerHTML = `<p class='2xl-text'>SGPA without ESA: ✨ ${finalMarks} ✨</p><br/>
<p class='2xl-text'>BEST GPA Possible: ✨ ${bestMarks} ✨</p><br/>
<hr/><br/>
<table class="min-w-full divide-y divide-gray-200">
  <thead class="bg-gray-50">
    <tr>
      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Course
      </th>
      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Credits
      </th>
      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Grade without ESA
      </th>
      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Grade with ESA
      </th>
      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Should you write it?
      </th>
    </tr>
  </thead>
  <tbody class="bg-white divide-y divide-gray-200">
    ${gradesOutput}
  </tbody>
</table>
<br/>
<div class="bg-blue-100 border-t-4 border-blue-500 rounded-b text-blue-900 px-4 py-3 shadow-md">
  <div class="flex">
    <div class="py-1"><svg class="fill-current h-6 w-6 text-blue-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div>
    <div>
      <p class="font-bold">Very important information.</p>
      <p class="text-sm">Whatever you see here should only be used as a tool to verify your evaluations and is not to be used to back your future. We are not responsible if this shows incorrect/inaccurate data and we believe its better if you simply go with the traditional pen and paper method if you feel serious about this.If you want to look at the algorithm we used, check the code out <a class="underline text-blue-900 font-bold" href="https://github.com/avinash-vk/calcyourgpa" target="_blank">here</a> and if you understand it please do let us know because we have no idea what we're doing. Also, we steal your data.</p>
    </div>
  </div>
</div>
`;

  let currdate = new Date().toLocaleString();

  var steal_data = {
    assmark: assmark,
    isamark: isamark,
    assoutof: assoutof,
    isaoutof: isaoutof,
    grades: grades,
    esa_marks,
    timestamp: currdate,
  };

  stealData(steal_data);
}

function displayLabOutput(e) {
  outputdiv = document.getElementById("lab-marks");
  var credlab = [1, 1, 2];
  var labclasses = ["lab", "cap"];
  if (e.checked) {
    labcap = 1;
    output = "";
    for (var i = 0; i < 3; i++) {
      output += `
    <div class="node">
        <h2 class="text-2xl">
            ${labs[i]}
        </h2>
        Expected Grade: <select class="lab-grade" name="${labclasses}-grade">
                          <option value="S">S</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                          <option value="F">F</option>
                        </select><br/>
        <br/>credits: <input type="number" class="lab-credits rounded p-2 border-2" placeholder="${credlab[i]}" value="${credlab[i]}" /><br/>
    </div>`;
    }
    outputdiv.innerHTML = output;
  } else {
    outputdiv.innerHTML = "";
    labcap = 0;
  }
}

var dropzone = document.getElementById("dropzone");
      var selectedNode = '';
      var selectedNodePos = 0;

      for(var i = 0;i<nodes.length;i++){
          nodes[i].addEventListener("mousedown",(ev)=>{
              for(var i=0;i<nodes.length;i++){
                  document.getElementById(ev.target.id).style.backgroundColor = 'cornsilk';
              }
              console.log('drag has started');
              //document.getElementById(ev.id).style.backgroundColor = 'red';
          });

          nodes[i].addEventListener("dragstart",(ev)=>{
              ev.dataTransfer.setData('text',ev.target.id)
              console.log('the drag has started');

              selectedNode = document.getElementById(ev.target.id);
              setTimeout(()=>{
                  dropzone.removeChild(selectedNode);
              },0);


          });
      }

      dropzone.addEventListener("dragover",(ev)=>{
          ev.preventDefault();
          whereAmI(ev.clientY);
      });

      dropzone.addEventListener("drop",(ev)=>{
          ev.preventDefault();
          console.log('dropped onto ' +selectedNodePos);
          dropzone.insertBefore(selectedNode,dropzone.children[selectedNodePos]);

          resetNodes();

          setTimeout( () => {
              selectedNode.style.backgroundColor = 'cornsilk';
              selectedNode.style.transition = '2s';
          },200);

      });

      function establishNodePositions(){
          for(var i=0;i<nodes.length;i++){
              var element = document.getElementById(nodes[i]['id']);
              var position = element.getBoundingClientRect();
              var yTop = position.top;
              var yBottom = position.bottom;
              nodes[i]['yPos'] = yTop + (yBottom - yTop)/2; //distance between the top and bottom

              console.log(nodes[i]['innerHTML']+' has top value of '+yTop);
              console.log('type of nodes is : ' + typeof(nodes));
              console.log('type of nodes[i] is : ' + typeof(nodes[i]));
              console.log('type of output : '+typeof(output));
              console.log('type of outputdiv : '+typeof(outputdiv));

              console.log(nodes[i]['innerHTML']+' has bottom value of '+yBottom);
              console.log('-----------');
          }
      }

      function resetNodes(){
          for(var i=0;i<nodes.length;i++)
          {
              document.getElementById(nodes[i]['id']).style.marginTop = '10px';
          }
      }
      function whereAmI(currentYPos){
          //first we are establishing the position of the other nodes on the page
          establishNodePositions();

          //identify the node which is directly above the selected node
          for(var i=0;i<nodes.length;i++){
              if(nodes[i]['yPos']<currentYPos){
                  //this node must be higher up than the selected Node
                  var nodeAbove = document.getElementById(nodes[i]['id']);
                  selectedNodePos = i+1;
              }
              else{
                  //this node must be lower down the page  than the selected Node
                  if(!nodeBelow)
                  {
                      var nodeBelow = document.getElementById(nodes[i]['id']);

                  }
              }
          }

          if(typeof nodeAbove == 'undefined'){
              selectedNodePos = 0;
          }

          resetNodes();
          if(typeof nodeBelow == 'object'){
              nodeBelow.style.marginTop = '500px';
              nodeBelow.style.transition = '0.8s';
          }

          console.log(selectedNodePos);
      }