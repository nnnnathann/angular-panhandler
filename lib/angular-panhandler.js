/*globals angular, document, window, DocumentTouch, navigator */
(function(){
  'use strict';
  angular.module('panhandler', [])
    .directive('panhandler', function PanhandlerFactory($document) {
      PanhandlerFactory.$inject = ['$document'];
      function Panhandler ($el, attr, $scope) {
        this.$el = $el;
        this.contentWidth = attr.contentWidth;
        this.contentHeight = attr.contentHeight;

        this.curr = [];
        this.origin = [];
        this.startPos = [];
        this.pos = [0,0];

        this.touch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
        this.has3d = has3d();
        this.overEvent = 'mouseover';
        this.downEvent = this.touch ? 'touchstart':'mousedown';
        this.upEvent = this.touch ? 'touchend':'mouseup';
        this.moveEvent = this.touch ? 'touchmove':'mousemove';
        this.noTouch = vendorize('user-select', 'none');

        this.$scope = $scope;

        this.startBind = angular.bind(this,this.startDrag);
        this.endBind = angular.bind(this,this.endDrag);
        this.updateBind = angular.bind(this,this.updateDrag);
        this.mouseOutBind = angular.bind(this,this.mouseOut);
        this.mouseOverBind = angular.bind(this,this.mouseOver);

        this.init();
      }
      Panhandler.prototype = {
        init: function(){
          this.$el.css('overflow','hidden');
          this.draggable = angular.element('<div class="panhandler-wrap"></div>');
          this.draggable.css(this.noTouch);
          if(this.contentWidth){
            this.draggable.css('width', this.contentWidth);
          }
          if(this.contentHeight){
            this.draggable.css('height', this.contentHeight);
          }
          this.grabCursor();
          angular.forEach(this.$el.contents(),angular.bind(this,function(c){
            this.draggable.append(c);
          }));
          this.draggable.append('<div style="clear:both;"></div>');
          this.$el.append(this.draggable);
          this.makeInteractive();
        },
        tick: function(){
          if(this.origin.length && this.dirty){
            this.updatePosition();
            this.dirty = false;
          }
          this.loop = window.requestAnimationFrame(angular.bind(this,this.tick));
        },
        updatePosition: function(){
          var x = this.clampX(this.startPos[0] + (this.curr[0] - this.origin[0]));
          var y = this.clampY(this.startPos[1] + (this.curr[1] - this.origin[1]));
          this.pos = [x,y];
          if(this.has3d){
            var trans = vendorize('transform','translate3d(' + x + 'px,' + y + 'px, 0)');
            this.draggable.css(trans);
          }else{
            this.draggable.css('margin-left',x + 'px');
            this.draggable.css('margin-top',y + 'px');
          }
        },
        clampX: function(val){
          return Math.max(Math.min(0,val),this.minX);
        },
        clampY: function(val){
          return Math.max(Math.min(0,val),this.minY);
        },
        cacheBounds: function(){
          this.contentDimensions = [getWidth(this.draggable),getHeight(this.draggable)];
          this.viewDimensions = [getOffsetWidth(this.$el),getOffsetHeight(this.$el)];
          this.minX = Math.min(this.viewDimensions[0] - this.contentDimensions[0],0);
          this.minY = Math.min(this.viewDimensions[1] - this.contentDimensions[1],0);
        },
        isPrevented: function () {
          return this.$scope.preventPan === true || this.$scope.preventPan === 'true';
        },
        startDrag: function(e){
          if (this.isPrevented()) {
            return false;
          }
          if ( this.findParentNoScroll(e.target, 'iCannotScroll') ) {
            return false;
          }
          this.origin = this.positionFromEvent(e);
          this.startPos = [this.pos[0],this.pos[1]];
          this.cacheBounds();
          this.grabbingCursor();
          $document.on(this.moveEvent,this.updateBind);
          $document.on(this.upEvent,this.endBind);
          this.$el.on('mouseout',this.mouseOutBind);
          this.updateDrag(e);
          this.tick();
        },
        findParentNoScroll: function(el, cls){
          while ( !el.classList.contains(cls) && (el = el.parentElement) && !el.classList.contains(cls));
          return el;
        },
        updateDrag: function(e){
          var curr = this.positionFromEvent(e);
          if(curr[0] !== this.curr[0] || curr[1] !== this.curr[1]){
            this.dirty = true;
            this.curr = [curr[0],curr[1]];
          }
        },
        endDrag: function(){
          this.origin = [];
          this.curr = [];
          this.grabCursor();
          $document.off(this.moveEvent,this.updateBind);
          $document.off(this.upEvent,this.endBind);
          this.$el.off('mouseout',this.mouseOutBind);
          window.cancelAnimationFrame(this.loop);
        },
        positionFromEvent: function(e){
          return [
            e.pageX || e.originalEvent.touches[0].pageX,
            e.pageY || e.originalEvent.touches[0].pageY
          ];
        },
        makeInteractive: function(){
          this.draggable.on(this.downEvent,this.startBind);
          if (!this.touch) {
            this.draggable.on(this.overEvent,this.mouseOverBind);
          }
          this.$el.on('$destroy',this.destroy);
        },
        mouseOver: function (e) {
          this.grabCursor();
        },
        mouseOut: function(e){
          var el = e.target;
          var isParent = el.querySelector && el.querySelector('.panhandler-wrap');
          if(isParent || e.toElement === undefined || e.toElement.tagName === 'HTML'){
            this.endDrag();
          }
        },
        destroy: function(){
          if(this.loop){
            window.cancelAnimationFrame(this.loop);
          }
          $document.off(this.upEvent,this.endBind);
        },
        grabCursor: function(){
          var isWk = navigator.userAgent.match(/WebKit/);
          var isFF = navigator.userAgent.match(/Gecko/);
          var cursor = 'move';
          if (this.isPrevented()) {
            cursor = '';
          } else if (isWk) {
            cursor = '-webkit-grab';
          }else if(isFF){
            cursor = '-moz-grab';
          }
          this.draggable.css('cursor',cursor);
        },
        grabbingCursor: function(){
          var isWk = navigator.userAgent.match(/WebKit/);
          var isFF = navigator.userAgent.match(/Gecko/);
          if(isWk){
            this.draggable.css('cursor','-webkit-grabbing');
          }else if(isFF){
            this.draggable.css('cursor','-moz-grabbing');
          }else{
            this.draggable.css('cursor','move');
          }
        }
      };
      return {
        scope: {
          preventPan: '@preventPan'
        },
        link: function link(scope,element,attr){
          setTimeout(function(){
            new Panhandler(element, attr, scope);
          });
        }
      };
    });

    // Util
    function getWidth($el){
      return $el[0].scrollWidth;
    }
    function getHeight($el){
      return $el[0].scrollHeight;
    }
    function getOffsetWidth($el){
      if(typeof $el.width === 'function'){
        return $el.offsetParent().width();
      }else{
        return $el[0].offsetWidth;
      }
    }
    function getOffsetHeight($el){
      if(typeof $el.height === 'function'){
        return $el.offsetParent().height();
      }else{
        return $el[0].offsetHeight;
      }
    }
    function hashString(str){
      var hash = 0, i, ch, l;
      if (str.length === 0) return hash;
      for (i = 0, l = str.length; i < l; i++) {
        ch  = str.charCodeAt(i);
        hash  = ((hash<<5)-hash)+ch;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }

    // Prefix CSS
    var vendorize = (function(){
      var vendors = ['-webkit-','-moz-','-ms-',''];
      return function vendorize(prop,val){
        var out = {};
        angular.forEach(vendors,function(v){
          out[v + prop] = val;
        });
        return out;
      };
    }());

    // Request Animation Frame Polyfill
    (function() {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame =
              window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());

    // Modernizr test for 3D Transforms
    function has3d() {
      var el = document.createElement('p'), doeshave, transforms = {
        'webkitTransform':'-webkit-transform',
        'OTransform':'-o-transform',
        'msTransform':'-ms-transform',
        'MozTransform':'-moz-transform',
        'transform':'transform'
      };
      // Add it to the body to get the computed style.
      document.body.insertBefore(el, null);
      for (var t in transforms) {
        if (el.style[t] !== undefined) {
          el.style[t] = "translate3d(1px,1px,1px)";
          doeshave = window.getComputedStyle(el).getPropertyValue(transforms[t]);
        }
      }
      document.body.removeChild(el);
      return (doeshave !== undefined && doeshave.length > 0 && doeshave !== "none");
    }
}());
