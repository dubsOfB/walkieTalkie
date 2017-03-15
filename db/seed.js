// let sampleData = require('./sampleLocationData.json');
// let Au = require('./schema/ActiveUsers.js');
// let i = require('./schema/Interests.js');
// let Ui = require('./schema/UserInterests.js');

// Au.destroy({truncate : true})
//   .then(res => {
//     for (var i = 0; i < 100; i++) {
//       let room = Math.floor(Math.random() * 20) + 1
//       Au.create({
//         userId : i+100,
//         latitude : sampleData[i].latitude,
//         longitude : sampleData[i].longitude,
//         roomId : room
//       })
//     };
//   })


// let iI = [
  
//   'Soccer', 'Basketball', 'Football', 'Baseball', 'Hockey', 
//   'Beer', 'Wine', 'Tequila', 'Vodka', 'Whiskey', 'Shopping', 'Shoes', 'Style',
//   'Country', 'Hiphop', 'RnB', 'Jazz', 'EDM', 'Classical', 'Rock', 
//   'Java', 'C', 'Node', 'Ruby', 'Javascript', 'Photography'
// ];

// iI.forEach(int => {
//   i.create({
//     interest : int
//   })
// })


// let id = [1,8,15,22,29,36,43,50,57,64,71,78,85,92,99,106,113,120,127,134,141,148,155,162,169,176]

// for(let j = 0; j<100; j++){
//  let clone = [...id];
//  let (let i = 0; i < 6; i++) {
//    let rand = Math.floor(Math.random()*clone.length+1);
//    Ui.create({
//      userId : j+100,
//      interestId : rand
//    });
//    clone.splice(rand, 1);
//  }
// }
