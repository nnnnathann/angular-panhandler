![panhandler](http://nnnnathann.github.io/angular-panhandler/images/brand.jpg)
==================

<p align="center" style="text-align: center;">
    <img src="http://nnnnathann.github.io/angular-panhandler/images/demo.gif" alt="Demo"/>
</p>

Pan Directive for Angular.js - Drag to scroll behavior

### Usage

Add ```panhandler``` as an attribute to the element on which you would like to enable panning.  Thats it!  If you would like to make sure your inner content fits to a certain size, you can specify a ```content-{width|height}``` attribute.


### Advanced Usage

If you need to disable panning (temporarily) for some of the content elements,
you can set the `preventPan` attribute on the panhandler element to true.

This is useful in the case that you would like to enable drag-n-drop
for some elements within the pannable area.

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

### Prevent Example

HTML

```html
<div ng-app="pannableExamples">
  <div ng-controller="Example1">
    <input name="preventPan" type="checkbox" ng-model="preventPanCheck" />
    <label for="preventPan">Prevent Panning</label>
    <div panhandler content-width="100em" prevent-pan="{{ preventPanCheck }}">
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
