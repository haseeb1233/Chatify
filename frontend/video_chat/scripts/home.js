const roomID = document.getElementById('roomID');
const joinRoom = document.getElementById('join-room');
const create = document.getElementById("create-room");

const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('room');
console.log(room);


    Swal.fire({
        title: `Creating your room<br>Please Wait !!`,
        // html: 'I will close in <b></b> milliseconds.',
        timer: 500,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    })
    setTimeout(()=>{
        fetching();
    },100)
    

    async function fetching(){
        try {
            // const room = Math.floor(Math.random() * 900) + 100;
            const request = await fetch(`http://localhost:8080/create`, {
                method:"POST",
                headers: {
                    "content-type": "application/json"
                },
                body:JSON.stringify({roomID:room,type:'video'})
            });
            const response = await request.json();
            if(response.ok){
                setTimeout(()=>{
                    window.location.href = `./chat.html?roomID=${room}`;
                },2000)
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong!',
                })
            }
            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            })
        }
    }



joinRoom.addEventListener("click", () => {

    Swal.fire({
        title: 'Enter Your Room Number',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off',
            placeholder: 'XXX',
            required: true,
            id: 'roomID',
            typeof: 'number'
        },
        showCancelButton: true,
        confirmButtonText: 'Join',
        showLoaderOnConfirm: true,

        allowOutsideClick: () => !Swal.isLoading()
    })
    document.getElementsByClassName('swal2-confirm swal2-styled')[0].addEventListener("click", async() => {
        const roomID = document.getElementById('roomID').value;
        try {
            const request = await fetch(`http://localhost:8080/join`, {
                method:"POST",
                headers: {
                    "content-type": "application/json"
                },
                body:JSON.stringify({roomID:roomID,type:'video'})
            });
            const response = await request.json();
            if(response.ok){
                window.location.href = `./chat.html?roomID=${roomID}`;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: `${response.msg}`,
                })
            }
            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            })
        }
    })
})



async function userLoggedIn() {
    const token = localStorage.getItem("token");
    const request = await fetch(`https://talkies-authentication-server-1.onrender.com/user/check`,{
      method:"POST",
      headers:{
        "content-type":"application/json",
      },
      body:JSON.stringify({token:token})
    });
  
    const response = await request.json();
    if(!response.ok){
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please Login First",
      });
      setTimeout(()=>{
        
        window.location.href = "./login.html";
      },3000)
    }
  }


//   userLoggedIn();