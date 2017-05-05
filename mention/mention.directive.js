"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var mention_list_component_1 = require("./mention-list.component");
var mention_utils_1 = require("./mention-utils");
var KEY_BACKSPACE = 8;
var KEY_TAB = 9;
var KEY_ENTER = 13;
var KEY_SHIFT = 16;
var KEY_ESCAPE = 27;
var KEY_SPACE = 32;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_2 = 50;
/**
 * Angular 2 Mentions.
 * https://github.com/dmacfarlane/angular2-mentions
 *
 * Copyright (c) 2016 Dan MacFarlane
 */
var MentionDirective = (function () {
    function MentionDirective(_element, _componentResolver, _viewContainerRef) {
        this._element = _element;
        this._componentResolver = _componentResolver;
        this._viewContainerRef = _viewContainerRef;
        this.triggerChar = "@";
        this.asyncSearch = false;
        this.minCharacters = 2;
        this.mentionSelect = function (selection) { return selection; };
        this.notifyMentionSelection = new core_1.EventEmitter();
    }
    Object.defineProperty(MentionDirective.prototype, "mention", {
        set: function (items) {
            this.initialItems = items;
        },
        enumerable: true,
        configurable: true
    });
    MentionDirective.prototype.setIframe = function (iframe) {
        this.iframe = iframe;
    };
    MentionDirective.prototype.stopEvent = function (event) {
        //if (event instanceof KeyboardEvent) { // does not work for iframe
        if (!event.wasClick) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    };
    MentionDirective.prototype.blurHandler = function (event) {
        this.stopEvent(event);
        this.stopSearch = true;
        if (this.searchList) {
            this.searchList.hidden = true;
        }
    };
    MentionDirective.prototype.keyHandler = function (event, nativeElement) {
        var _this = this;
        if (nativeElement === void 0) { nativeElement = this._element.nativeElement; }
        var val = mention_utils_1.getValue(nativeElement);
        var pos = mention_utils_1.getCaretPosition(nativeElement, this.iframe);
        var charPressed = event.key;
        if (!charPressed) {
            var charCode = event.which || event.keyCode;
            if (!event.shiftKey && (charCode >= 65 && charCode <= 90)) {
                charPressed = String.fromCharCode(charCode + 32);
            }
            else if (event.shiftKey && charCode === KEY_2) {
                charPressed = this.triggerChar;
            }
            else {
                // TODO (dmacfarlane) fix this for non-alpha keys
                // http://stackoverflow.com/questions/2220196/how-to-decode-character-pressed-from-jquerys-keydowns-event-handler?lq=1
                charPressed = String.fromCharCode(event.which || event.keyCode);
            }
        }
        if (event.keyCode == KEY_ENTER && event.wasClick && pos < this.startPos) {
            // put caret back in position prior to contenteditable menu click
            pos = this.startNode.length;
            mention_utils_1.setCaretPosition(this.startNode, pos, this.iframe);
        }
        //console.log("keyHandler", this.startPos, pos, val, charPressed, event);
        if (charPressed == this.triggerChar) {
            this.startPos = pos;
            this.startNode = (this.iframe ? this.iframe.contentWindow.getSelection() : window.getSelection()).anchorNode;
            this.stopSearch = false;
            if (this.initialItems) {
                setTimeout(function () {
                    _this.items = _this.initialItems;
                    _this.showSearchList(nativeElement);
                }, 0);
            }
        }
        else if (this.startPos >= 0 && !this.stopSearch) {
            if (!event.shiftKey &&
                !event.metaKey &&
                !event.altKey &&
                !event.ctrlKey &&
                pos > this.startPos) {
                if (event.keyCode === KEY_BACKSPACE && pos > 0) {
                    this.searchList.hidden = this.stopSearch;
                    pos--;
                }
                else if (event.keyCode === KEY_BACKSPACE && pos <= 0) {
                    this.stopEvent(event);
                    this.searchList.hidden = true;
                    this.stopSearch = true;
                    return false;
                }
                else {
                    if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                        this.stopEvent(event);
                        this.searchList.hidden = true;
                        // value is inserted without a trailing space for consistency
                        // between element types (div and iframe do not preserve the space)            
                        mention_utils_1.insertValue(nativeElement, this.startPos, pos, this.searchList.activeItem, this.iframe);
                        // fire input event so angular bindings are updated
                        if ("createEvent" in document) {
                            var evt = document.createEvent("HTMLEvents");
                            evt.initEvent("input", false, true);
                            nativeElement.dispatchEvent(evt);
                        }
                        var data = {
                            selectedMention: this.searchList.activeItem,
                            currentSelection: window.getSelection()
                        };
                        this.notifyMentionSelection.emit(data);
                        this.startPos = -1;
                        return false;
                    }
                    else if (event.keyCode === KEY_ESCAPE) {
                        this.stopEvent(event);
                        this.searchList.hidden = true;
                        this.stopSearch = true;
                        return false;
                    }
                    else if (event.keyCode === KEY_DOWN) {
                        this.stopEvent(event);
                        this.searchList.activateNextItem();
                        return false;
                    }
                    else if (event.keyCode === KEY_UP) {
                        this.stopEvent(event);
                        this.searchList.activatePreviousItem();
                        return false;
                    }
                }
                if (event.keyCode === KEY_LEFT || event.keyCode === KEY_RIGHT) {
                    this.stopEvent(event);
                    return false;
                }
                else {
                    // update search          
                    // We need to get the current selection instead of the textContent of the nativeElement
                    val = window.getSelection().anchorNode.textContent;
                    var mention = val.substring(this.startPos, pos);
                    if (event.keyCode !== KEY_BACKSPACE) {
                        mention += charPressed;
                    }
                    if (mention.substring(1).length >= 0) {
                        // This would go inside a setTimeout
                        this.searchAsync(this.callbackFn, mention.substring(1)).subscribe(function (response) {
                            _this.items = response;
                            if (_this.items.length) {
                                _this.showSearchList(nativeElement);
                            }
                        });
                    }
                }
            }
        }
    };
    MentionDirective.prototype.showSearchList = function (nativeElement) {
        var _this = this;
        if (this.searchList == null) {
            var componentFactory = this._componentResolver.resolveComponentFactory(mention_list_component_1.MentionListComponent);
            var componentRef = this._viewContainerRef.createComponent(componentFactory);
            componentRef.instance.loadingImgPath = this.loadingImgPath;
            this.searchList = componentRef.instance;
            this.searchList.items = this.items;
            if (this.searchList.items.length > 0) {
                this.searchList.hidden = false;
            }
            this.searchList.position(nativeElement, this.iframe);
            componentRef.instance['itemClick'].subscribe(function () {
                nativeElement.focus();
                var fakeKeydown = { "keyCode": KEY_ENTER, "wasClick": true };
                _this.keyHandler(fakeKeydown, nativeElement);
            });
        }
        else {
            this.searchList.activeIndex = 0;
            this.searchList.loadingImgPath = this.loadingImgPath;
            this.searchList.items = this.items;
            if (this.searchList.items.length > 0) {
                this.searchList.hidden = false;
            }
            this.searchList.position(nativeElement, this.iframe);
            window.setTimeout(function () { return _this.searchList.resetScroll(); });
        }
    };
    MentionDirective.prototype.searchAsync = function (callbackFn, token) {
        return callbackFn(token);
    };
    return MentionDirective;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], MentionDirective.prototype, "triggerChar", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], MentionDirective.prototype, "asyncSearch", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], MentionDirective.prototype, "minCharacters", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], MentionDirective.prototype, "mention", null);
__decorate([
    core_1.Input(),
    __metadata("design:type", Function)
], MentionDirective.prototype, "callbackFn", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MentionDirective.prototype, "scope", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Function)
], MentionDirective.prototype, "mentionSelect", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], MentionDirective.prototype, "loadingImgPath", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], MentionDirective.prototype, "notifyMentionSelection", void 0);
MentionDirective = __decorate([
    core_1.Directive({
        selector: '[mention]',
        host: {
            '(keydown)': 'keyHandler($event)',
            '(blur)': 'blurHandler($event)'
        }
    }),
    __metadata("design:paramtypes", [core_1.ElementRef,
        core_1.ComponentFactoryResolver,
        core_1.ViewContainerRef])
], MentionDirective);
exports.MentionDirective = MentionDirective;
