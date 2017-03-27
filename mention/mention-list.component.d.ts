import { ElementRef, EventEmitter } from '@angular/core';
/**
 * Angular 2 Mentions.
 * https://github.com/dmacfarlane/angular2-mentions
 *
 * Copyright (c) 2016 Dan MacFarlane
 */
export declare class MentionListComponent {
    private _element;
    loadingImgPath: string;
    items: any[];
    data: any;
    activeIndex: number;
    hidden: boolean;
    list: ElementRef;
    itemClick: EventEmitter<{}>;
    constructor(_element: ElementRef, loadingImgPath: string);
    position(nativeParentElement: HTMLInputElement, iframe?: HTMLIFrameElement): void;
    readonly activeItem: any;
    activateNextItem(): void;
    activatePreviousItem(): void;
    resetScroll(): void;
}
