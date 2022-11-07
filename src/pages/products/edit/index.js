import NotificationMessage from "../../../components/notification";
import ProductForm from "../../../components/product-form";


export default class Page {
  element;
  subElements = {};
  components = {};

  constructor(match) {
    this.productId = match[1]
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate()

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element)
    this.initComponents()
    this.addEvents()
    return this.element;
  }

  addEvents() {
    this.element.addEventListener('product-saved', this.handleSave)
    this.element.addEventListener('product-updated', this.handleSave)
  }

  handleSave = event => {
    const notification = new NotificationMessage('Product Saved', {
      duration: 2000,
      type: 'success'
    })
    notification.show()
  }

  async initComponents() {
    const productForm = new ProductForm(this.productId)

    this.components = {
      productForm
    }
    const element = await productForm.render()
    this.subElements.productForm.append(element)
  }

  getTemplate() {
    return /*html */`
    <div class='products-edit'>
      <div class="content__top-panel">
      <h1 class="page-title">
        <a href="/products" class="link">Товары</a> / Добавить
      </h1>
      </div>

      <div class='content-box' data-element='productForm'></div>
    </div>
    `
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
