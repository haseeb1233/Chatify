http://127.0.0.1:5500/index.html 

var globleData
var globleRoom
var selfObjectId;
const socket = io("https://whatsapp-clone-9hg3.onrender.com/", { transports: ["websocket"] })
const allConver = document.querySelector(".chat-list");
const allChat = document.querySelector(".chat-box");
const chatIn = document.querySelector(".chatInp");
const chatSend = document.querySelector(".sendChat");
const myPhoto = document.getElementById("myAvtar");
const video = document.getElementById("video");
const vice = document.getElementById("vice");
const logout = document.getElementById("logout");
const groupIcon = document.getElementById("group-icon");

let sendAudio = new Audio("./audio/send.mp3")
let getAudio = new Audio("./audio/geting.mp3")

// ----------------- All the requirements here --------------------------------
window.onload = () => { 
const urlParams =  new URLSearchParams(window.location.search)
selfObjectId = urlParams.get('id') || JSON.parse(localStorage.getItem("selfObjectId"))
const myAvtar = urlParams.get('avtar') || JSON.parse(localStorage.getItem("myAvtar"))
const token = urlParams.get('token') || JSON.parse(localStorage.getItem("token"))
const refreshToken = urlParams.get('refreshToken') || JSON.parse(localStorage.getItem("refreshToken"))
const myName = urlParams.get('myName') || JSON.parse(localStorage.getItem("myName"))
const role = urlParams.get('role') || JSON.parse(localStorage.getItem("role"))
 console.log(myAvtar)
localStorage.setItem("token", JSON.stringify(token));
localStorage.setItem("refreshToken", JSON.stringify(refreshToken));
localStorage.setItem("myAvtar", JSON.stringify(myAvtar));
localStorage.setItem("selfObjectId", JSON.stringify(selfObjectId));
localStorage.setItem("myName", JSON.stringify(myName));
localStorage.setItem("role", JSON.stringify(role));

myPhoto.innerHTML=`<img src="${myAvtar}" alt="" class="cover">`;
fetchConnectins(JSON.parse(localStorage.getItem("token")));
}

async function fetchConnectins(token){
        let data = await fetch(`https://whatsapp-clone-9hg3.onrender.com/chat/getCon`,{
        method:'POST',
        headers:{'Content-type':'Application/json',"authorization":`bearer ${JSON.parse(localStorage.getItem("token"))}`},"refresh":`bearer ${JSON.parse(localStorage.getItem("refreshToken"))}`,
        }).then(response => response.json());
        console.log(data);
        console.log("in  fetchConnectins",token);
        renderConnectins(data);
}
socket.on("message", (data) =>{
    console.log(data);
    if(data.room == globleRoom){
        if(data.name != selfObjectId){
            let div = document.createElement("div")
            div.className = "messagehere mymessage"
            let message =document.createElement("p");
            message.innerHTML = data.msg;
            let br = document.createElement("br");
            let span = document.createElement("span");
            span.innerHTML = data.time.slice(16).slice(0,5)
            message.appendChild(br);
            message.appendChild(span);
            div.appendChild(message);
            allChat.appendChild(div);
            getAudio.play();
        }
    }
})


function lodeMsg(inp,frendId){
console.log(inp,frendId);
        showNameAndStatus(frendId);
    socket.emit("join-oom",({selfObjectId,inp}))
    globleRoom=inp;
    fetch(`https://whatsapp-clone-9hg3.onrender.com/chat/getMsg`,{
        method:'POST',
        headers:{'Content-type':'Application/json',"authorization":`bearer ${JSON.parse(localStorage.getItem('token'))}`,"refresh":`bearer ${JSON.parse(localStorage.getItem("refreshToken"))}`},
        body:JSON.stringify({consId:inp})
    }).then((res)=>res.json()).then((res)=>{
        // console.log(res);
        rennderMsg(res);
    }).catch((err)=>console.log(err))
}

let send = ()=>{
    const chatInp = document.querySelector(".chatInp").value
    let div = document.createElement("div")
    div.className = "messagehere messagefriend"
    let message =document.createElement("p");
    message.innerHTML = chatInp;
    let br = document.createElement("br");
    let span = document.createElement("span");
    span.innerHTML = Date(Date.now()).slice(16).slice(0,5);
    message.appendChild(br);
    message.appendChild(span);
    div.appendChild(message);
    allChat.appendChild(div);
    allChat.scrollTop = allChat.scrollHeight
    sendAudio.play();
    socket.emit("chat",{room:globleRoom,msg:chatInp,sendBy:selfObjectId,time:Date(Date.now())});
    document.querySelector(".chatInp").value = ""
}

var input = document.getElementById("myInput");
input.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("myBtn").click();
  }
});

video.addEventListener("click", ()=>{
    socket.emit("chat",{room:globleRoom,msg:`<a href="./videocall.html">join video call</a>`,sendBy:selfObjectId,time:Date(Date.now())});
    window.location.href=`./videocall.html`
})
vice.addEventListener("click", ()=>{
    socket.emit("chat",{room:globleRoom,msg:`<a href="http://127.0.0.1:5501/frontend/vice.html?room=${globleRoom}&usertype=t">join vice call</a>`,sendBy:selfObjectId,time:Date(Date.now())});
    window.location.href=`http://127.0.0.1:5501/frontend/vice.html?room=${globleRoom}&usertype=c`
})
// all the functions witch are suppoting the rendr of dom here
function renderConnectins(data){
    allConver.innerHTML="";
    let ar =  data.map((ele)=>{
        return(`
    <div class="block active"  onClick="lodeMsg(${ele.consId},'${selfObjectId == ele.frendId ? ele.userId : ele.frendId}')">
        <div class="imgbx">
            <img src="${ele.userId==selfObjectId ? ele.frendAvtar : ele.myAvtar}" alt="" class="cover">
        </div>
        <div class="details">
            <div class="listhead">
                <h4>${ele.userId==selfObjectId ? ele.frendName : ele.myName}</h4>
                <p class="time">${ele.lastTime.slice(16).slice(0,5)}</p>
            </div>
            <div class="message">
                <p>${ele.lastMsg ? ele.lastMsg : ""}</p>
            </div>
        </div>
    </div>
    `)
    }).join("")
   allConver.innerHTML=ar;
}
function rennderMsg(res){
    allChat.innerHTML="";
    let ar =  res.map((ele)=>{
        return (
            `<div class="messagehere ${ele.sendBy == selfObjectId ? "messagefriend":"mymessage"}">
            <p>${ele.msg}<br><span>${ele.time.slice(16).slice(0,5)}</span></p>
            </div>`
        )
    }).reverse().join("")
    allChat.innerHTML=ar;
}
function showNameAndStatus(inp){
    fetch(`https://whatsapp-clone-9hg3.onrender.com/chat/findOne/${inp}`,{
        method:'GET',
        headers:{'Content-type':'Application/json',"authorization":`bearer ${JSON.parse(localStorage.getItem('token'))}`,"refresh":`bearer ${JSON.parse(localStorage.getItem("refreshToken"))}`},
    }).then((res)=>res.json()).then((res)=>{
        console.log(res);
        localStorage.setItem("myName",JSON.stringify(res[0].name))
        let sta = res[0].isActive ? "online" : "offline";
            document.querySelector(".name").innerHTML=`${res[0].name} <br><span>${sta}</span>`;
            document.getElementById("userAvtar").innerHTML=`<img src="${res[0].avtar}" alt="" class="cover">`;
    }).catch((err)=>console.log(err)) 
}

logout.addEventListener("click",()=>{
    fetch(`https://whatsapp-clone-9hg3.onrender.com/user/logout`,{
        method:'POST',
        headers:{'Content-type':'Application/json',"authorization":`bearer ${JSON.parse(localStorage.getItem('refreshToken'))}`,"refresh":`bearer ${JSON.parse(localStorage.getItem("refreshToken"))}`},
    }).then((res)=>res.json()).then((res)=>{
        console.log(res);
        localstorage.clear()
        window.location.href = "./index.html"
    }).catch((err)=>console.log(err)) 
});

groupIcon.addEventListener("click", () => {
  window.location.href = "./addCon.html";
});
document.getElementById("admin").addEventListener("click", () => {
    let role = JSON.parse(localStorage.getItem('role'));
    console.log(role,"inside abmin button");
    if(role == "admin" || role == "administreter"){
        window.location.href = "./adminpage.html";
    }else{
        alert("you are not admin")
    }
})



