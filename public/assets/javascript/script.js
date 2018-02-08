var config = {
    apiKey: "AIzaSyAPRgAjb6ZLEGKqkU9tjpOizwbnmFSTObI",
    authDomain: "trainschedule-1b415.firebaseapp.com",
    databaseURL: "https://trainschedule-1b415.firebaseio.com",
    projectId: "trainschedule-1b415",
    storageBucket: "",
    messagingSenderId: "393092989074"
};

firebase.initializeApp(config);
const database = firebase.database();
var provider = new firebase.auth.GithubAuthProvider();
 firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
      //continue to website
  } else if(!user){
    firebase.auth().signInWithPopup(provider).then(function(result) {
  // GitHub Access Token. 
  var token = result.credential.accessToken;
  var user = result.user;
  // ...
}).catch(function(error) {
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  var credential = error.credential;
  // ...
});
  }
});
function signOut(){
    firebase.auth().signOut().then(function() {
    console.log("signed out")
}).catch(function(error) {
  // An error happened.
});
}

// Function takes form input and creates new entry
function enterFirebase(){
    event.preventDefault();
    $("#mainTable tbody>tr").empty();
    const name = $("#name").val();
    const destination = $("#destination").val();
    const firstTrainTime = $("#firstTrainTime").val();
    const frequency = $("#frequency").val();

    database.ref().push({
        name:name, 
        destination:destination, 
        firstTrainTime:firstTrainTime, 
        frequency:frequency
    });
    $("#name").val("");
    $("#destination").val("");
    $("#firstTrainTime").val("");
    $("#frequency").val("");
    populateTable();
}

// Main function that populates table
function populateTable(){
    $("#mainTable tbody>tr").empty();
    database.ref().limitToLast(7).on("child_added", function(snapshot) {
        const snap = snapshot.val();
        const now = moment([snap.firstTrainTime])
        const firstTrainTimeConversion = moment(now, "hh:mm").subtract(1, "years");
        const currentFrequency = snap.frequency
        const timeDifference = moment().diff(moment(firstTrainTimeConversion), "minutes")
        const timeRemain = timeDifference % currentFrequency;
        const minutesTillNextTrain = currentFrequency -timeRemain;
        const addMinutesToTime = moment().add(minutesTillNextTrain, "minutes");
        const nextArrival = moment(addMinutesToTime).format("hh:mm");
        const newName = $("<td>").text(snap.name);
        const newDestination = $("<td>").text(snap.destination);
        const frequency = $("<td>").text(snap.frequency);
        const minAway = $("<td>").text(minutesTillNextTrain);
        const newTr = $("<tr id='"+snap.name+"1'>");
        const newNextArrivalTime = $("<td>").text(nextArrival);
        const newButtonTd = $("<td>");
        const newUpdateButtonTd = $("<td>");
        const newButton = $("<button>").attr("id", snap.name);

        newButton.text("Remove").attr("class", "removeItem");
        newButtonTd.append(newButton);
        const newUpdateButton = $("<button>").attr("name", snap.name).text("Update").attr("class", "updateItem");
        
        newUpdateButtonTd.append(newUpdateButton);
        newTr.append(newName).append(newDestination).append(frequency).append(newNextArrivalTime).append(minAway).append(newButtonTd).append(newUpdateButtonTd);       
        $("#tableBody").append(newTr)
        })
}
// Removes selected item from firebase, fires populateTable after
function removeFromFirebase(id){
    $("#mainTable tbody>tr").empty();
    database.ref().once("value", function(snapshot) {
        snapshot.forEach(function(child){
            const childKey = child.key;
            const childData = child.val();

                if(id === childData.name){
            database.ref(childKey).remove();
            populateTable();
                }
         });
    });
}
// Main function that updates selected item
function save(e){
    event.preventDefault();
    $("#updateButton").remove();
    const target = e.target;
    const key = target.getAttribute("name");
    const name = $("#name").val();
    const destination = $("#destination").val();
    const firstTrainTime = $("#firstTrainTime").val();
    const frequency = $("#frequency").val();

    database.ref(key).update({name: name, destination: destination, firstTrainTime:firstTrainTime, frequency:frequency, dateAdded:firebase.database.ServerValue.TIMESTAMP});
    $("#name").val("");
    $("#destination").val("");
    $("#firstTrainTime").val("");
    $("#frequency").val("");
    populateTable();
}
// Function gets chosen element, populates form for user to change ***
// Doesn't change firebase yet
function updateFirebaseData(name){
    database.ref().once("value", function(snapshot){
        snapshot.forEach((child) => {
            const childKey = child.key;
            const childData = child.val();

            if(name === childData.name){
                const saveButton = $("<button>").attr("name", childKey).attr("id", "updateButton");
                
                saveButton.text("Save");
                $("#submitForm").append(saveButton);
                $("#name").val(childData.name);
                $("#destination").val(childData.destination);
                $("#firstTrainTime").val(childData.firstTrainTime);
                $("#frequency").val(childData.frequency);
            }
        });
    });
    $("#tableBody").empty();
    populateTable();
}
// Gets chosen item and sends to function to remove item from firebase
// Also removes item from table
function removeThis(e){
    $("#mainTable tbody>tr").empty();
    const target = e.target;
    const id = target.getAttribute("id");
    const itemToRemove = `#${id}1`;

    $(itemToRemove).remove();
    removeFromFirebase(id);
    
}
// Gets chosen item and sends to function to update item in firebase.
function updateItem(e){
    const target = e.target;
    const name = target.getAttribute("name");

    updateFirebaseData(name)
}
// Creates an interval that updates table
function setUpdateTime(){
    const updateData = setInterval(populateTable, 60000);
}
populateTable();
setUpdateTime();

$(document).on("click", "#signOut", signOut);
$(document).on("click", "#enter", enterFirebase);
$(document).on("click",".removeItem", function(e){removeThis(e)});
$(document).on("click",".updateItem", function(e){updateItem(e)});
$(document).on("click","#updateButton", function(e){save(e)})
    
    