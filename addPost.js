var auth = firebase.auth();
var db = firebase.firestore();
// Get the modal
var modal = document.getElementById('id01');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function addImg(){
    const selectedFile = document.getElementById('file').files[0];
    var storageRef = firebase.storage().ref();
var mountainImagesRef = storageRef.child('adPics/'+ selectedFile.name);

mountainImagesRef.put(selectedFile)
.then(function(snapshot) {
 alert('Ad Posted!');
 addPost();
});

}


function addPost(){

    


    var userUid = localStorage.getItem('uid');
    var title = document.getElementById("title").value;
    var price = document.getElementById("price").value;
    var picName = document.getElementById('file').files[0].name
    getUserName(userUid,title,price,picName);

   
}
function getUserName(uid,title,price,picName) {


    db.collection("users").where("uid", "==", uid)
        .get()
        .then(function (userSnapshot) {
            userSnapshot.forEach(function (userDoc) {
                console.log()
                addPostToDB(title,price,userDoc.data().userName,userDoc.data().phone,uid,picName)
              
                
            });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
}

function addPostToDB(title,price,name,phone,uid,picName){
    db.collection("posts").add({
        title,
        price,
        name,
        phone,
        uid,
        picName,
        type : "public"
    })
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
            location = "./home.html"
        })
}
