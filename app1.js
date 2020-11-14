var auth = firebase.auth();
var db = firebase.firestore();
var storage = firebase.storage();
var storageRef = storage.ref();
var myPostDiv= document.getElementById("my-post-div")

function signIn(){
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;

    firebase.auth().signInWithEmailAndPassword(email, pass)
    .then((user)=>{
        console.log(user)
        localStorage.setItem('uid', user.user.uid);
        window.location = "./home.html"
    })
    .catch(function(error) {
        // Handle Errors here.
       alert(error)
     });
}

function signUp(){
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    const userName = document.getElementById('userName').value;
    const phone = document.getElementById('phone').value;
 

    firebase.auth().createUserWithEmailAndPassword(email, pass)
            .then((user)=>{
                alert("User Created")

                console.log(user)
                saveUserDetailsToDB(userName, email,phone, user.user.uid);
                localStorage.setItem('uid', user.user.uid);
    
})
.catch(function(error) {
    // Handle Errors here.
    alert(error)
  });
}

/*Function to get user detials from DB*/
function getUserDetails(a) {
    var userUid = localStorage.getItem('uid');
    getUserInfo(userUid);
    if (a===0){
        getAllPosts();
    }
    else if (a===2){
        getFavPosts(userUid)
    }
    else if (a===3){
        getChats(userUid)
    }
    else {
        getMyPosts(userUid);
    }
    //getUserPosts(userUid);
}


function getChats(uid){
    db.collection("users").where("uid", "==", uid)
    .onSnapshot(function (todoSnapshot) {
        todoSnapshot.docChanges().forEach(function (change) {
            if (change.type === "added") {
                makeChatElements(change.doc.id, change.doc.data());
            }
           
        });
    });
}

function makeChatElements(docId, docData){

    var chats = docData.contacted;
    console.log(chats)
    
    for(let i = 0; i <chats.length;i++){
        db.collection("users").where("uid","==",chats[i]).get()
        .then(function (userSnapshot) {
            userSnapshot.forEach(function (usersDoc) {
            console.log(usersDoc)
            if (usersDoc.exists) {
                    
                   makeMyChats(usersDoc.id,usersDoc.data());
                }
            })
        })
    }


}

function makeMyChats(usersDocid,usersDocdata){
    var mainDiv= document.getElementById("my-chats-div")
    var div = document.createElement('div');
    div.setAttribute('class','my-chatss')
    div.innerHTML = `<span>${usersDocdata.userName}</span>`
 div.onclick= ()=>{
            showChatDetails()
            localStorage.setItem('buyerDocId',usersDocid) 
    };

    mainDiv.appendChild(div)
}

function showChatDetails(){
    window.location.href = "./sellerChat.html"
}

function sellerchat(){

    var sellerUid = localStorage.getItem('uid');
    
    var buyerDocId =localStorage.getItem('buyerDocId');


    firebase.firestore().collection("users").doc(buyerDocId)
    .get()
    .then((user)=>{
        var buyerUid = user.data().uid
        console.log(buyerUid)

        var div = document.getElementById('ch');
        div.innerHTML += `<div class="m1">You are chatting with ${user.data().userName}</div>`
        getSellerChatMessages(sellerUid,buyerUid)


        document.getElementById('send').onclick = ()=>{
           var message =  document.getElementById('message-box').value;
           uploadSellerMessageToDB(message, sellerUid, buyerUid)
           document.getElementById('message-box').value = ""
        }
    })

}


function getSellerChatMessages(sellerUid,buyerUid){

db.collection('messages').where("buyerUid", "==", buyerUid).where("sellerUid", "==", sellerUid).orderBy('timestamp', 'asc')
.onSnapshot(function(querySnapshot) {
    querySnapshot.docChanges().forEach(function(doc) {
        console.log(doc.doc.data())
        if(doc.type === "added"){
        makeSellerChatMessages(doc.doc.data())
        }   
    });
});
}

function makeSellerChatMessages(messageDoc){
var div = document.getElementById('cb');
var span = document.createElement('span')
span.innerHTML = `${messageDoc.message}`
span.setAttribute('class','chat-item')

var myUid = localStorage.getItem('uid');
if (messageDoc.senderUid === myUid){
    span.style = `     margin-left : 50% ;
    margin-right : 10px;
    border-radius: 8px 8px 0 8px; 
    background-color: #3498DB;`
}
else {
    span.style = " margin-left : 10px;border-radius: 8px 8px  8px 0;background-color: gray;"
}

div.appendChild(span)
}


function uploadSellerMessageToDB(message, sellerUid, buyerUid){

var senderUid = localStorage.getItem("uid");

db.collection("messages").add({
    message,
    sellerUid,
    buyerUid,
    senderUid,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
})
    .then(function (docRef) {
       console.log("message sent")
    });

}














/*Function to get user info from DB*/




function getUserInfo(uid) {
    db.collection("users").where("uid", "==", uid)
        .get()
        .then(function (userSnapshot) {
            userSnapshot.forEach(function (userDoc) {
                //userDoc.data() 
                //userDoc.id
                greetUser(userDoc.data());
            });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
}

/*Function to greet user*/
function greetUser(user) {
    if(user){
    document.getElementById('greet-user').innerHTML += `Welcome to OLX, ${user.userName}`
}
else{
    document.getElementById('greet-user').innerHTML += `Welcome to OLX`
}
}

/*Function to get todos from DB*/
function getAllPosts() {
    db.collection("posts").where("type", "==", "public")
        .onSnapshot(function (todoSnapshot) {
            todoSnapshot.docChanges().forEach(function (change) {
                if (change.type === "added") {
                    makeTodoElements(change.doc.id, change.doc.data());
                }
                if (change.type === "modified") {
                    console.log("Modified todo: ", change.doc.data());
                    updateTodoToDOM(change.doc.data(), change.doc.id);
                }
                if (change.type === "removed") {
                    console.log("Removed city: ", change.doc.data(), change.doc.id);
                    deleteTodoFromDOM(change.doc.id);
                }
            });
        });

}


/*Function to make todo elements*/
function makeTodoElements(docId, docData) {
    console.log(docData.picName)

    firebase.storage().ref().child("adPics/"+docData.picName).getDownloadURL()
    .then(function(url) {
        console.log(url)
        var img = document.getElementById(docId);
        img.src = url;
      }).catch(function(error) {
        // Handle any errors
      });
      var mainDiv= document.getElementById("post-div")
      var div = document.createElement('div');
      
      var heart = document.createElement('img');
   
   div.setAttribute('class', 'box');
   div.innerHTML = `<img id="${docId}" class="adPic" alt="No Preview" /><hr>
   <span class="ad-title"><b>${docData.title}</b></span><br>
   <span class="ad-price">$${docData.price} </span><br>   
   <span class="ad-cp"><b>Contact Person: </b>${docData.name}</span><br>
   <span class="ad-cpp"><b>Contact Phone: </b>${docData.phone}</span><br>`


   var unliked = "https://firebasestorage.googleapis.com/v0/b/learning-firebase-4c152.appspot.com/o/heart.png?alt=media&token=8794af81-8f09-4464-9722-5ef78de1fe43"
  var liked = "https://firebasestorage.googleapis.com/v0/b/learning-firebase-4c152.appspot.com/o/heartfull.png?alt=media&token=d2d92ff3-fdff-401a-b06a-e992ff4546b9"
    
  
      
    
    
    var uid = localStorage.getItem('uid')
    db.collection("users").where("uid", "==", uid)
    .get()
    .then(function (userSnapshot) {
        userSnapshot.forEach(function (userdoc) {
           // .onSnapshot(function (todoSnapshot) {
            //    todoSnapshot.docChanges().forEach(function (userdoc) {
                    console.log(userdoc.data().hearts)
    
                    var arr = userdoc.data().hearts || [];
                    let a  = arr.indexOf(docId) || [];
                    if (a === -1){
                        heart.src= unliked;
                        heart.onclick = ()=>{
                            event.stopPropagation()
                            heartIt(userdoc.id,docId)
                            heart.src= liked;
                        }
                        }
                        else{
                            heart.src= liked;
                            heart.onclick = ()=>{
                                event.stopPropagation()
                                unHeartIt(userdoc.id,docId)
                                heart.src= unliked;
                            }
                        }
                        
                    // if (userdoc.type === "added") {
                    //     makeTodoElements(userdoc.doc.id, userdoc.doc.data());
                    // }
                })
            
        })
   


        div.appendChild(heart)
        heart.setAttribute('id','heart')
        div.onclick= ()=>{
            showAdDetails()
            localStorage.setItem('docId',docId) 
    };
   mainDiv.appendChild(div)
}



function getMyPosts(uid) {
    db.collection("posts").where("uid", "==", uid)
        .onSnapshot(function (todoSnapshot) {
            todoSnapshot.docChanges().forEach(function (change) {
                if (change.type === "added") {
                    makeMyPosts(change.doc.id, change.doc.data());
                }
                if (change.type === "modified") {
                    console.log("Modified todo: ", change.doc.data());
                    updatePostToDOM(change.doc.data(), change.doc.id);
                }
                if (change.type === "removed") {
                    console.log("Removed city: ", change.doc.data(), change.doc.id);
                    deletePostFromDOM(change.doc.id);
                }
            });
        });

}



function makeMyPosts(docId, docData) {

    firebase.storage().ref().child('adPics/'+docData.picName).getDownloadURL()
    .then(function(url) {
        console.log(url)
        var img = document.getElementById(docId + '1');
        img.src = url;
      }).catch(function(error) {
        // Handle any errors
      });
    var mainDiv= document.getElementById("my-post-div")
    var div = document.createElement('div');

    
   div.innerHTML = `<img id="${docId}1" class="adPic" alt="No Preview"/><hr>
   <span class="ad-title"><b>${docData.title}</b></span><br>
   <span class="ad-price">$${docData.price} </span><br>   
   <span class="ad-cp"><b>Contact Person: </b>${docData.name}</span><br>
   <span class="ad-cpp"><b>Contact Phone: </b>${docData.phone}</span>
   <button class="btn" style="margin :0px; width: 40%;" onclick="deletePost('${docId}')">Delete Post</button><br><br>`

   localStorage.setItem('docId',docId) 
    
   div.setAttribute('id', docId);
   div.setAttribute('class', 'box');
   mainDiv.appendChild(div)
}



function getFavPosts(uid) {

    db.collection("users").where("uid", "==", uid).get()
    .then(function (userSnapshot) {
        userSnapshot.forEach(function (userDoc) {
            //userDoc.data() 
            //userDoc.id
            var hearts = userDoc.data().hearts;
            favss(hearts)
        });
    })
    .catch(function (error) {
        console.log("Error getting documents: ", error);
    });
}
function favss(hearts){
    for(let i = 0; i <hearts.length;i++){
        db.collection("posts").doc(hearts[i])
            .get()
            .then(function(posts) {
                if (posts.exists) {
                   makeMyFavPosts(posts.id,posts.data());
                };
            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
    }
}



function makeMyFavPosts(docId, docData) {
    

    firebase.storage().ref().child('adPics/'+docData.picName).getDownloadURL()
    .then(function(url) {
        console.log(url)
        var img = document.getElementById(docId + '1');
        img.src = url;
      }).catch(function(error) {
        // Handle any errors
      });
    var mainDiv= document.getElementById("my-fav-div")
    var div = document.createElement('div');

    div.innerHTML = `<img id="${docId}1" class="adPic" alt="No Preview"/><hr>
   <span class="ad-title"><b>${docData.title}</b></span><br>
   <span class="ad-price">$${docData.price} </span><br>   
   <span class="ad-cp"><b>Contact Person: </b>${docData.name}</span><br>
   <span class="ad-cpp"><b>Contact Phone: </b>${docData.phone}</span><br>`

   localStorage.setItem('docId',docId) 
    
   div.setAttribute('id', docId);
   div.setAttribute('class', 'box');
   mainDiv.appendChild(div)
}

function deletePost(docId){
    console.log(docId)
    db.collection("posts").doc(docId).delete()
    .then(function () {
        console.log("Document successfully deleted!");
    }).catch(function (error) {
        console.error("Error removing document: ", error);
    });
}

function editPost(docId){


}

function deletePostFromDOM(docId){
var childToDelete = document.getElementById(docId);
    myPostDiv.removeChild(childToDelete);
}










const forgetPass = ()=>{
    var email = prompt("Enter Email Address:");
   
  firebase.auth().sendPasswordResetEmail(email)
  .then(function() {
   alert("Email sent")
  }).catch(function(error) {
    alert(error)
  });
}





/*Function to save user details to DB*/
function saveUserDetailsToDB(userName, userEmail,phone, uid) {
    db.collection("users").add({
        userName,
        userEmail,
        phone,
        uid
    })
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
            location = './home.html';
        })
}





function signOut(){
    firebase.auth().signOut().then(function() {
        location = "./index.html"
      }).catch(function(error) {
        // An error happened.
      });
}




function showAdDetails(){
    window.location.href ="./adDetails.html"
}
function postAd(){
    window.location.href ="./addPost.html"
}

function mydata(){
   
    var docss = localStorage.getItem('docId')
    db.collection("posts").doc(docss).get()
    .then(function(docData) {
     if (docData.exists) {
         firebase.storage().ref().child('adPics/'+docData.data().picName).getDownloadURL()
    .then(function(url) {
        console.log(url)
        var img = document.getElementById(docss + '1');
        img.src = url;
      })
      .catch(function(error) {
        // Handle any errors
      });
         console.log("Document data:", docData.data());
         var div = document.getElementById('ad-view')
         div.innerHTML = `<div class="ad-view-div1"><img class="ad-view-div1-img" id="${docss}1" alt="No Preview"/></div>
         <div class="ad-view-div2">
                <div class="ad-view-div2a">
                    <div><h1>${docData.data().title}</h1></div>
                    <div><h2>$${docData.data().price} </h2></div>
                </div><br>
                <div class="ad-view-div2b">
                     <div><b>Contact Person: </b>${docData.data().name}</div>
                     <div><b>Contact Phone: </b>${docData.data().phone}</div>
                 </div>
                <div class="ad-view-div2c">
                     <button onclick="contactSeller()" class="btn" style="margin:0px;">Contact <b>${docData.data().name}</b></div>
                 </div>
         </div>`   
    
     } else {
         console.log("No such document!");
     }
 }).catch(function(error) {
     console.log("Error getting document:", error);
 });
}


function heartIt(userdocId,adDocId){
    db.collection("users").doc(userdocId).get()
    .then((user)=>{
        console.log(user.data().hearts)
        var arr = user.data().hearts || []
        arr.push(adDocId)
        db.collection("users").doc(userdocId).update({ hearts: arr  });
    })

}

function unHeartIt(userdocId,adDocId){
    db.collection("users").doc(userdocId).get()
    .then((user)=>{
        console.log(user.data().hearts)
        var arr = user.data().hearts
        let a  = arr.indexOf(adDocId);
        arr.splice(a,1);
        
        db.collection("users").doc(userdocId).update({ hearts: arr  });
    })
}


// slideshow
var slideIndex = 0;


function showSlides() {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none"; 
  }
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1} 
  slides[slideIndex-1].style.display = "block"; 
  setTimeout(showSlides, 2000); // Change image every 2 seconds
}


function contactSeller(){
    window.location.href ="./chat.html"
}


function chat(){

        var buyerUid = localStorage.getItem('uid');
        var sellerAdDocId = localStorage.getItem('docId');
        console.log(buyerUid)
        console.log("seller doc" +sellerAdDocId)
        firebase.firestore().collection("posts").doc(sellerAdDocId)
        .get()
        .then((ad)=>{
            var sellerUid = ad.data().uid
            console.log(sellerUid)
            makeChatHeader(ad.data())
            getChatMessages(sellerUid,buyerUid,ad.data().title)


            document.getElementById('send').onclick = ()=>{
               var message =  document.getElementById('message-box').value;
               uploadMessageToDB(message, sellerUid, buyerUid)
               document.getElementById('message-box').value = ""
            }
        })

}

function makeChatHeader(ad){

var div = document.getElementById('ch');
         div.innerHTML += `<div><span class = "m1">You are chatting with ${ad.name}</span></div>`
}
function getChatMessages(sellerUid,buyerUid, adTitle){

    db.collection('messages').where("buyerUid", "==", buyerUid).where("sellerUid", "==", sellerUid).orderBy('timestamp', 'asc')
    .onSnapshot(function(querySnapshot) {
        querySnapshot.docChanges().forEach(function(doc) {
            console.log(doc.doc.data())
            if(doc.type === "added"){
            makeChatMessages(doc.doc.data())
            }   
        });
    });
}

function makeChatMessages(messageDoc){
    var div = document.getElementById('cb');
    var span = document.createElement('span')
    span.innerHTML = `${messageDoc.message}`
    span.setAttribute('class','chat-item')

    var myUid = localStorage.getItem('uid');
    if (messageDoc.senderUid === myUid){
        span.style = `     margin-left : 50% ;
        margin-right : 10px;
        border-radius: 8px 8px 0 8px; 
        background-color: #3498DB;`
    }
    else {
        span.style = " margin-left : 10px;border-radius: 8px 8px  8px 0;background-color: gray;"
    }

   div.appendChild(span)
}


function uploadMessageToDB(message, sellerUid, buyerUid){

    var senderUid = localStorage.getItem("uid");

    db.collection("messages").add({
        message,
        sellerUid,
        buyerUid,
        senderUid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
        .then(function (docRef) {
           console.log("message sent")
        });




        db.collection("users").where("uid","==",sellerUid).get()
        .then(function (userSnapshot) {
                userSnapshot.forEach(function (doc) {
                    console.log(doc.data())
                    var arr = doc.data().contacted || []
                    var a = arr.indexOf(buyerUid)
                    if( a === -1){
                    arr.push(buyerUid)
                    db.collection("users").doc(doc.id).update({ contacted: arr  });
                    console.log("done")
                    }
                    else {
                        console.log("contacted")
                    }
    
})
})
}