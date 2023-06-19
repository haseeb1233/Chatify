
let userCard=document.getElementById('user-card')
let totalUser=document.getElementById('user-count');


let togglebtn = document.querySelectorAll(".checkbox");
let body = document.querySelector("body");
let dash = document.querySelector(".tabs")
let usercolor = document.querySelector(".userCount")
let a = usercolor.textContent

togglebtn.forEach(function (btn) {
  btn.addEventListener("click", function () {
    body.classList.toggle("dark");
    dash.classList.toggle("dark")
    usercolor.classList.toggle("color")
  });
});

document.querySelector(".logo").addEventListener("click",()=>{
    window.location.href = "./chatpage.html"
});

fetch('http://localhost:8080/chat/',{
    method:'GET',
        headers:{'Content-type':'Application/json',"authorization":`bearer ${JSON.parse(localStorage.getItem("token"))}`},"refresh":`bearer ${JSON.parse(localStorage.getItem("refreshToken"))}`,
})
.then((res)=>{
    return res.json();
})
.then((data)=>{
    // Userdata=needData.data;
    console.log(data)
    displayUsers(data);

})
.catch((err)=>{
    console.log({'fetch-msg':err.message});
})

function Count(count){
    totalUser.innerText=count
}

// getting all users

function displayUsers(data) {
    userCard.innerHTML="";
    data.forEach((element)=>{
        let card=document.createElement('div');
        card.className="block";
        let imgbx=document.createElement('div');
        imgbx.className="imgbx";
        let image=document.createElement('img');
        image.setAttribute("src",element.avtar);
        imgbx.append(image);
        let details=document.createElement('div');
        details.className="details"
        let listhead=document.createElement('div');
        listhead.className="listHead"
        let name=document.createElement("h4");
        name.innerText=element.name;
        listhead.append(name);
        details.append(listhead);
        let ban=document.createElement('div');
        ban.className="ban";
        let button=document.createElement("button");
        button.setAttribute("data-method", element.isBlocked ? "Unblock" : "Blocked");
        button.setAttribute("data-email", element.email);
        button.className="ban-user"
        button.innerText= element.isBlocked ? "Unblock" : "Block";
        ban.append(button);
        card.append(imgbx,details,ban);
        userCard.append(card);
        totalUser.innerText=data.length;
    })

    let block=document.querySelectorAll(".ban-user")

    block.forEach((element)=>{
        
        element.addEventListener("click",(e)=>{
            let moethod=e.target.getAttribute("data-method");
            let email=e.target.getAttribute("data-email");
            let Met = moethod == "Blocked" ?  "POST" : "DELETE";
            let url = moethod == "Blocked" ?   "blockUser" : "unBlockUser"
            console.log(email,Met,url,moethod);
            fetch(`http://localhost:8080/user/${url}`,{
                method:get,
                headers:{'Content-type':'Application/json',"authorization":`bearer ${JSON.parse(localStorage.getItem('token'))}`,"refresh":`bearer ${JSON.parse(localStorage.getItem("refreshToken"))}`},
                body:JSON.stringify({email:email})
            }).then((res)=>res.json())
            .then((data)=>{
                console.log(data);
                location.reload()
            })
        });
    })
}

