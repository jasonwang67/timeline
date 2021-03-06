angular.module('main')
.factory('CameraFactory', function($rootScope, Upload, $cordovaGeolocation, $q, $state, CameraService, AuthService, $cordovaCapture) {
  function capitalize (string) {
     return string.charAt(0).toUpperCase() + string.slice(1);
  }

  var CameraFactory = {};

  var ref = firebase.database().ref();

  function toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.send();
  }

  CameraFactory.captureMedia = function(type) {
    var options = {
        limit: 1
    };
    var position;
    console.log(capitalize(type));
    var capFunc = "capture" + capitalize(type)
    CameraFactory.getLocation()
      .then(function(pos){
        position = pos;
        return $cordovaCapture[capFunc](options)
      })        
      .then(function(videoData) {
        if (type === 'image') type = 'photo'
          toDataUrl(videoData[0].fullPath, function(base64Img){
            CameraFactory.storeMedia(base64Img, type, position)
          })
      })
      .catch(function(err){
        console.error(err)
      })
  }

  CameraFactory.storeMedia = function(mediaData, type, location) {
    AuthService.getLoggedInUser()
    .then(function(user){
      var mediaObj = {
          mediaUrl: mediaData,
          mediaType: type,
          member: {
            id: user.uid,
            name: user.name
          },
          location: location,
          timeStamp: Date.now(),
          upvotes: 0
      }
      if (type !== 'message') {
        mediaObj.body = "Sent a " + type;
      }
      CameraService.media = mediaObj;

      $state.go('tab.send-media')
    })

  };

  CameraFactory.sendMedia = function(groupCodes, media){

    var file = Upload.dataUrltoBlob(media.mediaUrl, Date.now());
    var uploadPic = storageRef.child('media/' + file.name).put(file);

    uploadPic.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function(snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        // leave in here for compression/speed testing
        console.log('Upload is ' + progress + '% done');

      }, function(err) {
        $.growl.error({location: 'tc', message: err.message});
      }, function() {
        var lastMessage;
        if (media.mediaType == "photo") {
          lastMessage = {
            message: media.member.name + " sent a photo",
            timeStamp: media.timeStamp
          }
        } else {
          lastMessage = {
            message: media.member.name + " sent a video",
            timeStamp: media.timeStamp
          }
        }
        var downloadURL = uploadPic.snapshot.downloadURL;
        media.mediaUrl = downloadURL;
        groupCodes.forEach(function(code){
          // set the last message for a group
          ref.child('groups/' + code + '/lastMessage').set(lastMessage);

          // store the reference
          ref.child('groupCollages/' + code + '/' + media.timeStamp).set(media);
        })

      });

  }

  // consider moving to new factory
  CameraFactory.getLocation = function () {
    var options = {timeout: 10000, enableHighAccuracy: true};
    // var positionObj = $q.defer()
    return $cordovaGeolocation.getCurrentPosition(options)
      .then(function(position){
        return position;
      })

  };

  CameraFactory.changeGroupPicture = function(imageData, groupCode) {

    var file = Upload.dataUrltoBlob(imageData, groupCode);
    var uploadPic = storageRef.child('groupProfilePictures/' + file.name).put(file);

    uploadPic.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function(snapshot) {
      }, function(err) {
        console.error(err);
      }, function() {
        // Upload completed successfully, now we can get the download URL
        var downloadURL = uploadPic.snapshot.downloadURL;
        //stores a reference to the download URL in the group's db
        ref.child('groups/' + groupCode + '/mediaUrl').set(downloadURL);
    });
  };

  CameraFactory.changeProfilePicture = function(imageData, userId) {

    var file = Upload.dataUrltoBlob(imageData, userId);
    var uploadPic = storageRef.child('profilePictures/' + file.name).put(file);

    uploadPic.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function(snapshot) {
      }, function(err) {
        console.error(err);
      }, function() {
        // Upload completed successfully, now we can get the download URL
        var downloadURL = uploadPic.snapshot.downloadURL;
        //stores a reference to the download URL in the group's db
        ref.child('users/' + userId + '/photoUrl').set(downloadURL);
    });

  };


  return CameraFactory;

});
