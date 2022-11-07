import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './orders-header.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element
  subElements
  url = new URL ('api/rest/orders', process.env.BACKEND_URL)

  render() {
      const div = document.createElement('div')
      div.innerHTML = this.getTemplate()
      this.element = div.firstElementChild
      this.subElements = this.getSubElements(this.element)
      this.insertComponents(this.element)
      this.addEvents()
      return this.element
  }

  addEvents() {
      this.components.rangePicker.element.addEventListener('date-select', event => {
          const selected = event.detail
          this.updateComponents(selected)
      })
  }

  async updateComponents({from, to}) {
      const data = await this.loadData(from, to)
      this.components.sortableTable.addRows(data)
    
  }


  async loadData(from, to) {
    this.url.searchParams.set('createdAt_gte', from.toISOString())
    this.url.searchParams.set('createdAt_lte', to.toISOString())
    this.url.searchParams.set('_sort', 'id')
    this.url.searchParams.set('_order', 'desc')
    this.url.searchParams.set('_end', 30)
    this.url.searchParams.set('_start', 0)
    return await fetchJson(this.url)
  }

  insertComponents() {
      const now = new Date();
      const to = new Date();
      const from = new Date(now.setMonth(now.getMonth() - 1));
  
      const rangePicker = new RangePicker({
        from,
        to
      });
      const sortableTable = new SortableTable(header, {
        url: `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_sort=id&_order=desc&_start=0&_end=30`,
        isSortLocally: false,
        haveLinks: false
      })

      this.components = {
        rangePicker,
        sortableTable,
      }


      Object.keys(this.subElements).forEach( component => {
          this.subElements[component].append(this.components[component].element)
          })
  }

  getTemplate() {
      return /*html */`
      <div class="sales">
      <div class="content__top-panel">
        <h2 class="page-title">Sales</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`
  }

  getSubElements(element) {
      const elements = element.querySelectorAll('[data-element]')

      return [...elements].reduce((acc, item)=>{
          acc[item.dataset.element] = item
          return acc
      } ,{})
  }

  remove () {
      if (this.element) {
        this.element.remove();
      }
    }
  
    destroy () {
      this.remove();
      this.subElements = {};
      this.element = null;
  
      for (const component of Object.values(this.components)) {
        component.destroy();
      }
  
      this.components = {};
    }
}
