/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { NgaMenuService } from '@akveo/nga-theme';
import { Subscription } from 'rxjs/Subscription';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'ngd-page',
  styleUrls: ['page.component.scss'],
  template: `
    <nga-card>
      <nga-card-header>{{ currentItem?.name }}</nga-card-header>
      <nga-card-body>
        <!--<ngd-themes-header *ngIf="currentItem?.name === 'NgaThemes'"></ngd-themes-header>-->
        <ng-container *ngFor="let item of currentItem?.children">
          <ng-container [ngSwitch]="item.block">
            
            <ngd-markdown-block *ngSwitchCase="'markdown'" [block]="item"></ngd-markdown-block>
            <ngd-component-block *ngSwitchCase="'component'" [blockData]="item.blockData"></ngd-component-block>
            <ngd-theme-block *ngSwitchCase="'theme'" [block]="item"></ngd-theme-block>
            
          </ng-container>
        </ng-container>
       </nga-card-body>
     </nga-card>
  `,
})
export class NgdPageComponent implements OnDestroy, OnInit {

  currentItem: any;
  private routerSubscription: Subscription;
  private initialSubscription: Subscription;

  constructor(private menuService: NgaMenuService,
              private router: Router,
              private titleService: Title) { }

  ngOnInit() {
    this.initialSubscription = this.menuService.getSelectedItem('leftMenu')
      .subscribe((event: {tag: string, item: any}) => {
        if (event && event.item && event.item.data) {
          this.currentItem = event.item.data;
          this.titleService.setTitle(`NGA Documentation - ${event.item.data.name}`);
        }
      });

    this.routerSubscription = this.router.events
      .filter(event => event instanceof NavigationEnd)
      .switchMap(event => this.menuService.getSelectedItem('leftMenu'))
      .subscribe((event: {tag: string, item: any}) => {
        if (event && event.item && event.item.data) {
          this.currentItem = event.item.data;
          this.titleService.setTitle(`NGA Documentation - ${event.item.data.name}`);
        }
      });
  }

  ngOnDestroy() {
    this.initialSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }
}
