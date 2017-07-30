import { Component, OnInit, Input, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { DocsService } from '../../docs.service';

@Component({
  selector: 'ngd-theme-block',
  template: `
<div class="block-container">
  <div class="theme-header" >
    <div class="theme-header-content">
      <span class="block-title"><a [routerLink]="" fragment="{{themeName}}" ngdFragment> <i class="ion-link"></i></a> Theme {{themeName}}</span>
        <span *ngIf="parentTheme">inherited from {{parentTheme}} theme</span>
      <div class="theme-filter">
        <input #searchInput (keyup)="searchTerms$.next(searchInput.value)">
        <p *ngIf="isWarning" class="filter-warning">Nothing found</p>
      </div>
    </div>
  </div>
  <table class="table">
    <thead>
      <tr>
        <td>Name</td>
        <td>Value</td>
        <td>Parent</td>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let prop of filteredContent;" fragment="{{themeName}}Theme-{{prop.name}}" tableCell ngdFragment>
        <td>
          <a [routerLink]="" fragment="{{themeName}}Theme-{{prop.name}}">{{ prop.name }}</a> 
        </td>
        <td ngdSassValue>{{ prop.value }}</td>
        <td class="theme-parents-cell">
          <a [routerLink]="" fragment="{{prop.parents[0]?.theme}}Theme-{{prop.parents[0]?.prop}}" remoteLink ngdFragment>
            {{ prop.parents[0]?.prop }}
            <span *ngIf="prop.parents[0] && prop.parents[0].theme !== themeName">({{prop.parents[0]?.theme}})</span>
          </a>
          <div *ngIf="prop.parents.length > 1" class="theme-prop-parents">
            <span *ngFor="let parent of prop.parents | slice:1">
              <i class="inheritance-icon ion-arrow-left-c"></i>
              <a [routerLink]="" fragment="{{parent.theme}}Theme-{{parent.prop}}" remoteLink ngdFragment>
                {{ parent.prop }}
                <span *ngIf="parent.theme !== themeName">({{parent.theme}})</span>
                </a>
             </span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
`,
})
export class NgdThemeComponent implements OnInit, OnDestroy {
  themeContent: any;
  themeName: string;
  filteredContent: any;
  parentTheme: string;
  searchFieldValue: string;
  isWarning: boolean = false;

  private searchTerms$  = new Subject();
  private fragmentSubscription: Subscription;
  private themesSubscription: Subscription;
  private searchTermsSubscription: Subscription;

  @Input('block')
  set setProps(block: any) {
    this.themeContent = Object.keys(block.blockData.data).map(key => block.blockData.data[key]);
    this.filteredContent = this.themeContent;
    this.themeName = block.blockData.name;
    this.parentTheme = block.blockData.parent;
  }

  constructor(private route: ActivatedRoute,
              private el: ElementRef,
              private docsService: DocsService) { }

  ngOnInit() {
    this.fragmentSubscription = this.route.fragment
      .subscribe(fr => {
        this.searchTerms$.next('');
      });

    this.docsService.registerThemePosition({ name: this.themeName, position: this.el.nativeElement.offsetTop,
      parentTheme: this.parentTheme });

    this.themesSubscription = this.docsService.onFiltering()
      .subscribe(event => {
        if (event.theme === this.themeName) {
          const filterResult = this.themeContent.filter(item => {
            return new RegExp(`${event.term}`, 'gi').test(`${item.name} ${item.value}`);
          });
          if (filterResult.length > 0) {
            this.filteredContent = filterResult;
            this.isWarning = false;
          } else {
            this.filteredContent = this.themeContent;
            this.isWarning = true;
          }
          this.el.nativeElement.scrollIntoView();
          window.scrollBy(0, -80);
        }
        setTimeout(() => {
          this.docsService.registerThemePosition({
            name: this.themeName, position:
            this.el.nativeElement.offsetTop,
            parentTheme: this.parentTheme,
          });
        }, 100);
      });

    this.searchTermsSubscription = this.searchTerms$
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe((term: string) => this.docsService.filterData(term, this.themeName));
  }

  @HostListener('window:scroll', ['$event'])
  onResize(event) {
    this.docsService.registerThemePosition({
      name: this.themeName,
      position: this.el.nativeElement.offsetTop,
      parentTheme: this.parentTheme,
    });
  }

  ngOnDestroy() {
    this.fragmentSubscription.unsubscribe();
    this.themesSubscription.unsubscribe();
    this.searchTermsSubscription.unsubscribe();
  }
}
