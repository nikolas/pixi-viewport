'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PIXI = require('pixi.js');
var exists = require('exists');

var Drag = require('./drag');
var Pinch = require('./pinch');
var Clamp = require('./clamp');
var ClampZoom = require('./clamp-zoom');
var Decelerate = require('./decelerate');
var Bounce = require('./bounce');
var Snap = require('./snap');
var SnapZoom = require('./snap-zoom');
var Follow = require('./follow');
var Wheel = require('./wheel');
var MouseEdges = require('./mouse-edges');

var PLUGIN_ORDER = ['drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'bounce', 'snap-zoom', 'clamp-zoom', 'snap', 'clamp'];

var Viewport = function (_PIXI$Container) {
    _inherits(Viewport, _PIXI$Container);

    /**
     * @extends PIXI.Container
     * @extends EventEmitter
     * @param {object} [options]
     * @param {number} [options.screenWidth=window.innerWidth]
     * @param {number} [options.screenHeight=window.innerHeight]
     * @param {number} [options.worldWidth=this.width]
     * @param {number} [options.worldHeight=this.height]
     * @param {number} [options.threshold = 5] number of pixels to move to trigger an input event (e.g., drag, pinch)
     * @param {(PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle)} [options.forceHitArea] change the default hitArea from world size to a new value
     * @param {PIXI.ticker.Ticker} [options.ticker=PIXI.ticker.shared] use this PIXI.ticker for updates
     * @fires clicked
     * @fires drag-start
     * @fires drag-end
     * @fires pinch-start
     * @fires pinch-end
     * @fires snap-start
     * @fires snap-end
     * @fires snap-zoom-start
     * @fires snap-zoom-end
     * @fires bounce-x-start
     * @fires bounce-x-end
     * @fires bounce-y-start
     * @fires bounce-y-end
     * @fires wheel
     * @fires wheel-scroll
     * @fires mouse-edge-start
     * @fires mouse-edge-end
     */
    function Viewport(options) {
        _classCallCheck(this, Viewport);

        options = options || {};

        var _this = _possibleConstructorReturn(this, (Viewport.__proto__ || Object.getPrototypeOf(Viewport)).call(this));

        _this.plugins = [];
        _this._screenWidth = options.screenWidth;
        _this._screenHeight = options.screenHeight;
        _this._worldWidth = options.worldWidth;
        _this._worldHeight = options.worldHeight;
        _this.hitAreaFullScreen = exists(options.hitAreaFullScreen) ? options.hitAreaFullScreen : true;
        _this.forceHitArea = options.forceHitArea;
        _this.threshold = exists(options.threshold) ? options.threshold : 5;
        _this.listeners();

        /**
         * active touch point ids on the viewport
         * @type {number[]}
         * @readonly
         */
        _this.touches = [];

        _this.ticker = options.ticker || PIXI.ticker.shared;
        _this.ticker.add(function () {
            return _this.update();
        });
        return _this;
    }

    /**
     * update animations
     * @private
     */


    _createClass(Viewport, [{
        key: 'update',
        value: function update() {
            if (!this._pause) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = PLUGIN_ORDER[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var plugin = _step.value;

                        if (this.plugins[plugin]) {
                            this.plugins[plugin].update(this.ticker.elapsedMS);
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                if (!this.forceHitArea) {
                    this.hitArea.x = this.left;
                    this.hitArea.y = this.top;
                    this.hitArea.width = this.worldScreenWidth;
                    this.hitArea.height = this.worldScreenHeight;
                }
            }
        }

        /**
         * use this to set screen and world sizes--needed for pinch/wheel/clamp/bounce
         * @param {number} screenWidth
         * @param {number} screenHeight
         * @param {number} [worldWidth]
         * @param {number} [worldHeight]
         */

    }, {
        key: 'resize',
        value: function resize(screenWidth, screenHeight, worldWidth, worldHeight) {
            this._screenWidth = screenWidth || window.innerWidth;
            this._screenHeight = screenHeight || window.innerHeight;
            this._worldWidth = worldWidth;
            this._worldHeight = worldHeight;
            this.resizePlugins();
        }

        /**
         * called after a worldWidth/Height change
         * @private
         */

    }, {
        key: 'resizePlugins',
        value: function resizePlugins() {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = PLUGIN_ORDER[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var type = _step2.value;

                    if (this.plugins[type]) {
                        this.plugins[type].resize();
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }

        /**
         * screen width in screen pixels
         * @type {number}
         */

    }, {
        key: 'listeners',


        /**
         * add input listeners
         * @private
         */
        value: function listeners() {
            var _this2 = this;

            this.interactive = true;
            if (!this.forceHitArea) {
                this.hitArea = new PIXI.Rectangle(0, 0, this.worldWidth, this.worldHeight);
            }
            this.on('pointerdown', this.down);
            this.on('pointermove', this.move);
            this.on('pointerup', this.up);
            this.on('pointerupoutside', this.up);
            this.on('pointercancel', this.up);
            this.on('pointerout', this.up);
            document.body.addEventListener('wheel', function (e) {
                return _this2.handleWheel(e);
            });
            this.leftDown = false;
        }

        /**
         * handle down events
         * @private
         */

    }, {
        key: 'down',
        value: function down(e) {
            if (e.data.originalEvent instanceof MouseEvent && e.data.originalEvent.button == 0) {
                this.leftDown = true;
            }

            if (e.data.pointerType !== 'mouse') {
                this.touches.push(e.data.pointerId);
            }

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = PLUGIN_ORDER[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var type = _step3.value;

                    if (this.plugins[type]) {
                        this.plugins[type].down(e);
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            if (this.countDownPointers() === 1) {
                this.last = { x: e.data.global.x, y: e.data.global.y };
                this.clickedAvailable = true;
            } else {
                this.clickedAvailable = false;
            }
        }

        /**
         * whether change exceeds threshold
         * @private
         * @param {number} change
         */

    }, {
        key: 'checkThreshold',
        value: function checkThreshold(change) {
            if (Math.abs(change) >= this.threshold) {
                return true;
            }
            return false;
        }

        /**
         * handle move events
         * @private
         */

    }, {
        key: 'move',
        value: function move(e) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = PLUGIN_ORDER[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var type = _step4.value;

                    if (this.plugins[type]) {
                        this.plugins[type].move(e);
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            if (this.clickedAvailable) {
                var distX = e.data.global.x - this.last.x;
                var distY = e.data.global.y - this.last.y;
                if (this.checkThreshold(distX) || this.checkThreshold(distY)) {
                    this.clickedAvailable = false;
                }
            }
        }

        /**
         * handle up events
         * @private
         */

    }, {
        key: 'up',
        value: function up(e) {
            if (e.data.originalEvent instanceof MouseEvent && e.data.originalEvent.button == 0) {
                this.leftDown = false;
            }

            if (e.data.pointerType !== 'mouse') {
                for (var i = 0; i < this.touches.length; i++) {
                    if (this.touches[i] === e.data.pointerId) {
                        this.touches.splice(i, 1);
                        break;
                    }
                }
            }

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = PLUGIN_ORDER[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var type = _step5.value;

                    if (this.plugins[type]) {
                        this.plugins[type].up(e);
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            if (this.clickedAvailable && this.countDownPointers() === 0) {
                this.emit('clicked', { screen: this.last, world: this.toWorld(this.last), viewport: this });
                this.clickedAvailable = false;
            }
        }

        /**
         * handle wheel events
         * @private
         */

    }, {
        key: 'handleWheel',
        value: function handleWheel(e) {
            var result = void 0;
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = PLUGIN_ORDER[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var type = _step6.value;

                    if (this.plugins[type]) {
                        if (this.plugins[type].wheel(e)) {
                            result = true;
                        }
                    }
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            return result;
        }

        /**
         * change coordinates from screen to world
         * @param {number|PIXI.Point} x
         * @param {number} [y]
         * @returns {PIXI.Point}
         */

    }, {
        key: 'toWorld',
        value: function toWorld() {
            if (arguments.length === 2) {
                var x = arguments[0];
                var y = arguments[1];
                return this.toLocal({ x: x, y: y });
            } else {
                return this.toLocal(arguments[0]);
            }
        }

        /**
         * change coordinates from world to screen
         * @param {number|PIXI.Point} x
         * @param {number} [y]
         * @returns {PIXI.Point}
         */

    }, {
        key: 'toScreen',
        value: function toScreen() {
            if (arguments.length === 2) {
                var x = arguments[0];
                var y = arguments[1];
                return this.toGlobal({ x: x, y: y });
            } else {
                var point = arguments[0];
                return this.toGlobal(point);
            }
        }

        /**
         * screen width in world coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'moveCenter',


        /**
         * move center of viewport to point
         * @param {(number|PIXI.PointLike)} x or point
         * @param {number} [y]
         * @return {Viewport} this
         */
        value: function moveCenter() /*x, y | PIXI.Point*/{
            var x = void 0,
                y = void 0;
            if (!isNaN(arguments[0])) {
                x = arguments[0];
                y = arguments[1];
            } else {
                x = arguments[0].x;
                y = arguments[0].y;
            }
            this.position.set((this.worldScreenWidth / 2 - x) * this.scale.x, (this.worldScreenHeight / 2 - y) * this.scale.y);
            this._reset();
            return this;
        }

        /**
         * top-left corner
         * @type {PIXI.PointLike}
         */

    }, {
        key: 'moveCorner',


        /**
         * move viewport's top-left corner; also clamps and resets decelerate and bounce (as needed)
         * @param {number|PIXI.Point} x|point
         * @param {number} y
         * @return {Viewport} this
         */
        value: function moveCorner() /*x, y | point*/{
            if (arguments.length === 1) {
                this.position.set(-arguments[0].x * this.scale.x, -arguments[0].y * this.scale.y);
            } else {
                this.position.set(-arguments[0] * this.scale.x, -arguments[1] * this.scale.y);
            }
            this._reset();
            return this;
        }

        /**
         * change zoom so the width fits in the viewport
         * @param {number} [width=this._worldWidth] in world coordinates
         * @param {boolean} [center] maintain the same center
         * @return {Viewport} this
         */

    }, {
        key: 'fitWidth',
        value: function fitWidth(width, center) {
            var save = void 0;
            if (center) {
                save = this.center;
            }
            width = width || this._worldWidth;
            this.scale.x = this._screenWidth / width;
            this.scale.y = this.scale.x;
            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * change zoom so the height fits in the viewport
         * @param {number} [height=this._worldHeight] in world coordinates
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} this
         */

    }, {
        key: 'fitHeight',
        value: function fitHeight(height, center) {
            var save = void 0;
            if (center) {
                save = this.center;
            }
            height = height || this._worldHeight;
            this.scale.y = this._screenHeight / height;
            this.scale.x = this.scale.y;
            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * change zoom so it fits the entire world in the viewport
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} this
         */

    }, {
        key: 'fitWorld',
        value: function fitWorld(center) {
            var save = void 0;
            if (center) {
                save = this.center;
            }
            this.scale.x = this._screenWidth / this._worldWidth;
            this.scale.y = this._screenHeight / this._worldHeight;
            if (this.scale.x < this.scale.y) {
                this.scale.y = this.scale.x;
            } else {
                this.scale.x = this.scale.y;
            }
            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * change zoom so it fits the entire world in the viewport
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} this
         */

    }, {
        key: 'fit',
        value: function fit(center) {
            var save = void 0;
            if (center) {
                save = this.center;
            }
            this.scale.x = this._screenWidth / this._worldWidth;
            this.scale.y = this._screenHeight / this._worldHeight;
            if (this.scale.x < this.scale.y) {
                this.scale.y = this.scale.x;
            } else {
                this.scale.x = this.scale.y;
            }
            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * zoom viewport by a certain percent (in both x and y direction)
         * @param {number} percent change (e.g., 0.25 would increase a starting scale of 1.0 to 1.25)
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} the viewport
         */

    }, {
        key: 'zoomPercent',
        value: function zoomPercent(percent, center) {
            var save = void 0;
            if (center) {
                save = this.center;
            }
            var scale = this.scale.x + this.scale.x * percent;
            this.scale.set(scale);
            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * zoom viewport by increasing/decreasing width by a certain number of pixels
         * @param {number} change in pixels
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} the viewport
         */

    }, {
        key: 'zoom',
        value: function zoom(change, center) {
            this.fitWidth(change + this.worldScreenWidth, center);
        }

        /**
         * @param {object} [options]
         * @param {number} [options.width] the desired width to snap (to maintain aspect ratio, choose only width or height)
         * @param {number} [options.height] the desired height to snap (to maintain aspect ratio, choose only width or height)
         * @param {number} [options.time=1000]
         * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
         * @param {boolean} [options.removeOnComplete=true] removes this plugin after fitting is complete
         * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of the viewport
         * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
         */

    }, {
        key: 'snapZoom',
        value: function snapZoom(options) {
            this.plugins['snap-zoom'] = new SnapZoom(this, options);
            return this;
        }

        /**
         * @private
         * @typedef OutOfBounds
         * @type {object}
         * @property {boolean} left
         * @property {boolean} right
         * @property {boolean} top
         * @property {boolean} bottom
         */

        /**
         * is container out of world bounds
         * @return {OutOfBounds}
         * @private
         */

    }, {
        key: 'OOB',
        value: function OOB() {
            var result = {};
            result.left = this.left < 0;
            result.right = this.right > this._worldWidth;
            result.top = this.top < 0;
            result.bottom = this.bottom > this._worldHeight;
            result.cornerPoint = {
                x: this._worldWidth * this.scale.x - this._screenWidth,
                y: this._worldHeight * this.scale.y - this._screenHeight
            };
            return result;
        }

        /**
         * world coordinates of the right edge of the screen
         * @type {number}
         */

    }, {
        key: 'countDownPointers',


        /**
         * count of mouse/touch pointers that are down on the viewport
         * @private
         * @return {number}
         */
        value: function countDownPointers() {
            return (this.leftDown ? 1 : 0) + this.touches.length;
        }

        /**
         * array of touch pointers that are down on the viewport
         * @private
         * @return {PIXI.InteractionTrackingData[]}
         */

    }, {
        key: 'getTouchPointers',
        value: function getTouchPointers() {
            var results = [];
            var pointers = this.trackedPointers;
            for (var key in pointers) {
                var pointer = pointers[key];
                if (this.touches.indexOf(pointer.pointerId) !== -1) {
                    results.push(pointer);
                }
            }
            return results;
        }

        /**
         * clamps and resets bounce and decelerate (as needed) after manually moving viewport
         * @private
         */

    }, {
        key: '_reset',
        value: function _reset() {
            if (this.plugins['bounce']) {
                this.plugins['bounce'].reset();
                this.plugins['bounce'].bounce();
            }
            if (this.plugins['decelerate']) {
                this.plugins['decelerate'].reset();
            }
            if (this.plugins['snap']) {
                this.plugins['snap'].reset();
            }
            if (this.plugins['clamp']) {
                this.plugins['clamp'].update();
            }
            if (this.plugins['clamp-zoom']) {
                this.plugins['clamp-zoom'].clamp();
            }
            this.dirty = true;
        }

        // PLUGINS

        /**
         * removes installed plugin
         * @param {string} type of plugin (e.g., 'drag', 'pinch')
         */

    }, {
        key: 'removePlugin',
        value: function removePlugin(type) {
            if (this.plugins[type]) {
                this.plugins[type] = null;
            }
        }

        /**
         * pause plugin
         * @param {string} type of plugin (e.g., 'drag', 'pinch')
         */

    }, {
        key: 'pausePlugin',
        value: function pausePlugin(type) {
            if (this.plugins[type]) {
                this.plugins[type].pause();
            }
        }

        /**
         * resume plugin
         * @param {string} type of plugin (e.g., 'drag', 'pinch')
         */

    }, {
        key: 'resumePlugin',
        value: function resumePlugin(type) {
            if (this.plugins[type]) {
                this.plugins[type].resume();
            }
        }

        /**
         * enable one-finger touch to drag
         * @param {object} [options]
         * @param {boolean} [options.wheel=true] use wheel to scroll in y direction (unless wheel plugin is active)
         * @param {number} [options.wheelScroll=10] number of pixels to scroll with each wheel spin
         * @param {boolean} [options.reverse] reverse the direction of the wheel scroll
         * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
         */

    }, {
        key: 'drag',
        value: function drag(options) {
            this.plugins['drag'] = new Drag(this, options);
            return this;
        }

        /**
         * enable clamp to boundaries of world
         * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {object} options
         * @param {string} [options.direction=all] (all, x, or y)
         * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
         * @return {Viewport} this
         */

    }, {
        key: 'clamp',
        value: function clamp(options) {
            this.plugins['clamp'] = new Clamp(this, options);
            return this;
        }

        /**
         * decelerate after a move
         * @param {object} [options]
         * @param {number} [options.friction=0.95] percent to decelerate after movement
         * @param {number} [options.bounce=0.8] percent to decelerate when past boundaries (only applicable when viewport.bounce() is active)
         * @param {number} [options.minSpeed=0.01] minimum velocity before stopping/reversing acceleration
         * @return {Viewport} this
         */

    }, {
        key: 'decelerate',
        value: function decelerate(options) {
            this.plugins['decelerate'] = new Decelerate(this, options);
            return this;
        }

        /**
         * bounce on borders
         * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {object} [options]
         * @param {string} [options.sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
         * @param {number} [options.friction=0.5] friction to apply to decelerate if active
         * @param {number} [options.time=150] time in ms to finish bounce
         * @param {string|function} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
         * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
         * @return {Viewport} this
         */

    }, {
        key: 'bounce',
        value: function bounce(options) {
            this.plugins['bounce'] = new Bounce(this, options);
            return this;
        }

        /**
         * enable pinch to zoom and two-finger touch to drag
         * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {number} [options.percent=1.0] percent to modify pinch speed
         * @param {boolean} [options.noDrag] disable two-finger dragging
         * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of two fingers
         * @return {Viewport} this
         */

    }, {
        key: 'pinch',
        value: function pinch(options) {
            this.plugins['pinch'] = new Pinch(this, options);
            return this;
        }

        /**
         * snap to a point
         * @param {number} x
         * @param {number} y
         * @param {object} [options]
         * @param {boolean} [options.center] snap to the center of the camera instead of the top-left corner of viewport
         * @param {number} [options.friction=0.8] friction/frame to apply if decelerate is active
         * @param {number} [options.time=1000]
         * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
         * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
         * @param {boolean} [options.removeOnComplete=true] removes this plugin after snapping is complete
         * @return {Viewport} this
         */

    }, {
        key: 'snap',
        value: function snap(x, y, options) {
            this.plugins['snap'] = new Snap(this, x, y, options);
            return this;
        }

        /**
         * follow a target
         * @param {PIXI.DisplayObject} target to follow (object must include {x: x-coordinate, y: y-coordinate})
         * @param {object} [options]
         * @param {number} [options.speed=0] to follow in pixels/frame (0=teleport to location)
         * @param {number} [options.radius] radius (in world coordinates) of center circle where movement is allowed without moving the viewport
         * @return {Viewport} this
         */

    }, {
        key: 'follow',
        value: function follow(target, options) {
            this.plugins['follow'] = new Follow(this, target, options);
            return this;
        }

        /**
         * zoom using mouse wheel
         * @param {object} [options]
         * @param {number} [options.percent=0.1] percent to scroll with each spin
         * @param {boolean} [options.reverse] reverse the direction of the scroll
         * @param {PIXI.Point} [options.center] place this point at center during zoom instead of current mouse position
         * @return {Viewport} this
         */

    }, {
        key: 'wheel',
        value: function wheel(options) {
            this.plugins['wheel'] = new Wheel(this, options);
            return this;
        }

        /**
         * enable clamping of zoom to constraints
         * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {object} [options]
         * @param {number} [options.minWidth] minimum width
         * @param {number} [options.minHeight] minimum height
         * @param {number} [options.maxWidth] maximum width
         * @param {number} [options.maxHeight] maximum height
         * @return {Viewport} this
         */

    }, {
        key: 'clampZoom',
        value: function clampZoom(options) {
            this.plugins['clamp-zoom'] = new ClampZoom(this, options);
            return this;
        }

        /**
         * Scroll viewport when mouse hovers near one of the edges or radius-distance from center of screen.
         * @param {object} [options]
         * @param {number} [options.radius] distance from center of screen in screen pixels
         * @param {number} [options.distance] distance from all sides in screen pixels
         * @param {number} [options.top] alternatively, set top distance (leave unset for no top scroll)
         * @param {number} [options.bottom] alternatively, set bottom distance (leave unset for no top scroll)
         * @param {number} [options.left] alternatively, set left distance (leave unset for no top scroll)
         * @param {number} [options.right] alternatively, set right distance (leave unset for no top scroll)
         * @param {number} [options.speed=8] speed in pixels/frame to scroll viewport
         * @param {boolean} [options.reverse] reverse direction of scroll
         * @param {boolean} [options.noDecelerate] don't use decelerate plugin even if it's installed
         * @param {boolean} [options.linear] if using radius, use linear movement (+/- 1, +/- 1) instead of angled movement (Math.cos(angle from center), Math.sin(angle from center))
         */

    }, {
        key: 'mouseEdges',
        value: function mouseEdges(options) {
            this.plugins['mouse-edges'] = new MouseEdges(this, options);
            return this;
        }

        /**
         * pause viewport (including animation updates such as decelerate)
         * @type {boolean}
         */

    }, {
        key: 'screenWidth',
        get: function get() {
            return this._screenWidth;
        },
        set: function set(value) {
            this._screenWidth = value;
        }

        /**
         * screen height in screen pixels
         * @type {number}
         */

    }, {
        key: 'screenHeight',
        get: function get() {
            return this._screenHeight;
        },
        set: function set(value) {
            this._screenHeight = value;
        }

        /**
         * world width in pixels
         * @type {number}
         */

    }, {
        key: 'worldWidth',
        get: function get() {
            if (this._worldWidth) {
                return this._worldWidth;
            } else {
                return this.width;
            }
        },
        set: function set(value) {
            this._worldWidth = value;
            this.resizePlugins();
        }

        /**
         * world height in pixels
         * @type {number}
         */

    }, {
        key: 'worldHeight',
        get: function get() {
            if (this._worldHeight) {
                return this._worldHeight;
            } else {
                return this.height;
            }
        },
        set: function set(value) {
            this._worldHeight = value;
            this.resizePlugins();
        }
    }, {
        key: 'worldScreenWidth',
        get: function get() {
            return this._screenWidth / this.scale.x;
        }

        /**
         * screen height in world coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'worldScreenHeight',
        get: function get() {
            return this._screenHeight / this.scale.y;
        }

        /**
         * world width in screen coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'screenWorldWidth',
        get: function get() {
            return this._worldWidth * this.scale.x;
        }

        /**
         * world height in screen coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'screenWorldHeight',
        get: function get() {
            return this._worldHeight * this.scale.y;
        }

        /**
         * get center of screen in world coordinates
         * @type {PIXI.PointLike}
         */

    }, {
        key: 'center',
        get: function get() {
            return { x: this.worldScreenWidth / 2 - this.x / this.scale.x, y: this.worldScreenHeight / 2 - this.y / this.scale.y };
        },
        set: function set(value) {
            this.moveCenter(value);
        }
    }, {
        key: 'corner',
        get: function get() {
            return { x: -this.x / this.scale.x, y: -this.y / this.scale.y };
        },
        set: function set(value) {
            this.moveCorner(value);
        }
    }, {
        key: 'right',
        get: function get() {
            return -this.x / this.scale.x + this.worldScreenWidth;
        },
        set: function set(value) {
            this.x = value * this.scale.x - this.worldScreenWidth;
            this._reset();
        }

        /**
         * world coordinates of the left edge of the screen
         * @type {number}
         */

    }, {
        key: 'left',
        get: function get() {
            return -this.x / this.scale.x;
        },
        set: function set(value) {
            this.x = -value * this.scale.x;
            this._reset();
        }

        /**
         * world coordinates of the top edge of the screen
         * @type {number}
         */

    }, {
        key: 'top',
        get: function get() {
            return -this.y / this.scale.y;
        },
        set: function set(value) {
            this.y = -value * this.scale.y;
            this._reset();
        }

        /**
         * world coordinates of the bottom edge of the screen
         * @type {number}
         */

    }, {
        key: 'bottom',
        get: function get() {
            return -this.y / this.scale.y + this.worldScreenHeight;
        },
        set: function set(value) {
            this.y = -value * this.scale.y - this.worldScreenHeight;
            this._reset();
        }
        /**
         * determines whether the viewport is dirty (i.e., needs to be renderered to the screen because of a change)
         * @type {boolean}
         */

    }, {
        key: 'dirty',
        get: function get() {
            return this._dirty;
        },
        set: function set(value) {
            this._dirty = value;
        }

        /**
         * permanently changes the Viewport's hitArea
         * <p>NOTE: normally the hitArea = PIXI.Rectangle(Viewport.left, Viewport.top, Viewport.worldScreenWidth, Viewport.worldScreenHeight)</p>
         * @type {(PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle)}
         */

    }, {
        key: 'forceHitArea',
        get: function get() {
            return this._forceHitArea;
        },
        set: function set(value) {
            if (value) {
                this._forceHitArea = value;
                this.hitArea = value;
            } else {
                this._forceHitArea = false;
                this.hitArea = new PIXI.Rectangle(0, 0, this.worldWidth, this.worldHeight);
            }
        }
    }, {
        key: 'pause',
        get: function get() {
            return this._pause;
        },
        set: function set(value) {
            this._pause = value;
            this.interactive = !value;
        }
    }]);

    return Viewport;
}(PIXI.Container);

/**
 * fires after a mouse or touch click
 * @event Viewport#clicked
 * @type {object}
 * @property {PIXI.PointLike} screen
 * @property {PIXI.PointLike} world
 * @property {Viewport} viewport
 */

/**
 * fires when a drag starts
 * @event Viewport#drag-start
 * @type {object}
 * @property {PIXI.PointLike} screen
 * @property {PIXI.PointLike} world
 * @property {Viewport} viewport
 */

/**
 * fires when a drag ends
 * @event Viewport#drag-end
 * @type {object}
 * @property {PIXI.PointLike} screen
 * @property {PIXI.PointLike} world
 * @property {Viewport} viewport
 */

/**
 * fires when a pinch starts
 * @event Viewport#pinch-start
 * @type {Viewport}
 */

/**
 * fires when a pinch end
 * @event Viewport#pinch-end
 * @type {Viewport}
 */

/**
 * fires when a snap starts
 * @event Viewport#snap-start
 * @type {Viewport}
 */

/**
 * fires when a snap ends
 * @event Viewport#snap-end
 * @type {Viewport}
 */

/**
 * fires when a snap-zoom starts
 * @event Viewport#snap-zoom-start
 * @type {Viewport}
 */

/**
 * fires when a snap-zoom ends
 * @event Viewport#snap-zoom-end
 * @type {Viewport}
 */

/**
 * fires when a bounce starts in the x direction
 * @event Viewport#bounce-x-start
 * @type {Viewport}
 */

/**
 * fires when a bounce ends in the x direction
 * @event Viewport#bounce-x-end
 * @type {Viewport}
 */

/**
 * fires when a bounce starts in the y direction
 * @event Viewport#bounce-y-start
 * @type {Viewport}
 */

/**
 * fires when a bounce ends in the y direction
 * @event Viewport#bounce-y-end
 * @type {Viewport}
 */

/**
 * fires when for a mouse wheel event
 * @event Viewport#wheel
 * @type {object}
 * @property {object} wheel
 * @property {number} wheel.dx
 * @property {number} wheel.dy
 * @property {number} wheel.dz
 * @property {Viewport} viewport
 */

/**
 * fires when a wheel-scroll occurs
 * @event Viewport#wheel-scroll
 * @type {Viewport}
 */

/**
 * fires when a mouse-edge starts to scroll
 * @event Viewport#mouse-edge-start
 * @type {Viewport}
 */

/**
 * fires when the mouse-edge scrolling ends
 * @event Viewport#mouse-edge-end
 * @type {Viewport}
 */

module.exports = Viewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJQSVhJIiwicmVxdWlyZSIsImV4aXN0cyIsIkRyYWciLCJQaW5jaCIsIkNsYW1wIiwiQ2xhbXBab29tIiwiRGVjZWxlcmF0ZSIsIkJvdW5jZSIsIlNuYXAiLCJTbmFwWm9vbSIsIkZvbGxvdyIsIldoZWVsIiwiTW91c2VFZGdlcyIsIlBMVUdJTl9PUkRFUiIsIlZpZXdwb3J0Iiwib3B0aW9ucyIsInBsdWdpbnMiLCJfc2NyZWVuV2lkdGgiLCJzY3JlZW5XaWR0aCIsIl9zY3JlZW5IZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJfd29ybGRXaWR0aCIsIndvcmxkV2lkdGgiLCJfd29ybGRIZWlnaHQiLCJ3b3JsZEhlaWdodCIsImhpdEFyZWFGdWxsU2NyZWVuIiwiZm9yY2VIaXRBcmVhIiwidGhyZXNob2xkIiwibGlzdGVuZXJzIiwidG91Y2hlcyIsInRpY2tlciIsInNoYXJlZCIsImFkZCIsInVwZGF0ZSIsIl9wYXVzZSIsInBsdWdpbiIsImVsYXBzZWRNUyIsImhpdEFyZWEiLCJ4IiwibGVmdCIsInkiLCJ0b3AiLCJ3aWR0aCIsIndvcmxkU2NyZWVuV2lkdGgiLCJoZWlnaHQiLCJ3b3JsZFNjcmVlbkhlaWdodCIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInJlc2l6ZVBsdWdpbnMiLCJ0eXBlIiwicmVzaXplIiwiaW50ZXJhY3RpdmUiLCJSZWN0YW5nbGUiLCJvbiIsImRvd24iLCJtb3ZlIiwidXAiLCJkb2N1bWVudCIsImJvZHkiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsImhhbmRsZVdoZWVsIiwibGVmdERvd24iLCJkYXRhIiwib3JpZ2luYWxFdmVudCIsIk1vdXNlRXZlbnQiLCJidXR0b24iLCJwb2ludGVyVHlwZSIsInB1c2giLCJwb2ludGVySWQiLCJjb3VudERvd25Qb2ludGVycyIsImxhc3QiLCJnbG9iYWwiLCJjbGlja2VkQXZhaWxhYmxlIiwiY2hhbmdlIiwiTWF0aCIsImFicyIsImRpc3RYIiwiZGlzdFkiLCJjaGVja1RocmVzaG9sZCIsImkiLCJsZW5ndGgiLCJzcGxpY2UiLCJlbWl0Iiwic2NyZWVuIiwid29ybGQiLCJ0b1dvcmxkIiwidmlld3BvcnQiLCJyZXN1bHQiLCJ3aGVlbCIsImFyZ3VtZW50cyIsInRvTG9jYWwiLCJ0b0dsb2JhbCIsInBvaW50IiwiaXNOYU4iLCJwb3NpdGlvbiIsInNldCIsInNjYWxlIiwiX3Jlc2V0IiwiY2VudGVyIiwic2F2ZSIsIm1vdmVDZW50ZXIiLCJwZXJjZW50IiwiZml0V2lkdGgiLCJyaWdodCIsImJvdHRvbSIsImNvcm5lclBvaW50IiwicmVzdWx0cyIsInBvaW50ZXJzIiwidHJhY2tlZFBvaW50ZXJzIiwia2V5IiwicG9pbnRlciIsImluZGV4T2YiLCJyZXNldCIsImJvdW5jZSIsImNsYW1wIiwiZGlydHkiLCJwYXVzZSIsInJlc3VtZSIsInRhcmdldCIsInZhbHVlIiwibW92ZUNvcm5lciIsIl9kaXJ0eSIsIl9mb3JjZUhpdEFyZWEiLCJDb250YWluZXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsT0FBT0MsUUFBUSxTQUFSLENBQWI7QUFDQSxJQUFNQyxTQUFTRCxRQUFRLFFBQVIsQ0FBZjs7QUFFQSxJQUFNRSxPQUFPRixRQUFRLFFBQVIsQ0FBYjtBQUNBLElBQU1HLFFBQVFILFFBQVEsU0FBUixDQUFkO0FBQ0EsSUFBTUksUUFBUUosUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFNSyxZQUFZTCxRQUFRLGNBQVIsQ0FBbEI7QUFDQSxJQUFNTSxhQUFhTixRQUFRLGNBQVIsQ0FBbkI7QUFDQSxJQUFNTyxTQUFTUCxRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQU1RLE9BQU9SLFFBQVEsUUFBUixDQUFiO0FBQ0EsSUFBTVMsV0FBV1QsUUFBUSxhQUFSLENBQWpCO0FBQ0EsSUFBTVUsU0FBU1YsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNVyxRQUFRWCxRQUFRLFNBQVIsQ0FBZDtBQUNBLElBQU1ZLGFBQWFaLFFBQVEsZUFBUixDQUFuQjs7QUFFQSxJQUFNYSxlQUFlLENBQUMsTUFBRCxFQUFTLE9BQVQsRUFBa0IsT0FBbEIsRUFBMkIsUUFBM0IsRUFBcUMsYUFBckMsRUFBb0QsWUFBcEQsRUFBa0UsUUFBbEUsRUFBNEUsV0FBNUUsRUFBeUYsWUFBekYsRUFBdUcsTUFBdkcsRUFBK0csT0FBL0csQ0FBckI7O0lBRU1DLFE7OztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZCQSxzQkFBWUMsT0FBWixFQUNBO0FBQUE7O0FBQ0lBLGtCQUFVQSxXQUFXLEVBQXJCOztBQURKOztBQUdJLGNBQUtDLE9BQUwsR0FBZSxFQUFmO0FBQ0EsY0FBS0MsWUFBTCxHQUFvQkYsUUFBUUcsV0FBNUI7QUFDQSxjQUFLQyxhQUFMLEdBQXFCSixRQUFRSyxZQUE3QjtBQUNBLGNBQUtDLFdBQUwsR0FBbUJOLFFBQVFPLFVBQTNCO0FBQ0EsY0FBS0MsWUFBTCxHQUFvQlIsUUFBUVMsV0FBNUI7QUFDQSxjQUFLQyxpQkFBTCxHQUF5QnhCLE9BQU9jLFFBQVFVLGlCQUFmLElBQW9DVixRQUFRVSxpQkFBNUMsR0FBZ0UsSUFBekY7QUFDQSxjQUFLQyxZQUFMLEdBQW9CWCxRQUFRVyxZQUE1QjtBQUNBLGNBQUtDLFNBQUwsR0FBaUIxQixPQUFPYyxRQUFRWSxTQUFmLElBQTRCWixRQUFRWSxTQUFwQyxHQUFnRCxDQUFqRTtBQUNBLGNBQUtDLFNBQUw7O0FBRUE7Ozs7O0FBS0EsY0FBS0MsT0FBTCxHQUFlLEVBQWY7O0FBRUEsY0FBS0MsTUFBTCxHQUFjZixRQUFRZSxNQUFSLElBQWtCL0IsS0FBSytCLE1BQUwsQ0FBWUMsTUFBNUM7QUFDQSxjQUFLRCxNQUFMLENBQVlFLEdBQVosQ0FBZ0I7QUFBQSxtQkFBTSxNQUFLQyxNQUFMLEVBQU47QUFBQSxTQUFoQjtBQXJCSjtBQXNCQzs7QUFFRDs7Ozs7Ozs7aUNBS0E7QUFDSSxnQkFBSSxDQUFDLEtBQUtDLE1BQVYsRUFDQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNJLHlDQUFtQnJCLFlBQW5CLDhIQUNBO0FBQUEsNEJBRFNzQixNQUNUOztBQUNJLDRCQUFJLEtBQUtuQixPQUFMLENBQWFtQixNQUFiLENBQUosRUFDQTtBQUNJLGlDQUFLbkIsT0FBTCxDQUFhbUIsTUFBYixFQUFxQkYsTUFBckIsQ0FBNEIsS0FBS0gsTUFBTCxDQUFZTSxTQUF4QztBQUNIO0FBQ0o7QUFQTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVFJLG9CQUFJLENBQUMsS0FBS1YsWUFBVixFQUNBO0FBQ0kseUJBQUtXLE9BQUwsQ0FBYUMsQ0FBYixHQUFpQixLQUFLQyxJQUF0QjtBQUNBLHlCQUFLRixPQUFMLENBQWFHLENBQWIsR0FBaUIsS0FBS0MsR0FBdEI7QUFDQSx5QkFBS0osT0FBTCxDQUFhSyxLQUFiLEdBQXFCLEtBQUtDLGdCQUExQjtBQUNBLHlCQUFLTixPQUFMLENBQWFPLE1BQWIsR0FBc0IsS0FBS0MsaUJBQTNCO0FBQ0g7QUFDSjtBQUNKOztBQUVEOzs7Ozs7Ozs7OytCQU9PM0IsVyxFQUFhRSxZLEVBQWNFLFUsRUFBWUUsVyxFQUM5QztBQUNJLGlCQUFLUCxZQUFMLEdBQW9CQyxlQUFlNEIsT0FBT0MsVUFBMUM7QUFDQSxpQkFBSzVCLGFBQUwsR0FBcUJDLGdCQUFnQjBCLE9BQU9FLFdBQTVDO0FBQ0EsaUJBQUszQixXQUFMLEdBQW1CQyxVQUFuQjtBQUNBLGlCQUFLQyxZQUFMLEdBQW9CQyxXQUFwQjtBQUNBLGlCQUFLeUIsYUFBTDtBQUNIOztBQUVEOzs7Ozs7O3dDQUtBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ0ksc0NBQWlCcEMsWUFBakIsbUlBQ0E7QUFBQSx3QkFEU3FDLElBQ1Q7O0FBQ0ksd0JBQUksS0FBS2xDLE9BQUwsQ0FBYWtDLElBQWIsQ0FBSixFQUNBO0FBQ0ksNkJBQUtsQyxPQUFMLENBQWFrQyxJQUFiLEVBQW1CQyxNQUFuQjtBQUNIO0FBQ0o7QUFQTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBUUM7O0FBRUQ7Ozs7Ozs7OztBQW9FQTs7OztvQ0FLQTtBQUFBOztBQUNJLGlCQUFLQyxXQUFMLEdBQW1CLElBQW5CO0FBQ0EsZ0JBQUksQ0FBQyxLQUFLMUIsWUFBVixFQUNBO0FBQ0kscUJBQUtXLE9BQUwsR0FBZSxJQUFJdEMsS0FBS3NELFNBQVQsQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsRUFBeUIsS0FBSy9CLFVBQTlCLEVBQTBDLEtBQUtFLFdBQS9DLENBQWY7QUFDSDtBQUNELGlCQUFLOEIsRUFBTCxDQUFRLGFBQVIsRUFBdUIsS0FBS0MsSUFBNUI7QUFDQSxpQkFBS0QsRUFBTCxDQUFRLGFBQVIsRUFBdUIsS0FBS0UsSUFBNUI7QUFDQSxpQkFBS0YsRUFBTCxDQUFRLFdBQVIsRUFBcUIsS0FBS0csRUFBMUI7QUFDQSxpQkFBS0gsRUFBTCxDQUFRLGtCQUFSLEVBQTRCLEtBQUtHLEVBQWpDO0FBQ0EsaUJBQUtILEVBQUwsQ0FBUSxlQUFSLEVBQXlCLEtBQUtHLEVBQTlCO0FBQ0EsaUJBQUtILEVBQUwsQ0FBUSxZQUFSLEVBQXNCLEtBQUtHLEVBQTNCO0FBQ0FDLHFCQUFTQyxJQUFULENBQWNDLGdCQUFkLENBQStCLE9BQS9CLEVBQXdDLFVBQUNDLENBQUQ7QUFBQSx1QkFBTyxPQUFLQyxXQUFMLENBQWlCRCxDQUFqQixDQUFQO0FBQUEsYUFBeEM7QUFDQSxpQkFBS0UsUUFBTCxHQUFnQixLQUFoQjtBQUNIOztBQUVEOzs7Ozs7OzZCQUlLRixDLEVBQ0w7QUFDSSxnQkFBSUEsRUFBRUcsSUFBRixDQUFPQyxhQUFQLFlBQWdDQyxVQUFoQyxJQUE4Q0wsRUFBRUcsSUFBRixDQUFPQyxhQUFQLENBQXFCRSxNQUFyQixJQUErQixDQUFqRixFQUNBO0FBQ0kscUJBQUtKLFFBQUwsR0FBZ0IsSUFBaEI7QUFDSDs7QUFFRCxnQkFBSUYsRUFBRUcsSUFBRixDQUFPSSxXQUFQLEtBQXVCLE9BQTNCLEVBQ0E7QUFDSSxxQkFBS3ZDLE9BQUwsQ0FBYXdDLElBQWIsQ0FBa0JSLEVBQUVHLElBQUYsQ0FBT00sU0FBekI7QUFDSDs7QUFUTDtBQUFBO0FBQUE7O0FBQUE7QUFXSSxzQ0FBaUJ6RCxZQUFqQixtSUFDQTtBQUFBLHdCQURTcUMsSUFDVDs7QUFDSSx3QkFBSSxLQUFLbEMsT0FBTCxDQUFha0MsSUFBYixDQUFKLEVBQ0E7QUFDSSw2QkFBS2xDLE9BQUwsQ0FBYWtDLElBQWIsRUFBbUJLLElBQW5CLENBQXdCTSxDQUF4QjtBQUNIO0FBQ0o7QUFqQkw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFtQkksZ0JBQUksS0FBS1UsaUJBQUwsT0FBNkIsQ0FBakMsRUFDQTtBQUNJLHFCQUFLQyxJQUFMLEdBQVksRUFBRWxDLEdBQUd1QixFQUFFRyxJQUFGLENBQU9TLE1BQVAsQ0FBY25DLENBQW5CLEVBQXNCRSxHQUFHcUIsRUFBRUcsSUFBRixDQUFPUyxNQUFQLENBQWNqQyxDQUF2QyxFQUFaO0FBQ0EscUJBQUtrQyxnQkFBTCxHQUF3QixJQUF4QjtBQUNILGFBSkQsTUFNQTtBQUNJLHFCQUFLQSxnQkFBTCxHQUF3QixLQUF4QjtBQUNIO0FBQ0o7O0FBRUQ7Ozs7Ozs7O3VDQUtlQyxNLEVBQ2Y7QUFDSSxnQkFBSUMsS0FBS0MsR0FBTCxDQUFTRixNQUFULEtBQW9CLEtBQUtoRCxTQUE3QixFQUNBO0FBQ0ksdUJBQU8sSUFBUDtBQUNIO0FBQ0QsbUJBQU8sS0FBUDtBQUNIOztBQUVEOzs7Ozs7OzZCQUlLa0MsQyxFQUNMO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ0ksc0NBQWlCaEQsWUFBakIsbUlBQ0E7QUFBQSx3QkFEU3FDLElBQ1Q7O0FBQ0ksd0JBQUksS0FBS2xDLE9BQUwsQ0FBYWtDLElBQWIsQ0FBSixFQUNBO0FBQ0ksNkJBQUtsQyxPQUFMLENBQWFrQyxJQUFiLEVBQW1CTSxJQUFuQixDQUF3QkssQ0FBeEI7QUFDSDtBQUNKO0FBUEw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFTSSxnQkFBSSxLQUFLYSxnQkFBVCxFQUNBO0FBQ0ksb0JBQU1JLFFBQVFqQixFQUFFRyxJQUFGLENBQU9TLE1BQVAsQ0FBY25DLENBQWQsR0FBa0IsS0FBS2tDLElBQUwsQ0FBVWxDLENBQTFDO0FBQ0Esb0JBQU15QyxRQUFRbEIsRUFBRUcsSUFBRixDQUFPUyxNQUFQLENBQWNqQyxDQUFkLEdBQWtCLEtBQUtnQyxJQUFMLENBQVVoQyxDQUExQztBQUNBLG9CQUFJLEtBQUt3QyxjQUFMLENBQW9CRixLQUFwQixLQUE4QixLQUFLRSxjQUFMLENBQW9CRCxLQUFwQixDQUFsQyxFQUNBO0FBQ0kseUJBQUtMLGdCQUFMLEdBQXdCLEtBQXhCO0FBQ0g7QUFDSjtBQUNKOztBQUVEOzs7Ozs7OzJCQUlHYixDLEVBQ0g7QUFDSSxnQkFBSUEsRUFBRUcsSUFBRixDQUFPQyxhQUFQLFlBQWdDQyxVQUFoQyxJQUE4Q0wsRUFBRUcsSUFBRixDQUFPQyxhQUFQLENBQXFCRSxNQUFyQixJQUErQixDQUFqRixFQUNBO0FBQ0kscUJBQUtKLFFBQUwsR0FBZ0IsS0FBaEI7QUFDSDs7QUFFRCxnQkFBSUYsRUFBRUcsSUFBRixDQUFPSSxXQUFQLEtBQXVCLE9BQTNCLEVBQ0E7QUFDSSxxQkFBSyxJQUFJYSxJQUFJLENBQWIsRUFBZ0JBLElBQUksS0FBS3BELE9BQUwsQ0FBYXFELE1BQWpDLEVBQXlDRCxHQUF6QyxFQUNBO0FBQ0ksd0JBQUksS0FBS3BELE9BQUwsQ0FBYW9ELENBQWIsTUFBb0JwQixFQUFFRyxJQUFGLENBQU9NLFNBQS9CLEVBQ0E7QUFDSSw2QkFBS3pDLE9BQUwsQ0FBYXNELE1BQWIsQ0FBb0JGLENBQXBCLEVBQXVCLENBQXZCO0FBQ0E7QUFDSDtBQUNKO0FBQ0o7O0FBaEJMO0FBQUE7QUFBQTs7QUFBQTtBQWtCSSxzQ0FBaUJwRSxZQUFqQixtSUFDQTtBQUFBLHdCQURTcUMsSUFDVDs7QUFDSSx3QkFBSSxLQUFLbEMsT0FBTCxDQUFha0MsSUFBYixDQUFKLEVBQ0E7QUFDSSw2QkFBS2xDLE9BQUwsQ0FBYWtDLElBQWIsRUFBbUJPLEVBQW5CLENBQXNCSSxDQUF0QjtBQUNIO0FBQ0o7QUF4Qkw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUEwQkksZ0JBQUksS0FBS2EsZ0JBQUwsSUFBeUIsS0FBS0gsaUJBQUwsT0FBNkIsQ0FBMUQsRUFDQTtBQUNJLHFCQUFLYSxJQUFMLENBQVUsU0FBVixFQUFxQixFQUFFQyxRQUFRLEtBQUtiLElBQWYsRUFBcUJjLE9BQU8sS0FBS0MsT0FBTCxDQUFhLEtBQUtmLElBQWxCLENBQTVCLEVBQXFEZ0IsVUFBVSxJQUEvRCxFQUFyQjtBQUNBLHFCQUFLZCxnQkFBTCxHQUF3QixLQUF4QjtBQUNIO0FBQ0o7O0FBRUQ7Ozs7Ozs7b0NBSVliLEMsRUFDWjtBQUNJLGdCQUFJNEIsZUFBSjtBQURKO0FBQUE7QUFBQTs7QUFBQTtBQUVJLHNDQUFpQjVFLFlBQWpCLG1JQUNBO0FBQUEsd0JBRFNxQyxJQUNUOztBQUNJLHdCQUFJLEtBQUtsQyxPQUFMLENBQWFrQyxJQUFiLENBQUosRUFDQTtBQUNJLDRCQUFJLEtBQUtsQyxPQUFMLENBQWFrQyxJQUFiLEVBQW1Cd0MsS0FBbkIsQ0FBeUI3QixDQUF6QixDQUFKLEVBQ0E7QUFDSTRCLHFDQUFTLElBQVQ7QUFDSDtBQUNKO0FBQ0o7QUFYTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVlJLG1CQUFPQSxNQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7OztrQ0FPQTtBQUNJLGdCQUFJRSxVQUFVVCxNQUFWLEtBQXFCLENBQXpCLEVBQ0E7QUFDSSxvQkFBTTVDLElBQUlxRCxVQUFVLENBQVYsQ0FBVjtBQUNBLG9CQUFNbkQsSUFBSW1ELFVBQVUsQ0FBVixDQUFWO0FBQ0EsdUJBQU8sS0FBS0MsT0FBTCxDQUFhLEVBQUV0RCxJQUFGLEVBQUtFLElBQUwsRUFBYixDQUFQO0FBQ0gsYUFMRCxNQU9BO0FBQ0ksdUJBQU8sS0FBS29ELE9BQUwsQ0FBYUQsVUFBVSxDQUFWLENBQWIsQ0FBUDtBQUNIO0FBQ0o7O0FBRUQ7Ozs7Ozs7OzttQ0FPQTtBQUNJLGdCQUFJQSxVQUFVVCxNQUFWLEtBQXFCLENBQXpCLEVBQ0E7QUFDSSxvQkFBTTVDLElBQUlxRCxVQUFVLENBQVYsQ0FBVjtBQUNBLG9CQUFNbkQsSUFBSW1ELFVBQVUsQ0FBVixDQUFWO0FBQ0EsdUJBQU8sS0FBS0UsUUFBTCxDQUFjLEVBQUV2RCxJQUFGLEVBQUtFLElBQUwsRUFBZCxDQUFQO0FBQ0gsYUFMRCxNQU9BO0FBQ0ksb0JBQU1zRCxRQUFRSCxVQUFVLENBQVYsQ0FBZDtBQUNBLHVCQUFPLEtBQUtFLFFBQUwsQ0FBY0MsS0FBZCxDQUFQO0FBQ0g7QUFDSjs7QUFFRDs7Ozs7Ozs7OztBQXFEQTs7Ozs7O3FDQU1XLHFCQUNYO0FBQ0ksZ0JBQUl4RCxVQUFKO0FBQUEsZ0JBQU9FLFVBQVA7QUFDQSxnQkFBSSxDQUFDdUQsTUFBTUosVUFBVSxDQUFWLENBQU4sQ0FBTCxFQUNBO0FBQ0lyRCxvQkFBSXFELFVBQVUsQ0FBVixDQUFKO0FBQ0FuRCxvQkFBSW1ELFVBQVUsQ0FBVixDQUFKO0FBQ0gsYUFKRCxNQU1BO0FBQ0lyRCxvQkFBSXFELFVBQVUsQ0FBVixFQUFhckQsQ0FBakI7QUFDQUUsb0JBQUltRCxVQUFVLENBQVYsRUFBYW5ELENBQWpCO0FBQ0g7QUFDRCxpQkFBS3dELFFBQUwsQ0FBY0MsR0FBZCxDQUFrQixDQUFDLEtBQUt0RCxnQkFBTCxHQUF3QixDQUF4QixHQUE0QkwsQ0FBN0IsSUFBa0MsS0FBSzRELEtBQUwsQ0FBVzVELENBQS9ELEVBQWtFLENBQUMsS0FBS08saUJBQUwsR0FBeUIsQ0FBekIsR0FBNkJMLENBQTlCLElBQW1DLEtBQUswRCxLQUFMLENBQVcxRCxDQUFoSDtBQUNBLGlCQUFLMkQsTUFBTDtBQUNBLG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7O0FBYUE7Ozs7OztxQ0FNVyxnQkFDWDtBQUNJLGdCQUFJUixVQUFVVCxNQUFWLEtBQXFCLENBQXpCLEVBQ0E7QUFDSSxxQkFBS2MsUUFBTCxDQUFjQyxHQUFkLENBQWtCLENBQUNOLFVBQVUsQ0FBVixFQUFhckQsQ0FBZCxHQUFrQixLQUFLNEQsS0FBTCxDQUFXNUQsQ0FBL0MsRUFBa0QsQ0FBQ3FELFVBQVUsQ0FBVixFQUFhbkQsQ0FBZCxHQUFrQixLQUFLMEQsS0FBTCxDQUFXMUQsQ0FBL0U7QUFDSCxhQUhELE1BS0E7QUFDSSxxQkFBS3dELFFBQUwsQ0FBY0MsR0FBZCxDQUFrQixDQUFDTixVQUFVLENBQVYsQ0FBRCxHQUFnQixLQUFLTyxLQUFMLENBQVc1RCxDQUE3QyxFQUFnRCxDQUFDcUQsVUFBVSxDQUFWLENBQUQsR0FBZ0IsS0FBS08sS0FBTCxDQUFXMUQsQ0FBM0U7QUFDSDtBQUNELGlCQUFLMkQsTUFBTDtBQUNBLG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7O2lDQU1TekQsSyxFQUFPMEQsTSxFQUNoQjtBQUNJLGdCQUFJQyxhQUFKO0FBQ0EsZ0JBQUlELE1BQUosRUFDQTtBQUNJQyx1QkFBTyxLQUFLRCxNQUFaO0FBQ0g7QUFDRDFELG9CQUFRQSxTQUFTLEtBQUtyQixXQUF0QjtBQUNBLGlCQUFLNkUsS0FBTCxDQUFXNUQsQ0FBWCxHQUFlLEtBQUtyQixZQUFMLEdBQW9CeUIsS0FBbkM7QUFDQSxpQkFBS3dELEtBQUwsQ0FBVzFELENBQVgsR0FBZSxLQUFLMEQsS0FBTCxDQUFXNUQsQ0FBMUI7QUFDQSxnQkFBSThELE1BQUosRUFDQTtBQUNJLHFCQUFLRSxVQUFMLENBQWdCRCxJQUFoQjtBQUNIO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7a0NBTVV6RCxNLEVBQVF3RCxNLEVBQ2xCO0FBQ0ksZ0JBQUlDLGFBQUo7QUFDQSxnQkFBSUQsTUFBSixFQUNBO0FBQ0lDLHVCQUFPLEtBQUtELE1BQVo7QUFDSDtBQUNEeEQscUJBQVNBLFVBQVUsS0FBS3JCLFlBQXhCO0FBQ0EsaUJBQUsyRSxLQUFMLENBQVcxRCxDQUFYLEdBQWUsS0FBS3JCLGFBQUwsR0FBcUJ5QixNQUFwQztBQUNBLGlCQUFLc0QsS0FBTCxDQUFXNUQsQ0FBWCxHQUFlLEtBQUs0RCxLQUFMLENBQVcxRCxDQUExQjtBQUNBLGdCQUFJNEQsTUFBSixFQUNBO0FBQ0kscUJBQUtFLFVBQUwsQ0FBZ0JELElBQWhCO0FBQ0g7QUFDRCxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7O2lDQUtTRCxNLEVBQ1Q7QUFDSSxnQkFBSUMsYUFBSjtBQUNBLGdCQUFJRCxNQUFKLEVBQ0E7QUFDSUMsdUJBQU8sS0FBS0QsTUFBWjtBQUNIO0FBQ0QsaUJBQUtGLEtBQUwsQ0FBVzVELENBQVgsR0FBZSxLQUFLckIsWUFBTCxHQUFvQixLQUFLSSxXQUF4QztBQUNBLGlCQUFLNkUsS0FBTCxDQUFXMUQsQ0FBWCxHQUFlLEtBQUtyQixhQUFMLEdBQXFCLEtBQUtJLFlBQXpDO0FBQ0EsZ0JBQUksS0FBSzJFLEtBQUwsQ0FBVzVELENBQVgsR0FBZSxLQUFLNEQsS0FBTCxDQUFXMUQsQ0FBOUIsRUFDQTtBQUNJLHFCQUFLMEQsS0FBTCxDQUFXMUQsQ0FBWCxHQUFlLEtBQUswRCxLQUFMLENBQVc1RCxDQUExQjtBQUNILGFBSEQsTUFLQTtBQUNJLHFCQUFLNEQsS0FBTCxDQUFXNUQsQ0FBWCxHQUFlLEtBQUs0RCxLQUFMLENBQVcxRCxDQUExQjtBQUNIO0FBQ0QsZ0JBQUk0RCxNQUFKLEVBQ0E7QUFDSSxxQkFBS0UsVUFBTCxDQUFnQkQsSUFBaEI7QUFDSDtBQUNELG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7NEJBS0lELE0sRUFDSjtBQUNJLGdCQUFJQyxhQUFKO0FBQ0EsZ0JBQUlELE1BQUosRUFDQTtBQUNJQyx1QkFBTyxLQUFLRCxNQUFaO0FBQ0g7QUFDRCxpQkFBS0YsS0FBTCxDQUFXNUQsQ0FBWCxHQUFlLEtBQUtyQixZQUFMLEdBQW9CLEtBQUtJLFdBQXhDO0FBQ0EsaUJBQUs2RSxLQUFMLENBQVcxRCxDQUFYLEdBQWUsS0FBS3JCLGFBQUwsR0FBcUIsS0FBS0ksWUFBekM7QUFDQSxnQkFBSSxLQUFLMkUsS0FBTCxDQUFXNUQsQ0FBWCxHQUFlLEtBQUs0RCxLQUFMLENBQVcxRCxDQUE5QixFQUNBO0FBQ0kscUJBQUswRCxLQUFMLENBQVcxRCxDQUFYLEdBQWUsS0FBSzBELEtBQUwsQ0FBVzVELENBQTFCO0FBQ0gsYUFIRCxNQUtBO0FBQ0kscUJBQUs0RCxLQUFMLENBQVc1RCxDQUFYLEdBQWUsS0FBSzRELEtBQUwsQ0FBVzFELENBQTFCO0FBQ0g7QUFDRCxnQkFBSTRELE1BQUosRUFDQTtBQUNJLHFCQUFLRSxVQUFMLENBQWdCRCxJQUFoQjtBQUNIO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7b0NBTVlFLE8sRUFBU0gsTSxFQUNyQjtBQUNJLGdCQUFJQyxhQUFKO0FBQ0EsZ0JBQUlELE1BQUosRUFDQTtBQUNJQyx1QkFBTyxLQUFLRCxNQUFaO0FBQ0g7QUFDRCxnQkFBTUYsUUFBUSxLQUFLQSxLQUFMLENBQVc1RCxDQUFYLEdBQWUsS0FBSzRELEtBQUwsQ0FBVzVELENBQVgsR0FBZWlFLE9BQTVDO0FBQ0EsaUJBQUtMLEtBQUwsQ0FBV0QsR0FBWCxDQUFlQyxLQUFmO0FBQ0EsZ0JBQUlFLE1BQUosRUFDQTtBQUNJLHFCQUFLRSxVQUFMLENBQWdCRCxJQUFoQjtBQUNIO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7NkJBTUsxQixNLEVBQVF5QixNLEVBQ2I7QUFDSSxpQkFBS0ksUUFBTCxDQUFjN0IsU0FBUyxLQUFLaEMsZ0JBQTVCLEVBQThDeUQsTUFBOUM7QUFDSDs7QUFFRDs7Ozs7Ozs7Ozs7OztpQ0FVU3JGLE8sRUFDVDtBQUNJLGlCQUFLQyxPQUFMLENBQWEsV0FBYixJQUE0QixJQUFJUCxRQUFKLENBQWEsSUFBYixFQUFtQk0sT0FBbkIsQ0FBNUI7QUFDQSxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7QUFVQTs7Ozs7Ozs7OEJBTUE7QUFDSSxnQkFBTTBFLFNBQVMsRUFBZjtBQUNBQSxtQkFBT2xELElBQVAsR0FBYyxLQUFLQSxJQUFMLEdBQVksQ0FBMUI7QUFDQWtELG1CQUFPZ0IsS0FBUCxHQUFlLEtBQUtBLEtBQUwsR0FBYSxLQUFLcEYsV0FBakM7QUFDQW9FLG1CQUFPaEQsR0FBUCxHQUFhLEtBQUtBLEdBQUwsR0FBVyxDQUF4QjtBQUNBZ0QsbUJBQU9pQixNQUFQLEdBQWdCLEtBQUtBLE1BQUwsR0FBYyxLQUFLbkYsWUFBbkM7QUFDQWtFLG1CQUFPa0IsV0FBUCxHQUFxQjtBQUNqQnJFLG1CQUFHLEtBQUtqQixXQUFMLEdBQW1CLEtBQUs2RSxLQUFMLENBQVc1RCxDQUE5QixHQUFrQyxLQUFLckIsWUFEekI7QUFFakJ1QixtQkFBRyxLQUFLakIsWUFBTCxHQUFvQixLQUFLMkUsS0FBTCxDQUFXMUQsQ0FBL0IsR0FBbUMsS0FBS3JCO0FBRjFCLGFBQXJCO0FBSUEsbUJBQU9zRSxNQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7OztBQTJGQTs7Ozs7NENBTUE7QUFDSSxtQkFBTyxDQUFDLEtBQUsxQixRQUFMLEdBQWdCLENBQWhCLEdBQW9CLENBQXJCLElBQTBCLEtBQUtsQyxPQUFMLENBQWFxRCxNQUE5QztBQUNIOztBQUVEOzs7Ozs7OzsyQ0FNQTtBQUNJLGdCQUFNMEIsVUFBVSxFQUFoQjtBQUNBLGdCQUFNQyxXQUFXLEtBQUtDLGVBQXRCO0FBQ0EsaUJBQUssSUFBSUMsR0FBVCxJQUFnQkYsUUFBaEIsRUFDQTtBQUNJLG9CQUFNRyxVQUFVSCxTQUFTRSxHQUFULENBQWhCO0FBQ0Esb0JBQUksS0FBS2xGLE9BQUwsQ0FBYW9GLE9BQWIsQ0FBcUJELFFBQVExQyxTQUE3QixNQUE0QyxDQUFDLENBQWpELEVBQ0E7QUFDSXNDLDRCQUFRdkMsSUFBUixDQUFhMkMsT0FBYjtBQUNIO0FBQ0o7QUFDRCxtQkFBT0osT0FBUDtBQUNIOztBQUVEOzs7Ozs7O2lDQUtBO0FBQ0ksZ0JBQUksS0FBSzVGLE9BQUwsQ0FBYSxRQUFiLENBQUosRUFDQTtBQUNJLHFCQUFLQSxPQUFMLENBQWEsUUFBYixFQUF1QmtHLEtBQXZCO0FBQ0EscUJBQUtsRyxPQUFMLENBQWEsUUFBYixFQUF1Qm1HLE1BQXZCO0FBQ0g7QUFDRCxnQkFBSSxLQUFLbkcsT0FBTCxDQUFhLFlBQWIsQ0FBSixFQUNBO0FBQ0kscUJBQUtBLE9BQUwsQ0FBYSxZQUFiLEVBQTJCa0csS0FBM0I7QUFDSDtBQUNELGdCQUFJLEtBQUtsRyxPQUFMLENBQWEsTUFBYixDQUFKLEVBQ0E7QUFDSSxxQkFBS0EsT0FBTCxDQUFhLE1BQWIsRUFBcUJrRyxLQUFyQjtBQUNIO0FBQ0QsZ0JBQUksS0FBS2xHLE9BQUwsQ0FBYSxPQUFiLENBQUosRUFDQTtBQUNJLHFCQUFLQSxPQUFMLENBQWEsT0FBYixFQUFzQmlCLE1BQXRCO0FBQ0g7QUFDRCxnQkFBSSxLQUFLakIsT0FBTCxDQUFhLFlBQWIsQ0FBSixFQUNBO0FBQ0kscUJBQUtBLE9BQUwsQ0FBYSxZQUFiLEVBQTJCb0csS0FBM0I7QUFDSDtBQUNELGlCQUFLQyxLQUFMLEdBQWEsSUFBYjtBQUNIOztBQUVEOztBQUVBOzs7Ozs7O3FDQUlhbkUsSSxFQUNiO0FBQ0ksZ0JBQUksS0FBS2xDLE9BQUwsQ0FBYWtDLElBQWIsQ0FBSixFQUNBO0FBQ0kscUJBQUtsQyxPQUFMLENBQWFrQyxJQUFiLElBQXFCLElBQXJCO0FBQ0g7QUFDSjs7QUFFRDs7Ozs7OztvQ0FJWUEsSSxFQUNaO0FBQ0ksZ0JBQUksS0FBS2xDLE9BQUwsQ0FBYWtDLElBQWIsQ0FBSixFQUNBO0FBQ0kscUJBQUtsQyxPQUFMLENBQWFrQyxJQUFiLEVBQW1Cb0UsS0FBbkI7QUFDSDtBQUNKOztBQUVEOzs7Ozs7O3FDQUlhcEUsSSxFQUNiO0FBQ0ksZ0JBQUksS0FBS2xDLE9BQUwsQ0FBYWtDLElBQWIsQ0FBSixFQUNBO0FBQ0kscUJBQUtsQyxPQUFMLENBQWFrQyxJQUFiLEVBQW1CcUUsTUFBbkI7QUFDSDtBQUNKOztBQUVEOzs7Ozs7Ozs7Ozs2QkFRS3hHLE8sRUFDTDtBQUNJLGlCQUFLQyxPQUFMLENBQWEsTUFBYixJQUF1QixJQUFJZCxJQUFKLENBQVMsSUFBVCxFQUFlYSxPQUFmLENBQXZCO0FBQ0EsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7Ozs4QkFRTUEsTyxFQUNOO0FBQ0ksaUJBQUtDLE9BQUwsQ0FBYSxPQUFiLElBQXdCLElBQUlaLEtBQUosQ0FBVSxJQUFWLEVBQWdCVyxPQUFoQixDQUF4QjtBQUNBLG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7Ozs7bUNBUVdBLE8sRUFDWDtBQUNJLGlCQUFLQyxPQUFMLENBQWEsWUFBYixJQUE2QixJQUFJVixVQUFKLENBQWUsSUFBZixFQUFxQlMsT0FBckIsQ0FBN0I7QUFDQSxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7OytCQVdPQSxPLEVBQ1A7QUFDSSxpQkFBS0MsT0FBTCxDQUFhLFFBQWIsSUFBeUIsSUFBSVQsTUFBSixDQUFXLElBQVgsRUFBaUJRLE9BQWpCLENBQXpCO0FBQ0EsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7Ozs4QkFRTUEsTyxFQUNOO0FBQ0ksaUJBQUtDLE9BQUwsQ0FBYSxPQUFiLElBQXdCLElBQUliLEtBQUosQ0FBVSxJQUFWLEVBQWdCWSxPQUFoQixDQUF4QjtBQUNBLG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFhS3VCLEMsRUFBR0UsQyxFQUFHekIsTyxFQUNYO0FBQ0ksaUJBQUtDLE9BQUwsQ0FBYSxNQUFiLElBQXVCLElBQUlSLElBQUosQ0FBUyxJQUFULEVBQWU4QixDQUFmLEVBQWtCRSxDQUFsQixFQUFxQnpCLE9BQXJCLENBQXZCO0FBQ0EsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7OzsrQkFRT3lHLE0sRUFBUXpHLE8sRUFDZjtBQUNJLGlCQUFLQyxPQUFMLENBQWEsUUFBYixJQUF5QixJQUFJTixNQUFKLENBQVcsSUFBWCxFQUFpQjhHLE1BQWpCLEVBQXlCekcsT0FBekIsQ0FBekI7QUFDQSxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7OzhCQVFNQSxPLEVBQ047QUFDSSxpQkFBS0MsT0FBTCxDQUFhLE9BQWIsSUFBd0IsSUFBSUwsS0FBSixDQUFVLElBQVYsRUFBZ0JJLE9BQWhCLENBQXhCO0FBQ0EsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7Ozs7O2tDQVVVQSxPLEVBQ1Y7QUFDSSxpQkFBS0MsT0FBTCxDQUFhLFlBQWIsSUFBNkIsSUFBSVgsU0FBSixDQUFjLElBQWQsRUFBb0JVLE9BQXBCLENBQTdCO0FBQ0EsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7OzttQ0FjV0EsTyxFQUNYO0FBQ0ksaUJBQUtDLE9BQUwsQ0FBYSxhQUFiLElBQThCLElBQUlKLFVBQUosQ0FBZSxJQUFmLEVBQXFCRyxPQUFyQixDQUE5QjtBQUNBLG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs0QkE5M0JBO0FBQ0ksbUJBQU8sS0FBS0UsWUFBWjtBQUNILFM7MEJBQ2V3RyxLLEVBQ2hCO0FBQ0ksaUJBQUt4RyxZQUFMLEdBQW9Cd0csS0FBcEI7QUFDSDs7QUFFRDs7Ozs7Ozs0QkFLQTtBQUNJLG1CQUFPLEtBQUt0RyxhQUFaO0FBQ0gsUzswQkFDZ0JzRyxLLEVBQ2pCO0FBQ0ksaUJBQUt0RyxhQUFMLEdBQXFCc0csS0FBckI7QUFDSDs7QUFFRDs7Ozs7Ozs0QkFLQTtBQUNJLGdCQUFJLEtBQUtwRyxXQUFULEVBQ0E7QUFDSSx1QkFBTyxLQUFLQSxXQUFaO0FBQ0gsYUFIRCxNQUtBO0FBQ0ksdUJBQU8sS0FBS3FCLEtBQVo7QUFDSDtBQUNKLFM7MEJBQ2MrRSxLLEVBQ2Y7QUFDSSxpQkFBS3BHLFdBQUwsR0FBbUJvRyxLQUFuQjtBQUNBLGlCQUFLeEUsYUFBTDtBQUNIOztBQUVEOzs7Ozs7OzRCQUtBO0FBQ0ksZ0JBQUksS0FBSzFCLFlBQVQsRUFDQTtBQUNJLHVCQUFPLEtBQUtBLFlBQVo7QUFDSCxhQUhELE1BS0E7QUFDSSx1QkFBTyxLQUFLcUIsTUFBWjtBQUNIO0FBQ0osUzswQkFDZTZFLEssRUFDaEI7QUFDSSxpQkFBS2xHLFlBQUwsR0FBb0JrRyxLQUFwQjtBQUNBLGlCQUFLeEUsYUFBTDtBQUNIOzs7NEJBME1EO0FBQ0ksbUJBQU8sS0FBS2hDLFlBQUwsR0FBb0IsS0FBS2lGLEtBQUwsQ0FBVzVELENBQXRDO0FBQ0g7O0FBRUQ7Ozs7Ozs7OzRCQU1BO0FBQ0ksbUJBQU8sS0FBS25CLGFBQUwsR0FBcUIsS0FBSytFLEtBQUwsQ0FBVzFELENBQXZDO0FBQ0g7O0FBRUQ7Ozs7Ozs7OzRCQU1BO0FBQ0ksbUJBQU8sS0FBS25CLFdBQUwsR0FBbUIsS0FBSzZFLEtBQUwsQ0FBVzVELENBQXJDO0FBQ0g7O0FBRUQ7Ozs7Ozs7OzRCQU1BO0FBQ0ksbUJBQU8sS0FBS2YsWUFBTCxHQUFvQixLQUFLMkUsS0FBTCxDQUFXMUQsQ0FBdEM7QUFDSDs7QUFFRDs7Ozs7Ozs0QkFLQTtBQUNJLG1CQUFPLEVBQUVGLEdBQUcsS0FBS0ssZ0JBQUwsR0FBd0IsQ0FBeEIsR0FBNEIsS0FBS0wsQ0FBTCxHQUFTLEtBQUs0RCxLQUFMLENBQVc1RCxDQUFyRCxFQUF3REUsR0FBRyxLQUFLSyxpQkFBTCxHQUF5QixDQUF6QixHQUE2QixLQUFLTCxDQUFMLEdBQVMsS0FBSzBELEtBQUwsQ0FBVzFELENBQTVHLEVBQVA7QUFDSCxTOzBCQUNVaUYsSyxFQUNYO0FBQ0ksaUJBQUtuQixVQUFMLENBQWdCbUIsS0FBaEI7QUFDSDs7OzRCQStCRDtBQUNJLG1CQUFPLEVBQUVuRixHQUFHLENBQUMsS0FBS0EsQ0FBTixHQUFVLEtBQUs0RCxLQUFMLENBQVc1RCxDQUExQixFQUE2QkUsR0FBRyxDQUFDLEtBQUtBLENBQU4sR0FBVSxLQUFLMEQsS0FBTCxDQUFXMUQsQ0FBckQsRUFBUDtBQUNILFM7MEJBQ1VpRixLLEVBQ1g7QUFDSSxpQkFBS0MsVUFBTCxDQUFnQkQsS0FBaEI7QUFDSDs7OzRCQWlORDtBQUNJLG1CQUFPLENBQUMsS0FBS25GLENBQU4sR0FBVSxLQUFLNEQsS0FBTCxDQUFXNUQsQ0FBckIsR0FBeUIsS0FBS0ssZ0JBQXJDO0FBQ0gsUzswQkFDUzhFLEssRUFDVjtBQUNJLGlCQUFLbkYsQ0FBTCxHQUFTbUYsUUFBUSxLQUFLdkIsS0FBTCxDQUFXNUQsQ0FBbkIsR0FBdUIsS0FBS0ssZ0JBQXJDO0FBQ0EsaUJBQUt3RCxNQUFMO0FBQ0g7O0FBRUQ7Ozs7Ozs7NEJBS0E7QUFDSSxtQkFBTyxDQUFDLEtBQUs3RCxDQUFOLEdBQVUsS0FBSzRELEtBQUwsQ0FBVzVELENBQTVCO0FBQ0gsUzswQkFDUW1GLEssRUFDVDtBQUNJLGlCQUFLbkYsQ0FBTCxHQUFTLENBQUNtRixLQUFELEdBQVMsS0FBS3ZCLEtBQUwsQ0FBVzVELENBQTdCO0FBQ0EsaUJBQUs2RCxNQUFMO0FBQ0g7O0FBRUQ7Ozs7Ozs7NEJBS0E7QUFDSSxtQkFBTyxDQUFDLEtBQUszRCxDQUFOLEdBQVUsS0FBSzBELEtBQUwsQ0FBVzFELENBQTVCO0FBQ0gsUzswQkFDT2lGLEssRUFDUjtBQUNJLGlCQUFLakYsQ0FBTCxHQUFTLENBQUNpRixLQUFELEdBQVMsS0FBS3ZCLEtBQUwsQ0FBVzFELENBQTdCO0FBQ0EsaUJBQUsyRCxNQUFMO0FBQ0g7O0FBRUQ7Ozs7Ozs7NEJBS0E7QUFDSSxtQkFBTyxDQUFDLEtBQUszRCxDQUFOLEdBQVUsS0FBSzBELEtBQUwsQ0FBVzFELENBQXJCLEdBQXlCLEtBQUtLLGlCQUFyQztBQUNILFM7MEJBQ1U0RSxLLEVBQ1g7QUFDSSxpQkFBS2pGLENBQUwsR0FBUyxDQUFDaUYsS0FBRCxHQUFTLEtBQUt2QixLQUFMLENBQVcxRCxDQUFwQixHQUF3QixLQUFLSyxpQkFBdEM7QUFDQSxpQkFBS3NELE1BQUw7QUFDSDtBQUNEOzs7Ozs7OzRCQUtBO0FBQ0ksbUJBQU8sS0FBS3dCLE1BQVo7QUFDSCxTOzBCQUNTRixLLEVBQ1Y7QUFDSSxpQkFBS0UsTUFBTCxHQUFjRixLQUFkO0FBQ0g7O0FBRUQ7Ozs7Ozs7OzRCQU1BO0FBQ0ksbUJBQU8sS0FBS0csYUFBWjtBQUNILFM7MEJBQ2dCSCxLLEVBQ2pCO0FBQ0ksZ0JBQUlBLEtBQUosRUFDQTtBQUNJLHFCQUFLRyxhQUFMLEdBQXFCSCxLQUFyQjtBQUNBLHFCQUFLcEYsT0FBTCxHQUFlb0YsS0FBZjtBQUNILGFBSkQsTUFNQTtBQUNJLHFCQUFLRyxhQUFMLEdBQXFCLEtBQXJCO0FBQ0EscUJBQUt2RixPQUFMLEdBQWUsSUFBSXRDLEtBQUtzRCxTQUFULENBQW1CLENBQW5CLEVBQXNCLENBQXRCLEVBQXlCLEtBQUsvQixVQUE5QixFQUEwQyxLQUFLRSxXQUEvQyxDQUFmO0FBQ0g7QUFDSjs7OzRCQW9RVztBQUFFLG1CQUFPLEtBQUtVLE1BQVo7QUFBb0IsUzswQkFDeEJ1RixLLEVBQ1Y7QUFDSSxpQkFBS3ZGLE1BQUwsR0FBY3VGLEtBQWQ7QUFDQSxpQkFBS3JFLFdBQUwsR0FBbUIsQ0FBQ3FFLEtBQXBCO0FBQ0g7Ozs7RUE1L0JrQjFILEtBQUs4SCxTOztBQSsvQjVCOzs7Ozs7Ozs7QUFTQTs7Ozs7Ozs7O0FBU0E7Ozs7Ozs7OztBQVNBOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7Ozs7Ozs7QUFXQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQUMsT0FBT0MsT0FBUCxHQUFpQmpILFFBQWpCIiwiZmlsZSI6InZpZXdwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUElYSSA9IHJlcXVpcmUoJ3BpeGkuanMnKVxyXG5jb25zdCBleGlzdHMgPSByZXF1aXJlKCdleGlzdHMnKVxyXG5cclxuY29uc3QgRHJhZyA9IHJlcXVpcmUoJy4vZHJhZycpXHJcbmNvbnN0IFBpbmNoID0gcmVxdWlyZSgnLi9waW5jaCcpXHJcbmNvbnN0IENsYW1wID0gcmVxdWlyZSgnLi9jbGFtcCcpXHJcbmNvbnN0IENsYW1wWm9vbSA9IHJlcXVpcmUoJy4vY2xhbXAtem9vbScpXHJcbmNvbnN0IERlY2VsZXJhdGUgPSByZXF1aXJlKCcuL2RlY2VsZXJhdGUnKVxyXG5jb25zdCBCb3VuY2UgPSByZXF1aXJlKCcuL2JvdW5jZScpXHJcbmNvbnN0IFNuYXAgPSByZXF1aXJlKCcuL3NuYXAnKVxyXG5jb25zdCBTbmFwWm9vbSA9IHJlcXVpcmUoJy4vc25hcC16b29tJylcclxuY29uc3QgRm9sbG93ID0gcmVxdWlyZSgnLi9mb2xsb3cnKVxyXG5jb25zdCBXaGVlbCA9IHJlcXVpcmUoJy4vd2hlZWwnKVxyXG5jb25zdCBNb3VzZUVkZ2VzID0gcmVxdWlyZSgnLi9tb3VzZS1lZGdlcycpXHJcblxyXG5jb25zdCBQTFVHSU5fT1JERVIgPSBbJ2RyYWcnLCAncGluY2gnLCAnd2hlZWwnLCAnZm9sbG93JywgJ21vdXNlLWVkZ2VzJywgJ2RlY2VsZXJhdGUnLCAnYm91bmNlJywgJ3NuYXAtem9vbScsICdjbGFtcC16b29tJywgJ3NuYXAnLCAnY2xhbXAnXVxyXG5cclxuY2xhc3MgVmlld3BvcnQgZXh0ZW5kcyBQSVhJLkNvbnRhaW5lclxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBleHRlbmRzIFBJWEkuQ29udGFpbmVyXHJcbiAgICAgKiBAZXh0ZW5kcyBFdmVudEVtaXR0ZXJcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zY3JlZW5XaWR0aD13aW5kb3cuaW5uZXJXaWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zY3JlZW5IZWlnaHQ9d2luZG93LmlubmVySGVpZ2h0XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndvcmxkV2lkdGg9dGhpcy53aWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53b3JsZEhlaWdodD10aGlzLmhlaWdodF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aHJlc2hvbGQgPSA1XSBudW1iZXIgb2YgcGl4ZWxzIHRvIG1vdmUgdG8gdHJpZ2dlciBhbiBpbnB1dCBldmVudCAoZS5nLiwgZHJhZywgcGluY2gpXHJcbiAgICAgKiBAcGFyYW0geyhQSVhJLlJlY3RhbmdsZXxQSVhJLkNpcmNsZXxQSVhJLkVsbGlwc2V8UElYSS5Qb2x5Z29ufFBJWEkuUm91bmRlZFJlY3RhbmdsZSl9IFtvcHRpb25zLmZvcmNlSGl0QXJlYV0gY2hhbmdlIHRoZSBkZWZhdWx0IGhpdEFyZWEgZnJvbSB3b3JsZCBzaXplIHRvIGEgbmV3IHZhbHVlXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkudGlja2VyLlRpY2tlcn0gW29wdGlvbnMudGlja2VyPVBJWEkudGlja2VyLnNoYXJlZF0gdXNlIHRoaXMgUElYSS50aWNrZXIgZm9yIHVwZGF0ZXNcclxuICAgICAqIEBmaXJlcyBjbGlja2VkXHJcbiAgICAgKiBAZmlyZXMgZHJhZy1zdGFydFxyXG4gICAgICogQGZpcmVzIGRyYWctZW5kXHJcbiAgICAgKiBAZmlyZXMgcGluY2gtc3RhcnRcclxuICAgICAqIEBmaXJlcyBwaW5jaC1lbmRcclxuICAgICAqIEBmaXJlcyBzbmFwLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgc25hcC1lbmRcclxuICAgICAqIEBmaXJlcyBzbmFwLXpvb20tc3RhcnRcclxuICAgICAqIEBmaXJlcyBzbmFwLXpvb20tZW5kXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXgtc3RhcnRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteC1lbmRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteS1zdGFydFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS15LWVuZFxyXG4gICAgICogQGZpcmVzIHdoZWVsXHJcbiAgICAgKiBAZmlyZXMgd2hlZWwtc2Nyb2xsXHJcbiAgICAgKiBAZmlyZXMgbW91c2UtZWRnZS1zdGFydFxyXG4gICAgICogQGZpcmVzIG1vdXNlLWVkZ2UtZW5kXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zID0gW11cclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IG9wdGlvbnMuc2NyZWVuV2lkdGhcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSBvcHRpb25zLnNjcmVlbkhlaWdodFxyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSBvcHRpb25zLndvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IG9wdGlvbnMud29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLmhpdEFyZWFGdWxsU2NyZWVuID0gZXhpc3RzKG9wdGlvbnMuaGl0QXJlYUZ1bGxTY3JlZW4pID8gb3B0aW9ucy5oaXRBcmVhRnVsbFNjcmVlbiA6IHRydWVcclxuICAgICAgICB0aGlzLmZvcmNlSGl0QXJlYSA9IG9wdGlvbnMuZm9yY2VIaXRBcmVhXHJcbiAgICAgICAgdGhpcy50aHJlc2hvbGQgPSBleGlzdHMob3B0aW9ucy50aHJlc2hvbGQpID8gb3B0aW9ucy50aHJlc2hvbGQgOiA1XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMoKVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBhY3RpdmUgdG91Y2ggcG9pbnQgaWRzIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJbXX1cclxuICAgICAgICAgKiBAcmVhZG9ubHlcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnRvdWNoZXMgPSBbXVxyXG5cclxuICAgICAgICB0aGlzLnRpY2tlciA9IG9wdGlvbnMudGlja2VyIHx8IFBJWEkudGlja2VyLnNoYXJlZFxyXG4gICAgICAgIHRoaXMudGlja2VyLmFkZCgoKSA9PiB0aGlzLnVwZGF0ZSgpKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXBkYXRlIGFuaW1hdGlvbnNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBQTFVHSU5fT1JERVIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnNbcGx1Z2luXSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNbcGx1Z2luXS51cGRhdGUodGhpcy50aWNrZXIuZWxhcHNlZE1TKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5mb3JjZUhpdEFyZWEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGl0QXJlYS54ID0gdGhpcy5sZWZ0XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEueSA9IHRoaXMudG9wXHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEud2lkdGggPSB0aGlzLndvcmxkU2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgICAgIHRoaXMuaGl0QXJlYS5oZWlnaHQgPSB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1c2UgdGhpcyB0byBzZXQgc2NyZWVuIGFuZCB3b3JsZCBzaXplcy0tbmVlZGVkIGZvciBwaW5jaC93aGVlbC9jbGFtcC9ib3VuY2VcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY3JlZW5XaWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNjcmVlbkhlaWdodFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3b3JsZFdpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3b3JsZEhlaWdodF1cclxuICAgICAqL1xyXG4gICAgcmVzaXplKHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIHdvcmxkSGVpZ2h0KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbldpZHRoID0gc2NyZWVuV2lkdGggfHwgd2luZG93LmlubmVyV2lkdGhcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSBzY3JlZW5IZWlnaHQgfHwgd2luZG93LmlubmVySGVpZ2h0XHJcbiAgICAgICAgdGhpcy5fd29ybGRXaWR0aCA9IHdvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IHdvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5yZXNpemVQbHVnaW5zKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNhbGxlZCBhZnRlciBhIHdvcmxkV2lkdGgvSGVpZ2h0IGNoYW5nZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcmVzaXplUGx1Z2lucygpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBQTFVHSU5fT1JERVIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0ucmVzaXplKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiB3aWR0aCBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5XaWR0aFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbldpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbldpZHRoID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbkhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbkhlaWdodFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbkhlaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgd2lkdGggaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRXaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dvcmxkV2lkdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRXaWR0aFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aWR0aFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldCB3b3JsZFdpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBoZWlnaHQgaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRIZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLl93b3JsZEhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgd29ybGRIZWlnaHQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgaW5wdXQgbGlzdGVuZXJzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBsaXN0ZW5lcnMoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlXHJcbiAgICAgICAgaWYgKCF0aGlzLmZvcmNlSGl0QXJlYSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAwLCB0aGlzLndvcmxkV2lkdGgsIHRoaXMud29ybGRIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJkb3duJywgdGhpcy5kb3duKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJtb3ZlJywgdGhpcy5tb3ZlKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJ1cCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcnVwb3V0c2lkZScsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcmNhbmNlbCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcm91dCcsIHRoaXMudXApXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIChlKSA9PiB0aGlzLmhhbmRsZVdoZWVsKGUpKVxyXG4gICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIGRvd24gZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBkb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGUuZGF0YS5vcmlnaW5hbEV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCAmJiBlLmRhdGEub3JpZ2luYWxFdmVudC5idXR0b24gPT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdERvd24gPSB0cnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZS5kYXRhLnBvaW50ZXJUeXBlICE9PSAnbW91c2UnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy50b3VjaGVzLnB1c2goZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHR5cGUgb2YgUExVR0lOX09SREVSKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdLmRvd24oZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5kYXRhLmdsb2JhbC54LCB5OiBlLmRhdGEuZ2xvYmFsLnkgfVxyXG4gICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd2hldGhlciBjaGFuZ2UgZXhjZWVkcyB0aHJlc2hvbGRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2hhbmdlXHJcbiAgICAgKi9cclxuICAgIGNoZWNrVGhyZXNob2xkKGNoYW5nZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoTWF0aC5hYnMoY2hhbmdlKSA+PSB0aGlzLnRocmVzaG9sZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG1vdmUgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBtb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBQTFVHSU5fT1JERVIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0ubW92ZShlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGlja2VkQXZhaWxhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgZGlzdFggPSBlLmRhdGEuZ2xvYmFsLnggLSB0aGlzLmxhc3QueFxyXG4gICAgICAgICAgICBjb25zdCBkaXN0WSA9IGUuZGF0YS5nbG9iYWwueSAtIHRoaXMubGFzdC55XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrVGhyZXNob2xkKGRpc3RYKSB8fCB0aGlzLmNoZWNrVGhyZXNob2xkKGRpc3RZKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSB1cCBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHVwKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGUuZGF0YS5vcmlnaW5hbEV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCAmJiBlLmRhdGEub3JpZ2luYWxFdmVudC5idXR0b24gPT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGUuZGF0YS5wb2ludGVyVHlwZSAhPT0gJ21vdXNlJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50b3VjaGVzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50b3VjaGVzW2ldID09PSBlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG91Y2hlcy5zcGxpY2UoaSwgMSlcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCB0eXBlIG9mIFBMVUdJTl9PUkRFUilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS51cChlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGlja2VkQXZhaWxhYmxlICYmIHRoaXMuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnY2xpY2tlZCcsIHsgc2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMgfSlcclxuICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgd2hlZWwgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBoYW5kbGVXaGVlbChlKVxyXG4gICAge1xyXG4gICAgICAgIGxldCByZXN1bHRcclxuICAgICAgICBmb3IgKGxldCB0eXBlIG9mIFBMVUdJTl9PUkRFUilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0ud2hlZWwoZSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjb29yZGluYXRlcyBmcm9tIHNjcmVlbiB0byB3b3JsZFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybnMge1BJWEkuUG9pbnR9XHJcbiAgICAgKi9cclxuICAgIHRvV29ybGQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICBjb25zdCB5ID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvTG9jYWwoeyB4LCB5IH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvTG9jYWwoYXJndW1lbnRzWzBdKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjb29yZGluYXRlcyBmcm9tIHdvcmxkIHRvIHNjcmVlblxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybnMge1BJWEkuUG9pbnR9XHJcbiAgICAgKi9cclxuICAgIHRvU2NyZWVuKClcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgY29uc3QgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0dsb2JhbCh7IHgsIHkgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnQgPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9HbG9iYWwocG9pbnQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIHdpZHRoIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZFNjcmVlbldpZHRoKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuV2lkdGggLyB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkU2NyZWVuSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCB3aWR0aCBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbldvcmxkV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl93b3JsZFdpZHRoICogdGhpcy5zY2FsZS54XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBoZWlnaHQgaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5Xb3JsZEhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkSGVpZ2h0ICogdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgY2VudGVyIG9mIHNjcmVlbiBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge1BJWEkuUG9pbnRMaWtlfVxyXG4gICAgICovXHJcbiAgICBnZXQgY2VudGVyKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4geyB4OiB0aGlzLndvcmxkU2NyZWVuV2lkdGggLyAyIC0gdGhpcy54IC8gdGhpcy5zY2FsZS54LCB5OiB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0IC8gMiAtIHRoaXMueSAvIHRoaXMuc2NhbGUueSB9XHJcbiAgICB9XHJcbiAgICBzZXQgY2VudGVyKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubW92ZUNlbnRlcih2YWx1ZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vdmUgY2VudGVyIG9mIHZpZXdwb3J0IHRvIHBvaW50XHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8UElYSS5Qb2ludExpa2UpfSB4IG9yIHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBtb3ZlQ2VudGVyKC8qeCwgeSB8IFBJWEkuUG9pbnQqLylcclxuICAgIHtcclxuICAgICAgICBsZXQgeCwgeVxyXG4gICAgICAgIGlmICghaXNOYU4oYXJndW1lbnRzWzBdKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB4ID0gYXJndW1lbnRzWzBdLnhcclxuICAgICAgICAgICAgeSA9IGFyZ3VtZW50c1swXS55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucG9zaXRpb24uc2V0KCh0aGlzLndvcmxkU2NyZWVuV2lkdGggLyAyIC0geCkgKiB0aGlzLnNjYWxlLngsICh0aGlzLndvcmxkU2NyZWVuSGVpZ2h0IC8gMiAtIHkpICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdG9wLWxlZnQgY29ybmVyXHJcbiAgICAgKiBAdHlwZSB7UElYSS5Qb2ludExpa2V9XHJcbiAgICAgKi9cclxuICAgIGdldCBjb3JuZXIoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB7IHg6IC10aGlzLnggLyB0aGlzLnNjYWxlLngsIHk6IC10aGlzLnkgLyB0aGlzLnNjYWxlLnkgfVxyXG4gICAgfVxyXG4gICAgc2V0IGNvcm5lcih2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLm1vdmVDb3JuZXIodmFsdWUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHZpZXdwb3J0J3MgdG9wLWxlZnQgY29ybmVyOyBhbHNvIGNsYW1wcyBhbmQgcmVzZXRzIGRlY2VsZXJhdGUgYW5kIGJvdW5jZSAoYXMgbmVlZGVkKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geHxwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIG1vdmVDb3JuZXIoLyp4LCB5IHwgcG9pbnQqLylcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uc2V0KC1hcmd1bWVudHNbMF0ueCAqIHRoaXMuc2NhbGUueCwgLWFyZ3VtZW50c1swXS55ICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgtYXJndW1lbnRzWzBdICogdGhpcy5zY2FsZS54LCAtYXJndW1lbnRzWzFdICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIHRoZSB3aWR0aCBmaXRzIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3aWR0aD10aGlzLl93b3JsZFdpZHRoXSBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXJcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdFdpZHRoKHdpZHRoLCBjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgdGhpcy5fd29ybGRXaWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuX3NjcmVlbldpZHRoIC8gd2lkdGhcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjYWxlLnhcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyB0aGUgaGVpZ2h0IGZpdHMgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2hlaWdodD10aGlzLl93b3JsZEhlaWdodF0gaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0SGVpZ2h0KGhlaWdodCwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLl9zY3JlZW5IZWlnaHQgLyBoZWlnaHRcclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjYWxlLnlcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyBpdCBmaXRzIHRoZSBlbnRpcmUgd29ybGQgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdFdvcmxkKGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5fc2NyZWVuV2lkdGggLyB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICBpZiAodGhpcy5zY2FsZS54IDwgdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyBpdCBmaXRzIHRoZSBlbnRpcmUgd29ybGQgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdChjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuX3NjcmVlbldpZHRoIC8gdGhpcy5fd29ybGRXaWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuX3NjcmVlbkhlaWdodCAvIHRoaXMuX3dvcmxkSGVpZ2h0XHJcbiAgICAgICAgaWYgKHRoaXMuc2NhbGUueCA8IHRoaXMuc2NhbGUueSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NhbGUueFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjYWxlLnlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB2aWV3cG9ydCBieSBhIGNlcnRhaW4gcGVyY2VudCAoaW4gYm90aCB4IGFuZCB5IGRpcmVjdGlvbilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwZXJjZW50IGNoYW5nZSAoZS5nLiwgMC4yNSB3b3VsZCBpbmNyZWFzZSBhIHN0YXJ0aW5nIHNjYWxlIG9mIDEuMCB0byAxLjI1KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhlIHZpZXdwb3J0XHJcbiAgICAgKi9cclxuICAgIHpvb21QZXJjZW50KHBlcmNlbnQsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc2NhbGUgPSB0aGlzLnNjYWxlLnggKyB0aGlzLnNjYWxlLnggKiBwZXJjZW50XHJcbiAgICAgICAgdGhpcy5zY2FsZS5zZXQoc2NhbGUpXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB2aWV3cG9ydCBieSBpbmNyZWFzaW5nL2RlY3JlYXNpbmcgd2lkdGggYnkgYSBjZXJ0YWluIG51bWJlciBvZiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFuZ2UgaW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgem9vbShjaGFuZ2UsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICB0aGlzLmZpdFdpZHRoKGNoYW5nZSArIHRoaXMud29ybGRTY3JlZW5XaWR0aCwgY2VudGVyKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndpZHRoXSB0aGUgZGVzaXJlZCB3aWR0aCB0byBzbmFwICh0byBtYWludGFpbiBhc3BlY3QgcmF0aW8sIGNob29zZSBvbmx5IHdpZHRoIG9yIGhlaWdodClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5oZWlnaHRdIHRoZSBkZXNpcmVkIGhlaWdodCB0byBzbmFwICh0byBtYWludGFpbiBhc3BlY3QgcmF0aW8sIGNob29zZSBvbmx5IHdpZHRoIG9yIGhlaWdodClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTEwMDBdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uQ29tcGxldGU9dHJ1ZV0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBhZnRlciBmaXR0aW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmludGVycnVwdD10cnVlXSBwYXVzZSBzbmFwcGluZyB3aXRoIGFueSB1c2VyIGlucHV0IG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICovXHJcbiAgICBzbmFwWm9vbShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snc25hcC16b29tJ10gPSBuZXcgU25hcFpvb20odGhpcywgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEB0eXBlZGVmIE91dE9mQm91bmRzXHJcbiAgICAgKiBAdHlwZSB7b2JqZWN0fVxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBsZWZ0XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IHJpZ2h0XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IHRvcFxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBib3R0b21cclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogaXMgY29udGFpbmVyIG91dCBvZiB3b3JsZCBib3VuZHNcclxuICAgICAqIEByZXR1cm4ge091dE9mQm91bmRzfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgT09CKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fVxyXG4gICAgICAgIHJlc3VsdC5sZWZ0ID0gdGhpcy5sZWZ0IDwgMFxyXG4gICAgICAgIHJlc3VsdC5yaWdodCA9IHRoaXMucmlnaHQgPiB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgcmVzdWx0LnRvcCA9IHRoaXMudG9wIDwgMFxyXG4gICAgICAgIHJlc3VsdC5ib3R0b20gPSB0aGlzLmJvdHRvbSA+IHRoaXMuX3dvcmxkSGVpZ2h0XHJcbiAgICAgICAgcmVzdWx0LmNvcm5lclBvaW50ID0ge1xyXG4gICAgICAgICAgICB4OiB0aGlzLl93b3JsZFdpZHRoICogdGhpcy5zY2FsZS54IC0gdGhpcy5fc2NyZWVuV2lkdGgsXHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3dvcmxkSGVpZ2h0ICogdGhpcy5zY2FsZS55IC0gdGhpcy5fc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSByaWdodCBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCByaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnggLyB0aGlzLnNjYWxlLnggKyB0aGlzLndvcmxkU2NyZWVuV2lkdGhcclxuICAgIH1cclxuICAgIHNldCByaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnggPSB2YWx1ZSAqIHRoaXMuc2NhbGUueCAtIHRoaXMud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IGxlZnQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAtdGhpcy54IC8gdGhpcy5zY2FsZS54XHJcbiAgICB9XHJcbiAgICBzZXQgbGVmdCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnggPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnhcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgdG9wIGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHRvcCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnkgLyB0aGlzLnNjYWxlLnlcclxuICAgIH1cclxuICAgIHNldCB0b3AodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy55ID0gLXZhbHVlICogdGhpcy5zY2FsZS55XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIGJvdHRvbSBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBib3R0b20oKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAtdGhpcy55IC8gdGhpcy5zY2FsZS55ICsgdGhpcy53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgfVxyXG4gICAgc2V0IGJvdHRvbSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnkgPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnkgLSB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGRpcnR5IChpLmUuLCBuZWVkcyB0byBiZSByZW5kZXJlcmVkIHRvIHRoZSBzY3JlZW4gYmVjYXVzZSBvZiBhIGNoYW5nZSlcclxuICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBnZXQgZGlydHkoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXJ0eVxyXG4gICAgfVxyXG4gICAgc2V0IGRpcnR5KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBlcm1hbmVudGx5IGNoYW5nZXMgdGhlIFZpZXdwb3J0J3MgaGl0QXJlYVxyXG4gICAgICogPHA+Tk9URTogbm9ybWFsbHkgdGhlIGhpdEFyZWEgPSBQSVhJLlJlY3RhbmdsZShWaWV3cG9ydC5sZWZ0LCBWaWV3cG9ydC50b3AsIFZpZXdwb3J0LndvcmxkU2NyZWVuV2lkdGgsIFZpZXdwb3J0LndvcmxkU2NyZWVuSGVpZ2h0KTwvcD5cclxuICAgICAqIEB0eXBlIHsoUElYSS5SZWN0YW5nbGV8UElYSS5DaXJjbGV8UElYSS5FbGxpcHNlfFBJWEkuUG9seWdvbnxQSVhJLlJvdW5kZWRSZWN0YW5nbGUpfVxyXG4gICAgICovXHJcbiAgICBnZXQgZm9yY2VIaXRBcmVhKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZm9yY2VIaXRBcmVhXHJcbiAgICB9XHJcbiAgICBzZXQgZm9yY2VIaXRBcmVhKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcmNlSGl0QXJlYSA9IHZhbHVlXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IHZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcmNlSGl0QXJlYSA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAwLCB0aGlzLndvcmxkV2lkdGgsIHRoaXMud29ybGRIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY291bnQgb2YgbW91c2UvdG91Y2ggcG9pbnRlcnMgdGhhdCBhcmUgZG93biBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGNvdW50RG93blBvaW50ZXJzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMubGVmdERvd24gPyAxIDogMCkgKyB0aGlzLnRvdWNoZXMubGVuZ3RoXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcnJheSBvZiB0b3VjaCBwb2ludGVycyB0aGF0IGFyZSBkb3duIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm4ge1BJWEkuSW50ZXJhY3Rpb25UcmFja2luZ0RhdGFbXX1cclxuICAgICAqL1xyXG4gICAgZ2V0VG91Y2hQb2ludGVycygpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgY29uc3QgcG9pbnRlcnMgPSB0aGlzLnRyYWNrZWRQb2ludGVyc1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBwb2ludGVycylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ZXIgPSBwb2ludGVyc1trZXldXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRvdWNoZXMuaW5kZXhPZihwb2ludGVyLnBvaW50ZXJJZCkgIT09IC0xKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocG9pbnRlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xhbXBzIGFuZCByZXNldHMgYm91bmNlIGFuZCBkZWNlbGVyYXRlIChhcyBuZWVkZWQpIGFmdGVyIG1hbnVhbGx5IG1vdmluZyB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3Jlc2V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydib3VuY2UnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snYm91bmNlJ10ucmVzZXQoKVxyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddLmJvdW5jZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddLnJlc2V0KClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snc25hcCddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwJ10ucmVzZXQoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydjbGFtcCddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcCddLnVwZGF0ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddLmNsYW1wKClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWVcclxuICAgIH1cclxuXHJcbiAgICAvLyBQTFVHSU5TXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGluc3RhbGxlZCBwbHVnaW5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIG9mIHBsdWdpbiAoZS5nLiwgJ2RyYWcnLCAncGluY2gnKVxyXG4gICAgICovXHJcbiAgICByZW1vdmVQbHVnaW4odHlwZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBhdXNlIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHBhdXNlUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5wYXVzZSgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVzdW1lIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHJlc3VtZVBsdWdpbih0eXBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0ucmVzdW1lKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgb25lLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLndoZWVsPXRydWVdIHVzZSB3aGVlbCB0byBzY3JvbGwgaW4geSBkaXJlY3Rpb24gKHVubGVzcyB3aGVlbCBwbHVnaW4gaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndoZWVsU2Nyb2xsPTEwXSBudW1iZXIgb2YgcGl4ZWxzIHRvIHNjcm9sbCB3aXRoIGVhY2ggd2hlZWwgc3BpblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHdoZWVsIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgZHJhZyhvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZHJhZyddID0gbmV3IERyYWcodGhpcywgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIGNsYW1wIHRvIGJvdW5kYXJpZXMgb2Ygd29ybGRcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kaXJlY3Rpb249YWxsXSAoYWxsLCB4LCBvciB5KVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGNsYW1wKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcCddID0gbmV3IENsYW1wKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlY2VsZXJhdGUgYWZ0ZXIgYSBtb3ZlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC45NV0gcGVyY2VudCB0byBkZWNlbGVyYXRlIGFmdGVyIG1vdmVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm91bmNlPTAuOF0gcGVyY2VudCB0byBkZWNlbGVyYXRlIHdoZW4gcGFzdCBib3VuZGFyaWVzIChvbmx5IGFwcGxpY2FibGUgd2hlbiB2aWV3cG9ydC5ib3VuY2UoKSBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluU3BlZWQ9MC4wMV0gbWluaW11bSB2ZWxvY2l0eSBiZWZvcmUgc3RvcHBpbmcvcmV2ZXJzaW5nIGFjY2VsZXJhdGlvblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZGVjZWxlcmF0ZShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddID0gbmV3IERlY2VsZXJhdGUodGhpcywgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYm91bmNlIG9uIGJvcmRlcnNcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnNpZGVzPWFsbF0gYWxsLCBob3Jpem9udGFsLCB2ZXJ0aWNhbCwgb3IgY29tYmluYXRpb24gb2YgdG9wLCBib3R0b20sIHJpZ2h0LCBsZWZ0IChlLmcuLCAndG9wLWJvdHRvbS1yaWdodCcpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC41XSBmcmljdGlvbiB0byBhcHBseSB0byBkZWNlbGVyYXRlIGlmIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTUwXSB0aW1lIGluIG1zIHRvIGZpbmlzaCBib3VuY2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgYm91bmNlKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXSA9IG5ldyBCb3VuY2UodGhpcywgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIHBpbmNoIHRvIHpvb20gYW5kIHR3by1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0xLjBdIHBlcmNlbnQgdG8gbW9kaWZ5IHBpbmNoIHNwZWVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vRHJhZ10gZGlzYWJsZSB0d28tZmluZ2VyIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdHdvIGZpbmdlcnNcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIHBpbmNoKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydwaW5jaCddID0gbmV3IFBpbmNoKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNuYXAgdG8gYSBwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmNlbnRlcl0gc25hcCB0byB0aGUgY2VudGVyIG9mIHRoZSBjYW1lcmEgaW5zdGVhZCBvZiB0aGUgdG9wLWxlZnQgY29ybmVyIG9mIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC44XSBmcmljdGlvbi9mcmFtZSB0byBhcHBseSBpZiBkZWNlbGVyYXRlIGlzIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTAwMF1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW50ZXJydXB0PXRydWVdIHBhdXNlIHNuYXBwaW5nIHdpdGggYW55IHVzZXIgaW5wdXQgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uQ29tcGxldGU9dHJ1ZV0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBhZnRlciBzbmFwcGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgc25hcCh4LCB5LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snc25hcCddID0gbmV3IFNuYXAodGhpcywgeCwgeSwgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZm9sbG93IGEgdGFyZ2V0XHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuRGlzcGxheU9iamVjdH0gdGFyZ2V0IHRvIGZvbGxvdyAob2JqZWN0IG11c3QgaW5jbHVkZSB7eDogeC1jb29yZGluYXRlLCB5OiB5LWNvb3JkaW5hdGV9KVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNwZWVkPTBdIHRvIGZvbGxvdyBpbiBwaXhlbHMvZnJhbWUgKDA9dGVsZXBvcnQgdG8gbG9jYXRpb24pXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmFkaXVzXSByYWRpdXMgKGluIHdvcmxkIGNvb3JkaW5hdGVzKSBvZiBjZW50ZXIgY2lyY2xlIHdoZXJlIG1vdmVtZW50IGlzIGFsbG93ZWQgd2l0aG91dCBtb3ZpbmcgdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmb2xsb3codGFyZ2V0LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZm9sbG93J10gPSBuZXcgRm9sbG93KHRoaXMsIHRhcmdldCwgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB1c2luZyBtb3VzZSB3aGVlbFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBlcmNlbnQ9MC4xXSBwZXJjZW50IHRvIHNjcm9sbCB3aXRoIGVhY2ggc3BpblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY3VycmVudCBtb3VzZSBwb3NpdGlvblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgd2hlZWwob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3doZWVsJ10gPSBuZXcgV2hlZWwodGhpcywgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIGNsYW1waW5nIG9mIHpvb20gdG8gY29uc3RyYWludHNcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pbldpZHRoXSBtaW5pbXVtIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluSGVpZ2h0XSBtaW5pbXVtIGhlaWdodFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdpZHRoXSBtYXhpbXVtIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4SGVpZ2h0XSBtYXhpbXVtIGhlaWdodFxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgY2xhbXBab29tKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10gPSBuZXcgQ2xhbXBab29tKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNjcm9sbCB2aWV3cG9ydCB3aGVuIG1vdXNlIGhvdmVycyBuZWFyIG9uZSBvZiB0aGUgZWRnZXMgb3IgcmFkaXVzLWRpc3RhbmNlIGZyb20gY2VudGVyIG9mIHNjcmVlbi5cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yYWRpdXNdIGRpc3RhbmNlIGZyb20gY2VudGVyIG9mIHNjcmVlbiBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZGlzdGFuY2VdIGRpc3RhbmNlIGZyb20gYWxsIHNpZGVzIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50b3BdIGFsdGVybmF0aXZlbHksIHNldCB0b3AgZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmJvdHRvbV0gYWx0ZXJuYXRpdmVseSwgc2V0IGJvdHRvbSBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubGVmdF0gYWx0ZXJuYXRpdmVseSwgc2V0IGxlZnQgZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJpZ2h0XSBhbHRlcm5hdGl2ZWx5LCBzZXQgcmlnaHQgZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNwZWVkPThdIHNwZWVkIGluIHBpeGVscy9mcmFtZSB0byBzY3JvbGwgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSBkaXJlY3Rpb24gb2Ygc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vRGVjZWxlcmF0ZV0gZG9uJ3QgdXNlIGRlY2VsZXJhdGUgcGx1Z2luIGV2ZW4gaWYgaXQncyBpbnN0YWxsZWRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGluZWFyXSBpZiB1c2luZyByYWRpdXMsIHVzZSBsaW5lYXIgbW92ZW1lbnQgKCsvLSAxLCArLy0gMSkgaW5zdGVhZCBvZiBhbmdsZWQgbW92ZW1lbnQgKE1hdGguY29zKGFuZ2xlIGZyb20gY2VudGVyKSwgTWF0aC5zaW4oYW5nbGUgZnJvbSBjZW50ZXIpKVxyXG4gICAgICovXHJcbiAgICBtb3VzZUVkZ2VzKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydtb3VzZS1lZGdlcyddID0gbmV3IE1vdXNlRWRnZXModGhpcywgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGF1c2Ugdmlld3BvcnQgKGluY2x1ZGluZyBhbmltYXRpb24gdXBkYXRlcyBzdWNoIGFzIGRlY2VsZXJhdGUpXHJcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHBhdXNlKCkgeyByZXR1cm4gdGhpcy5fcGF1c2UgfVxyXG4gICAgc2V0IHBhdXNlKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3BhdXNlID0gdmFsdWVcclxuICAgICAgICB0aGlzLmludGVyYWN0aXZlID0gIXZhbHVlXHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyBhZnRlciBhIG1vdXNlIG9yIHRvdWNoIGNsaWNrXHJcbiAqIEBldmVudCBWaWV3cG9ydCNjbGlja2VkXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSB3b3JsZFxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgZHJhZyBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I2RyYWctc3RhcnRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gc2NyZWVuXHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHdvcmxkXHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBkcmFnIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I2RyYWctZW5kXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSB3b3JsZFxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgcGluY2ggc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNwaW5jaC1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBwaW5jaCBlbmRcclxuICogQGV2ZW50IFZpZXdwb3J0I3BpbmNoLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAtem9vbSBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtem9vbS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwLXpvb20gZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC16b29tLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2Ugc3RhcnRzIGluIHRoZSB4IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXgtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIGVuZHMgaW4gdGhlIHggZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIHN0YXJ0cyBpbiB0aGUgeSBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS15LXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBlbmRzIGluIHRoZSB5IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXktZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBmb3IgYSBtb3VzZSB3aGVlbCBldmVudFxyXG4gKiBAZXZlbnQgVmlld3BvcnQjd2hlZWxcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtvYmplY3R9IHdoZWVsXHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3aGVlbC5keFxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2hlZWwuZHlcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IHdoZWVsLmR6XHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSB3aGVlbC1zY3JvbGwgb2NjdXJzXHJcbiAqIEBldmVudCBWaWV3cG9ydCN3aGVlbC1zY3JvbGxcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgbW91c2UtZWRnZSBzdGFydHMgdG8gc2Nyb2xsXHJcbiAqIEBldmVudCBWaWV3cG9ydCNtb3VzZS1lZGdlLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB0aGUgbW91c2UtZWRnZSBzY3JvbGxpbmcgZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW91c2UtZWRnZS1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVmlld3BvcnQiXX0=