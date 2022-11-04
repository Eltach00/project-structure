const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number',
  },
  {
    id: 'user',
    title: 'Client',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Date',
    sortable: true,
    template: data => `<div class="sortable-table__cell">${new Date(data).toLocaleString("default", { dateStyle: "medium"})}</div>`,
    sortType: 'number'
  },
  {
    id: 'totalCost',
    title: 'Price',
    sortable: true,
    sortType: 'number',
    template: data => `<div class="sortable-table__cell">$${data}</div>`,
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true,
    sortType: 'string',
  },
];

export default header;
