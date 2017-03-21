import { ElementRef, EventEmitter } from '@angular/core';
/**
 * Angular 2 Mentions.
 * https://github.com/dmacfarlane/angular2-mentions
 *
 * Copyright (c) 2016 Dan MacFarlane
 */
export declare class MentionListComponent {
    private _element;
    items: any[];
    data: any;
    activeIndex: number;
    hidden: boolean;
    list: ElementRef;
    itemClick: EventEmitter<{}>;
    constructor(_element: ElementRef);
    position(nativeParentElement: HTMLInputElement, iframe?: HTMLIFrameElement, isMobile?: boolean): void;
    readonly activeItem: any;
    activateNextItem(): void;
    activatePreviousItem(): void;
    resetScroll(): void;
}
