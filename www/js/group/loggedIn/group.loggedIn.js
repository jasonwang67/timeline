'use strict';

angular.module('main').controller('GroupLoggedInCtrl',['$scope', '$state', 'GroupFactory', '$log', '$rootScope', function ($scope, $state, GroupFactory, $log, $rootScope) {
	GroupFactory.fetchCurrentGroup()
	.then(function(group){
    $scope.profile.group = group;
	});

  $scope.leaveGroup = function(){
    if($rootScope.profile.isLeader) alert('You are leader! Transfer to someone else!');
    else {
      GroupFactory.leaveGroup()
      .then(function(){
        $state.go('tab.profile');
      });
    }
  };

  $scope.endGroup = function(){
    GroupFactory.endGroup()
    $state.go('tab.profile');
  };
}]);

