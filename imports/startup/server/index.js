import { Meteor } from 'meteor/meteor'
import { Tasks } from '/imports/api/tasks.js';

Meteor.startup(() => {
  if (Tasks.find().count() < 200) { // Add Records
    console.log("Script")
    for ( var i = 1; i <= 1000; i++ ) {
      const taskData = {
        text: getRandomText(8),
        createdAt: new Date(),
        order: Tasks.find().count(),
        owner: 'userId',
        username: 'username'
      }
      Tasks.insert(taskData)
    }
  }
})


function getRandomText(limit) {
  if (!limit) limit = 8
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < limit; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
