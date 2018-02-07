var config = {
    apiKey: "AIzaSyAPRgAjb6ZLEGKqkU9tjpOizwbnmFSTObI",
    authDomain: "trainschedule-1b415.firebaseapp.com",
    databaseURL: "https://trainschedule-1b415.firebaseio.com",
    projectId: "trainschedule-1b415",
    storageBucket: "",
    messagingSenderId: "393092989074"
};
firebase.initializeApp(config);
let database = firebase.database();

//function takes form input and creates new entry
function enterFirebase(){
    event.preventDefault();
    $("#mainTable tbody>tr").empty();
    let name = $("#name").val();
    let destination = $("#destination").val();
    let firstTrainTime = $("#firstTrainTime").val();
    let frequency = $("#frequency").val();
    database.ref().push({name:name, destination:destination, firstTrainTime:firstTrainTime, frequency:frequency});
    $("#name").val("");
    $("#destination").val("");
    $("#firstTrainTime").val("");
    $("#frequency").val("");
    populateTable();
}
//creates an interval that updates table 
function setUpdateTime(){
    let updateData = setInterval(populateTable, 60000);
}
//main function that populates table
function populateTable(){
    $("#mainTable tbody>tr").empty();
    database.ref().limitToLast(7).on("child_added", function(snapshot) {
        let container = snapshot;
        let snap = snapshot.val();
        let now = moment([snap.firstTrainTime])
        let firstTrainTimeConversion = moment(now, "hh:mm").subtract(1, "years");
        let currentFrequency =  snap.frequency
        let timeDifference = moment().diff(moment(firstTrainTimeConversion), "minutes")
        let timeRemain = timeDifference % currentFrequency;
        let minutesTillNextTrain = currentFrequency -timeRemain;
        let addMinutesToTime = moment().add(minutesTillNextTrain, "minutes");
        let nextArrival = moment(addMinutesToTime).format("hh:mm");
        let newName = $("<td>").text(snap.name);
        let newDestination = $("<td>").text(snap.destination);
        let firstTrainTime= $("<td>").text(snap.firstTrainTime);
        let frequency = $("<td>").text(snap.frequency);
        let minAway = $("<td>").text(minutesTillNextTrain);
        let newTr = $("<tr id='"+snap.name+"1'>");
        let newTh = $("th");
        let newNextArrivalTime = $("<td>").text(nextArrival);
        let newButtonTd = $("<td>");
        let newUpdateButtonTd = $("<td>");
        let newButton = $("<button>").attr("id", snap.name).text("Remove").attr("class", "removeItem");
        newButtonTd.append(newButton);
        let newUpdateButton = $("<button>").attr("name", snap.name).text("Update").attr("class", "updateItem");
        newUpdateButtonTd.append(newUpdateButton);
        newTr.append(newName).append(newDestination).append(frequency).append(newNextArrivalTime).append(minAway).append(newButtonTd).append(newUpdateButtonTd);       
        $("#tableBody").append(newTr)
        })
}
//removes selected item from firebase, fires populateTable after 
function removeFromFirebase(id){
    $("#mainTable tbody>tr").empty();
    database.ref().once("value", function(snapshot) {
        snapshot.forEach(function(child){
            let childKey = child.key;
            let childData = child.val();
                if(id === childData.name){
            database.ref(childKey).remove();
            populateTable();
                }
         });
    });
}
//main function that updates selected item
function save(e){
    event.preventDefault();
    $("#updateButton").remove();
    let target = e.target;
    let key = target.getAttribute("name");
    let name = $("#name").val();
    let destination = $("#destination").val();
    let firstTrainTime = $("#firstTrainTime").val();
    let frequency = $("#frequency").val();
    database.ref(key).update({name:name, destination:destination, firstTrainTime:firstTrainTime, frequency:frequency, dateAdded:firebase.database.ServerValue.TIMESTAMP});
    $("#name").val("");
    $("#destination").val("");
    $("#firstTrainTime").val("");
    $("#frequency").val("");
    populateTable();
}
//function gets chosen element, populates form for user to change ***doesn't change firebase yet
function updateFirebaseData(name){
    database.ref().once("value", function(snapshot){
        snapshot.forEach(function(child){
            let childKey = child.key;
            let childData = child.val();
            if(name === childData.name){
                let saveButton = $("<button>").attr("name", childKey).attr("id", "updateButton");
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
//gets chosen item and sends to function to remove item from firebase. Also removes item from table
function removeThis(e){
    $("#mainTable tbody>tr").empty();
    let target = e.target;
    let id = target.getAttribute("id");
    let itemToRemove = "#"+ id +"1";
    $(itemToRemove).remove();
    removeFromFirebase(id);
    
}
//gets chosen item and sends to function to update item in firebase.
function updateItem(e){
    let target = e.target;
    let name = target.getAttribute("name");
    updateFirebaseData(name)
}
populateTable();
setUpdateTime();
$(document).on("click",".removeItem", function(e){removeThis(e)});
$(document).on("click",".updateItem", function(e){updateItem(e)});
$(document).on("click","#updateButton", function(e){save(e)})
    
    