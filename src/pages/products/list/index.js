import SortableTable from '../../../components/sortable-table';
import header from './product-header.js';
import fetchJson from '../../../utils/fetch-json';
import DoubleSlider from '../../../components/double-slider'

export default class Page {
  element
  subElements
  url = new URL ('api/rest/products', process.env.BACKEND_URL)

  render() {
      const div = document.createElement('div')
      div.innerHTML = this.getTemplate()
      this.element = div.firstElementChild
      this.subElements = this.getSubElements(this.element)
      this.insertComponents()
      this.addEvents(this.element)
      return this.element
  }

  addEvents(element) {
    element.addEventListener('change', this.handleFilterStatus)
    element.addEventListener('input', this.handleFilterName)
    element.addEventListener('range-select', this.handleRange)
  }


  handleRange = event => {
    this.updateComponents(event.detail)
  }

  handleFilterName = event => {
    if (event.target.closest('[data-elem="filterName"]')) {
      this.updateComponents({name: event.target.value})
    }
  }

  handleFilterStatus = event => {
    if (event.target.closest('[data-elem="filterStatus"]')) {
    switch (event.target.value) {
      case '0': this.updateComponents({ status: '0'});
        break;
      case '1': this.updateComponents({ status: '1'});
        break;
    } 
    } 
  }

  async updateComponents({status = '0', from = 0, to = 4000, name = ''}) {
      const data = await this.loadData({status, from, to, name})
      this.components.sortableTable.addRows(data)
    
  }

  async loadData({status = '0', from = 0, to = 4000, name =''}) {
    this.url.searchParams.set('title_like', name)
    this.url.searchParams.set('status', status)
    this.url.searchParams.set('_sort', 'title')
    this.url.searchParams.set('price_gte', from.toString())
    this.url.searchParams.set('price_lte', to.toString())
    this.url.searchParams.set('_order', 'asc')
    this.url.searchParams.set('_end', 30)
    this.url.searchParams.set('_start', 0)
    this.url.searchParams.set('_embed', 'subcategory.category')
    return await fetchJson(this.url)
  }

  insertComponents() {
    const doubleSlider = new DoubleSlider({
      min: 0,
      max: 4000,
    })

    const sortableTable = new SortableTable(header, {
      url: `api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=0&_end=30`,
      isSortLocally: false,
      sorted: {
        id: header.find(item => item.sortable).id,
        order: 'asc'
      }
    })

    this.components = {
      doubleSlider,
      sortableTable,
    }

    Object.keys(this.subElements).forEach( component => {
        this.subElements[component].append(this.components[component].element)
        })
  }

  getTemplate() {
      return /*html */`
      <div class="products-list">
      <div class="content__top-panel">
        <h2 class="page-title">Products</h2>
        <a href="/products/add" class="button-primary">Добавить товар</a>
      </div>
      <div class="content-box content-box_small">
          <form class="form-inline">
            <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
            </div>
            <div class="form-group" data-element="doubleSlider">
            <label class="form-label">Цена:</label>
           </div>
             <div class="form-group">
             <label class="form-label">Статус:</label>
              <select class="form-control" data-elem="filterStatus">
              <option value="" selected>Any</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </form>
      </div>
      <div data-element="sortableTable" class='products-list__container'>
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
      this.element.removeEventListener('change', this.handleFilterStatus)
      this.element.removeEventListener('input', this.handleFilterName)
      this.element.removeEventListener('range-select', this.handleRange)
      this.element = null;

      for (const component of Object.values(this.components)) {
        component.destroy();
      }
  
      this.components = {};
    }
}
