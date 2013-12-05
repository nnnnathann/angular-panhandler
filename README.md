Panhandler
==================

![demo](http://nnnnathann.github.io/angular-panhandler/images/demo.gif)

Pan Directive for Angular.js - Drag to scroll behavior

### Usage

Add ```panhandler``` as an attribute to the element on which you would like to enable panning.  Thats it!  If you would like to make sure your inner content fits to a certain size, you can specify a ```content-{width|height}``` attribute.

### Example

Javascript

```javascript
angular.module('pannableExamples', ['panhandler'])
    .controller('Example1', function Example1($scope) {
      $scope.gridItems = generateGrid(30);
    });
```

HTML

```html
<div ng-app="pannableExamples">
  <div ng-controller="Example1">
    <div panhandler content-width="100em">
      Stuff to pan around!
    </div>
  </div>
</div>
```

### Development

For development, you will need node.js installed.

After that, run the following from the repo directory

```bash
npm install grunt-cli -g
npm install
grunt
```

Should get you going!


### License

MIT License
