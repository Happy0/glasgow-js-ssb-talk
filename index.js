const ssbClient = require('ssb-client');
const pull = require('pull-stream');

function getUserLikesStream(sbot, userId) {
  let userStream = sbot.createUserStream(userId);
  return pull(userStream, pull.filter(isLikeMsg))
}

function isLikeMsg(msg) {
  return msg.value && msg.value.content && msg.value.content.vote
}

function addToLikesCount(likesDict, author) {
  if (likesDict[author]) {
    likesDict[author] = likesDict[author] + 1;
  } else {
    likesDict[author] = 1;
  }

  return likesDict;
}

function authorDisplayName(authorId) {

}

function likeMsgAuthorThrough(sbot) {
  var likedMsgStream = pull.asyncMap((msg, cb) => sbot.get(msg.value.content.vote.link, cb));

  return pull(likedMsgStream, pull.map(msg => {
  //  console.log(msg.author);
    return msg.author
  }))
}


ssbClient((err, sbot) => {

  if (err) {
    console.log("aw naw");
    console.log(err);
    process.exit(1);
  }

  sbot.whoami((err, ident) => {
    if (err) {
      console.log("Aw naw, I don't know who I am.")
      console.log(err);
      process.exit(1);
    }

    var likesCount = {};

    let userLikeStream = getUserLikesStream(sbot, ident);
    let authorLikesStream = pull(userLikeStream, likeMsgAuthorThrough(sbot));

    // pull(authorLikesStream,
    //    pull.reduce((count, author) => count + 1, 0, (err, result) => console.log("count: " + result)
    //  ));

    pull(authorLikesStream,
       pull.reduce(addToLikesCount, {}, (err, result) => console.log(result)
     ));

  });


});
