import {Component, ElementRef, Output, EventEmitter, ViewChild} from '@angular/core';

import { isInputOrTextAreaElement, getContentEditableCaretCoords } from './mention-utils';
import { getCaretCoordinates } from './caret-coords';

/**
 * Angular 2 Mentions.
 * https://github.com/dmacfarlane/angular2-mentions
 *
 * Copyright (c) 2016 Dan MacFarlane
 */
@Component({
  selector: 'mention-list',
  /*styles: [`
      .scrollable-menu {
        display: block;
        height: auto;
        max-height: 300px;
        overflow: auto;
      }
    `,`
      [hidden] {
        display: none;
      }
    `],
  template: `
    <ul class="dropdown-menu scrollable-menu" #list [hidden]="hidden">
        <li *ngFor="let item of items; let i = index" [class.active]="activeIndex==i">            
            <a class="text-primary" (mousedown)="activeIndex=i;itemClick.emit();$event.preventDefault()">{{item.name}}</a>
        </li>
    </ul>
    `*/
    template: `
    <ul class="dropdown-menu" #list [hidden]="hidden">
        <li *ngFor="let item of items; let i = index" [class.active]="activeIndex==i">            
          <a href="#" class="dropdown-cnt-img-profile">
            <div class="cnt-img-profile">
                <img class="profile-clip" width="100" height="100" clip-path="url(#svgPath)" xmlns:xlink="http://www.w3.org/1999/xlink" src="{{item.img}}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" style="" class="svg">
                  <defs>
                      <style>
                          .svg-border {
                              fill: none;
                          }
                      </style>
                      <clipPath id="svgPath">
                          <path class="cls-1" d="M81.784,82.488,56.656,96.994c-5.778,3.333-15.225,3.333-21.027,0L10.5,82.488C4.723,79.155,0,70.955,0,64.29V35.278c0-6.665,4.723-14.865,10.5-18.2L35.629,2.575c5.778-3.333,15.225-3.333,21.027,0L81.784,17.08c5.778,3.333,10.5,11.533,10.5,18.2V64.29C92.285,70.955,87.562,79.155,81.784,82.488Z" width="100" height="100"></path>
                      </clipPath>
                  </defs>
                </svg>
              </div>
          </a>
          <a href="#" class="item-info" (mousedown)="activeIndex=i;itemClick.emit();$event.preventDefault()">
            {{item.name}}
          </a>          
        </li>
    </ul>
    `
})
export class MentionListComponent {
  items = [];
  data: any;
  activeIndex: number = 0;
  hidden: boolean = false;
  @ViewChild('list') list : ElementRef;
  @Output() itemClick = new EventEmitter();
  constructor(private _element: ElementRef) {}

  // lots of confusion here between relative coordinates and containers
  position(nativeParentElement: HTMLInputElement, iframe: HTMLIFrameElement = null) {
    let coords = { top: 0, left: 0 };
    if (isInputOrTextAreaElement(nativeParentElement)) {
      // parent elements need to have postition:relative for this to work correctly?
      coords = getCaretCoordinates(nativeParentElement, nativeParentElement.selectionStart);
      coords.top = nativeParentElement.offsetTop + coords.top + 16;
      coords.left = nativeParentElement.offsetLeft + coords.left;
    }
    else if (iframe) {
      let context: { iframe: HTMLIFrameElement, parent: Element } = { iframe: iframe, parent: iframe.offsetParent };
      coords = getContentEditableCaretCoords(context);
    }
    else {
      let doc = document.documentElement;
      let scrollLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
      let scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

      // bounding rectangles are relative to view, offsets are relative to container?
      let caretRelativeToView = getContentEditableCaretCoords({ iframe: iframe });
      let parentRelativeToContainer: ClientRect = nativeParentElement.getBoundingClientRect();

      coords.top = caretRelativeToView.top - parentRelativeToContainer.top + nativeParentElement.offsetTop - scrollTop;
      coords.left = caretRelativeToView.left - parentRelativeToContainer.left + nativeParentElement.offsetLeft - scrollLeft;
    }
    let el: HTMLElement = this._element.nativeElement;
    el.style.position = "absolute";
    el.style.left = coords.left + 'px';
    el.style.top = coords.top + 'px';
  }

  get activeItem() {
    //return this.items[this.activeIndex];
    return this.items[this.activeIndex].name;
  }

  activateNextItem() {
    // adjust scrollable-menu offset if the next item is out of view
    let listEl: HTMLElement = this.list.nativeElement;
    let activeEl = listEl.getElementsByClassName('active').item(0);
    if (activeEl) {
      let nextLiEl: HTMLElement = <HTMLElement> activeEl.nextSibling;
      if (nextLiEl && nextLiEl.nodeName == "LI") {
        let nextLiRect: ClientRect = nextLiEl.getBoundingClientRect();
        if (nextLiRect.bottom > listEl.getBoundingClientRect().bottom) {
          listEl.scrollTop = nextLiEl.offsetTop + nextLiRect.height - listEl.clientHeight;
        }
      }
    }
    // select the next item
    this.activeIndex = Math.max(Math.min(this.activeIndex + 1, this.items.length - 1), 0);    
  }

  activatePreviousItem() {
    // adjust the scrollable-menu offset if the previous item is out of view
    let listEl: HTMLElement = this.list.nativeElement;
    let activeEl = listEl.getElementsByClassName('active').item(0);
    if (activeEl) {
      let prevLiEl: HTMLElement = <HTMLElement> activeEl.previousSibling;
      if (prevLiEl && prevLiEl.nodeName == "LI") {
        let prevLiRect: ClientRect = prevLiEl.getBoundingClientRect();
        if (prevLiRect.top < listEl.getBoundingClientRect().top) {
          listEl.scrollTop = prevLiEl.offsetTop;
        }
      }
    }
    // select the previous item
    this.activeIndex = Math.max(Math.min(this.activeIndex - 1, this.items.length - 1), 0);
  }
  
  resetScroll() {
    this.list.nativeElement.scrollTop = 0;
  }
}
