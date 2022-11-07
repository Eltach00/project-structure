import NotificationMessage from "../../components/notification"
import SortableList from "../../components/sortable-list"
import fetchJson from "../../utils/fetch-json"


export default class Page {
    element
    subElements
    components = []
    data

    async render() {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = this.getTempalte()

        this.element = wrapper.firstElementChild
        this.subElements = this.getSubElements(this.element)
        this.data = await this.getData()
        this.addCategory(this.data)
        this.addSubCategories(this.data)
        this.addEvents()
        return this.element
    }

    addEvents() {
        this.element.addEventListener('pointerdown', this.handleClose)
        this.element.addEventListener('sortable-list-reorder', this.handleNewOrder)
    }


    handleNewOrder = async (event) => {
        const elem = event.target
        let newWeight = 1
        const newOrder = Array.from(elem.querySelectorAll('[data-id]')).map(item => {
            return {
                id: item.dataset.id,
                weight: newWeight++
            }
        })
        await fetch(process.env.BACKEND_URL + 'api/rest/subcategories', {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newOrder)
        })
        const notification = new NotificationMessage('New Category Saved', {
            duration: 2000,
            type: 'success'
        })
        notification.show()
    }

    handleClose = event => {
        const el = event.target.closest('[data-id]')
        if (el) {
            el.classList.toggle('category_open')
        }
    }
  
    addSubCategories(dataCat) {
        dataCat.forEach(item => {
                const subCat = item.subcategories.map(item => {
                const element = document.createElement('li');
                element.classList.add('categories__sortable-list-item')
                element.dataset.id = item.id
                element.dataset.grabHandle = ''
                element.innerHTML = `
                <strong>${item.title}</strong>
                <span><b>${item.count}</b> products</span>
                `
                return element;
                })
    
            const sortableLsit = new SortableList( { 
                items: subCat
            } )
            this.components.push(sortableLsit)
            this.element.querySelector(`[data-id='${item.id}']`).querySelector('.subcategory-list').append(sortableLsit.element)

        })
    }

    addCategory(data) {
        data.map(item => {
            const category = document.createElement('div')
            category.innerHTML =    /*html */`
            <div class="category category_open" data-id="${item.id}">
            <header class="category__header">
            ${item.title}
            </header>
            <div class="category__body">
            <div class="subcategory-list">
            </div>
            </div>
           </div>`

           this.subElements.categoriesContainer.append(category.firstElementChild)      
        })
    }

    async getData() {
        return await fetchJson(process.env.BACKEND_URL + 'api/rest/categories?_sort=weight&_refs=subcategory')
    }
    
    getTempalte() {
        return /*html */`
            <div class='categories'>
                <div class="content__top-panel">
                <h1 class="page-title">The Categories of Products</h1>
                </div>
                <p>Subcategories can be dragged and dropped to change their order within their category.</p> 
                <div data-element='categoriesContainer'>
                </div>
            </div>
        `
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]')

        return [...elements].reduce((acc, item) => {
            acc[item.dataset.element] = item
            return acc
        }, {})
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

    this.components.forEach(item => item.destroy())

    this.components = {};
    }
}