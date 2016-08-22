angular.module('main').controller('GroupListCtrl', function($ionicModal, $scope, GroupFactory, $state, GroupService){

	$ionicModal.fromTemplateUrl('js/group/groupList/groupModal.html', {
	scope: $scope,
	animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	$scope.openModal = function() {
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};
	// Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});
	// Execute action on hide modal
	$scope.$on('modal.hidden', function() {
		// Execute action
	});
	// Execute action on remove modal
	$scope.$on('modal.removed', function() {
		// Execute action
	});

	$scope.createGroup = function(){
		$scope.closeModal();
		$state.go('tab.create-group');
	};
	$scope.joinGroup = function(){
		$scope.closeModal();
		$state.go('tab.join-group');
	};

  $scope.$on("$ionicView.enter", function () {
    GroupService.getCurrentGroups()
    .then(function(groups){
      $scope.groups = groups;
    })
    .catch(function(err){
      $.growl.error({location: 'tc', message: err.message});
    });

    // GroupFactory.fetchCurrentGroups()
    //   .then(function(groups) {
    //   	$scope.groups = groups;
    //   	$scope.groups.sort(function(a,b){
    //   		return b.lastMessage.timeStamp - a.lastMessage.timeStamp;
    //   	});

    //   })
    //   .catch(function(err){
    //   	console.error(err);
    //   });
  });


});



