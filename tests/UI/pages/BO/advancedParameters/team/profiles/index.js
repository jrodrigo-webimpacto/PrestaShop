require('module-alias/register');
const BOBasePage = require('@pages/BO/BObasePage');

class Profiles extends BOBasePage {
  constructor() {
    super();

    this.pageTitle = 'Profiles';

    // Selectors
    // Header links
    this.addNewProfileLink = '#page-header-desc-configuration-add[title=\'Add new profile\']';
    // List of profiles
    this.profileGridPanel = '#profile_grid_panel';
    this.profileGridTitle = `${this.profileGridPanel} h3.card-header-title`;
    this.profilesListForm = '#profile_grid';
    this.profilesListTableRow = row => `${this.profilesListForm} tbody tr:nth-child(${row})`;
    this.profilesListTableColumn = (row, column) => `${this.profilesListTableRow(row)} td.column-${column}`;
    this.profilesListTableColumnAction = row => this.profilesListTableColumn(row, 'actions');
    this.profilesListTableToggleDropDown = row => `${this.profilesListTableColumnAction(row)
    } a[data-toggle='dropdown']`;
    this.profilesListTableDeleteLink = row => `${this.profilesListTableColumnAction(row)} a.grid-delete-row-link`;
    this.profilesListTableEditLink = row => `${this.profilesListTableColumnAction(row)} a.grid-edit-row-link`;
    // Filters
    this.profileFilterInput = filterBy => `${this.profilesListForm} #profile_${filterBy}`;
    this.filterSearchButton = `${this.profilesListForm} .grid-search-button`;
    this.filterResetButton = `${this.profilesListForm} .grid-reset-button`;
    // Bulk Actions
    this.selectAllRowsLabel = `${this.profilesListForm} tr.column-filters .grid_bulk_action_select_all`;
    this.bulkActionsToggleButton = `${this.profilesListForm} button.dropdown-toggle`;
    this.bulkActionsDeleteButton = `${this.profilesListForm} #profile_grid_bulk_action_bulk_delete_profiles`;
    // Delete modal
    this.confirmDeleteModal = '#profile-grid-confirm-modal';
    this.confirmDeleteButton = `${this.confirmDeleteModal} button.btn-confirm-submit`;
    // Pages selectors
    this.pagesPaginationLimitSelect = '#paginator_select_page_limit';
    this.pagesPaginationLabel = `${this.profilesListForm} .col-form-label`;
    this.pagesPaginationNextLink = `${this.profilesListForm} #pagination_next_url`;
    this.pagesPaginationPreviousLink = `${this.profilesListForm} [aria-label='Previous']`;
    // Sort Selectors
    this.tableHead = `${this.profileGridPanel} thead`;
    this.sortColumnDiv = column => `${this.tableHead} div.ps-sortable-column[data-sort-col-name='${column}']`;
    this.sortColumnSpanButton = column => `${this.sortColumnDiv(column)} span.ps-sort`;
  }

  /*
  Methods
   */

  /**
   * Go to new profile page
   * @param page
   * @returns {Promise<void>}
   */
  async goToAddNewProfilePage(page) {
    await this.clickAndWaitForNavigation(page, this.addNewProfileLink);
  }

  /**
   * get text from a column from table
   * @param page
   * @param row
   * @param column
   * @returns {Promise<string>}
   */
  async getTextColumnFromTable(page, row, column) {
    return this.getTextContent(page, this.profilesListTableColumn(row, column));
  }

  /**
   * get number of elements in grid
   * @param page
   * @returns {Promise<number>}
   */
  async getNumberOfElementInGrid(page) {
    return this.getNumberFromText(page, this.profileGridTitle);
  }

  /**
   * Reset input filters
   * @param page
   * @returns {Promise<number>}
   */
  async resetAndGetNumberOfLines(page) {
    if (await this.elementVisible(page, this.filterResetButton, 2000)) {
      await this.clickAndWaitForNavigation(page, this.filterResetButton);
    }
    return this.getNumberOfElementInGrid(page);
  }

  /**
   * Go to Edit profile page
   * @param page
   * @param row, row in table
   * @returns {Promise<void>}
   */
  async goToEditProfilePage(page, row) {
    // Click on edit
    await this.clickAndWaitForNavigation(page, this.profilesListTableEditLink(row));
  }

  /**
   * Filter list of profiles
   * @param page
   * @param filterType, input or select to choose method of filter
   * @param filterBy, column to filter
   * @param value, value to filter with
   * @returns {Promise<void>}
   */
  async filterProfiles(page, filterType, filterBy, value = '') {
    switch (filterType) {
      case 'input':
        await this.setValue(page, this.profileFilterInput(filterBy), value.toString());
        break;
      case 'select':
        await this.selectByVisibleText(page, this.profileFilterInput(filterBy), value ? 'Yes' : 'No');
        break;
      default:
      // Do nothing
    }
    // click on search
    await this.clickAndWaitForNavigation(page, this.filterSearchButton);
  }

  /**
   * Delete profile
   * @param page
   * @param row, row in table
   * @returns {Promise<string>}
   */
  async deleteProfile(page, row) {
    // Click on dropDown
    await Promise.all([
      page.click(this.profilesListTableToggleDropDown(row)),
      this.waitForVisibleSelector(
        page,
        `${this.profilesListTableToggleDropDown(row)}[aria-expanded='true']`),
    ]);
    // Click on delete and wait for modal
    await Promise.all([
      page.click(this.profilesListTableDeleteLink(row)),
      this.waitForVisibleSelector(page, `${this.confirmDeleteModal}.show`),
    ]);
    await this.confirmDeleteProfiles(page);
    return this.getTextContent(page, this.alertSuccessBlockParagraph);
  }


  /**
   * Confirm delete with in modal
   * @param page
   * @return {Promise<void>}
   */
  async confirmDeleteProfiles(page) {
    await this.clickAndWaitForNavigation(page, this.confirmDeleteButton);
  }

  /**
   * Delete all profiles with Bulk Actions
   * @param page
   * @returns {Promise<string>}
   */
  async deleteBulkActions(page) {
    this.dialogListener(page);
    // Click on Select All
    await Promise.all([
      page.$eval(this.selectAllRowsLabel, el => el.click()),
      this.waitForVisibleSelector(page, `${this.bulkActionsToggleButton}:not([disabled])`),
    ]);
    // Click on Button Bulk actions
    await Promise.all([
      page.click(this.bulkActionsToggleButton),
      this.waitForVisibleSelector(page, this.bulkActionsToggleButton),
    ]);
    // Click on delete and wait for modal
    await this.clickAndWaitForNavigation(page, this.bulkActionsDeleteButton);
    return this.getTextContent(page, this.alertSuccessBlockParagraph);
  }

  /**
   * Select profiles pagination limit
   * @param page
   * @param number
   * @returns {Promise<string>}
   */
  async selectPaginationLimit(page, number) {
    await this.selectByVisibleText(page, this.pagesPaginationLimitSelect, number);
    return this.getTextContent(page, this.pagesPaginationLabel);
  }

  /**
   * profiles pagination next
   * @param page
   * @returns {Promise<string>}
   */
  async paginationNext(page) {
    await this.clickAndWaitForNavigation(page, this.pagesPaginationNextLink);
    return this.getTextContent(page, this.pagesPaginationLabel);
  }

  /**
   * profiles pagination previous
   * @param page
   * @returns {Promise<string>}
   */
  async paginationPrevious(page) {
    await this.clickAndWaitForNavigation(page, this.pagesPaginationPreviousLink);
    return this.getTextContent(page, this.pagesPaginationLabel);
  }

  // Sort methods
  /**
   * Get content from all rows
   * @param page
   * @param column
   * @returns {Promise<[]>}
   */
  async getAllRowsColumnContent(page, column) {
    const rowsNumber = await this.getNumberOfElementInGrid(page);
    const allRowsContentTable = [];
    for (let i = 1; i <= rowsNumber; i++) {
      let rowContent = await this.getTextContent(page, this.profilesListTableColumn(i, column));
      if (column === 'active') {
        rowContent = await this.getToggleColumnValue(page, i).toString();
      }
      await allRowsContentTable.push(rowContent);
    }
    return allRowsContentTable;
  }

  /**
   * Sort table
   * @param page
   * @param sortBy, column to sort with
   * @param sortDirection, asc or desc
   * @returns {Promise<void>}
   */
  async sortTable(page, sortBy, sortDirection = 'asc') {
    const sortColumnDiv = `${this.sortColumnDiv(sortBy)}[data-sort-direction='${sortDirection}']`;
    const sortColumnSpanButton = this.sortColumnSpanButton(sortBy);
    let i = 0;
    while (await this.elementNotVisible(page, sortColumnDiv, 1000) && i < 2) {
      await this.clickAndWaitForNavigation(page, sortColumnSpanButton);
      i += 1;
    }
    await this.waitForVisibleSelector(page, sortColumnDiv);
  }
}

module.exports = new Profiles();
