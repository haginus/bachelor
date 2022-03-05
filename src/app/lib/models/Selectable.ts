export class Selectable<T> {
  public selectedItems: T[];
  public selectedItemsDict: { [id: number]: boolean }; 
  public getKey: (item: T) => number;
  private itemStore: { [id: number]: T } = {};
  private _currentPage: T[];
  public currentPageStatus: number;

  constructor(getKey: (item: T) => number) {
    this.getKey = getKey;
    this.reset();
  }

  toggleItem(item: T, select?: boolean) {
    this._toggleItem(item, select);
    this.fetchSelectedItems();
    this.fetchCurrentPageStatus();
  }

  private _toggleItem(item: T, select?: boolean) {
    const key = this.getKey(item);
    this.selectedItemsDict[key] = select ?? !this.selectedItemsDict[key];
    this.itemStore[key] = item;
  }

  private fetchSelectedItems() {
    this.selectedItems = Object.entries(this.selectedItemsDict)
      .filter(([_, isSelected]) => isSelected)
      .map(([key, _]) => this.itemStore[key]);
  }

  public setCurrentPage(items: T[]) {
    this._currentPage = items;
    this.fetchCurrentPageStatus();
  }

  private fetchCurrentPageStatus() {
    const selectedLength = this._currentPage.filter(item => this.selectedItemsDict[this.getKey(item)]).length;
    if(selectedLength == 0) {
      this.currentPageStatus = 0;
    } else if(selectedLength < this._currentPage.length) {
      this.currentPageStatus = 1;
    } else {
      this.currentPageStatus = 2;
    }
  }

  public toggleAll(select?: boolean) {
    let _select: boolean = false;
    if(select != null) {
      _select = select;
    } else {
      _select = this.currentPageStatus == 2 ? false : true;
    }
    this._currentPage.forEach(item => {
      this._toggleItem(item, _select);
    });
    this.fetchSelectedItems();
    this.fetchCurrentPageStatus();
  }

  public reset() {
    this.selectedItemsDict = {};
    this.selectedItems = [];
    this.currentPageStatus = 0;
  }
}