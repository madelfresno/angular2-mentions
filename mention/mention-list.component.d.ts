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
    loadingImgPath: string;
    listPosition: string;
    list: ElementRef;
    itemClick: EventEmitter<{}>;
    constructor(_element: ElementRef);
    position(nativeParentElement: HTMLInputElement, iframe?: HTMLIFrameElement): void;
    readonly activeItem: any;
    activateNextItem(): void;
    activatePreviousItem(): void;
    resetScroll(): void;
}
