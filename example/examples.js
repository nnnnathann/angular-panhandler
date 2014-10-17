/*globals angular */
(function(){
  'use strict';
  angular.module('pannableExamples', ['panhandler'])
    .controller('Example1', function Example1($scope) {
      $scope.gridItems = generateGrid(30);
    });
  function generateGrid(count){
    var items = [];
    for(var i=0;i<count;i++){
      items.push({ label: count });
    }
    return items;
  }
}());
