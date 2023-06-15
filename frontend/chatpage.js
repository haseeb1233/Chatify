let globleData,globleRoom,selfObjectId;
const socket = io("http://localhost:7890/", { transports: ["websocket"] })
const allConver = document.querySelector(".chat-list");
const allChat = document.querySelector(".chat-box");
const chatSend = document.querySelector(".sendChat");
const myPhoto = document.getElementById("myAvtar");
const video = document.getElementById("video");
// ----------------- All the requirements here --------------------------------
window.onload = () =>{ 
const urlParams =  new URLSearchParams(window.location.search)
selfObjectId = urlParams.get('id') || JSON.parse(localStorage.getItem("selfObjectId"))
const myAvtar = urlParams.get('avtar') || JSON.parse(localStorage.getItem("myAvtar"))
const token = urlParams.get('token') || JSON.parse(localStorage.getItem("token")) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYmFodmlrYSIsImlkIjoiNjQ1NGRiOTg2OTExYTFlMTY3ZDdlYzk1Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE2ODM1MzIxOTQsImV4cCI6MTY4MzUzMzk5NH0.oC960LXcbOtsVI7I_CVXC7ma4g6wBK0_X6wx-e3Pht0"
const refreshToken = urlParams.get('refreshToken') || JSON.parse(localStorage.getItem("refreshToken"))

localStorage.setItem("token", JSON.stringify(token));
localStorage.setItem("refreshToken", JSON.stringify(refreshToken));
localStorage.setItem("myAvtar", JSON.stringify(myAvtar));
localStorage.setItem("selfObjectId", JSON.stringify(selfObjectId));

myPhoto.innerHTML=`<img src="${myAvtar}" alt="" class="cover">`;
fetchConnectins(JSON.parse(localStorage.getItem("token")));
}

async function fetchConnectins(token){
        let data = await fetch(`http://localhost:7890/chat/getCon`,{
        method:'POST',
        headers:{'Content-type':'Application/json',"authorization":`bearer ${token}`},
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
        }
    }
})


function lodeMsg(inp,frendId){
console.log(inp,frendId);
    showNameAndStatus(frendId);
    socket.emit("join-oom",({selfObjectId,inp}))
    globleRoom=inp;
    fetch(`http://localhost:7890/chat/getMsg`,{
        method:'POST',
        headers:{'Content-type':'Application/json',"authorization":`bearer ${JSON.parse(localStorage.getItem('token'))}`},
        body:JSON.stringify({consId:inp})
    }).then((res)=>res.json()).then((res)=>{
        // console.log(res);
        rennderMsg(res);
    }).catch((err)=>console.log(err))
}

chatSend.addEventListener("click",()=>{
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
    socket.emit("chat",{room:globleRoom,msg:chatInp,sendBy:selfObjectId,time:Date(Date.now())});
    chatInp.value=""
})

video.addEventListener("click", ()=>{
    window.location.href=`../frontend/video_chat/index.html?room=${globleRoom}`
    //frontend/video_chat/index.html
    //frontend/chatpage.js
})
// all the functions witch are suppoting the rendr of dom here
function renderConnectins(data){
    allConver.innerHTML="";
    let ar =  data.map((ele)=>{
        return(`
    <div class="block active"  onClick="lodeMsg(${ele.consId},'${ele.frendId}')">
        <div class="imgbx">
            <img src="${ele.userId==selfObjectId ? ele.frendAvtar : ele.myAvtar}" alt="" class="cover">
        </div>
        <div class="details">
            <div class="listhead">
                <h4>${ele.userId==selfObjectId ? ele.frendName : ele.myName}</h4>
                <p class="time">${ele.lastTime.slice(16).slice(0,5)}</p>
            </div>
            <div class="message">
                <p>${ele.lastMsg}</p>
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
    fetch(`http://localhost:7890/chat/findOne/${inp}`,{
        method:'GET',
        headers:{'Content-type':'Application/json',"authorization":`bearer ${JSON.parse(localStorage.getItem('token'))}`},
    }).then((res)=>res.json()).then((res)=>{
        console.log(res);
        let sta = res[0].isActive ? "online" : "offline";
            document.querySelector(".name").innerHTML=`${res[0].name} <br><span>${sta}</span>`;
            document.getElementById("userAvtar").innerHTML=`<img src="${res[0].avtar}" alt="" class="cover">`;
    }).catch((err)=>console.log(err)) 
}