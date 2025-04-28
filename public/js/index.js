const socket = io();

// Obtener el formulario de nuevos productos
const formNewProduct = document.getElementById('formNewProduct');

// Enviar el formulario de nuevo producto al servidor
formNewProduct.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(formNewProduct);
    const productData = {};

    // Recoger los datos del formulario en un objeto
    formData.forEach((value, key) => {
        productData[key] = value;
    });

    console.log('Producto creado:', productData); // Aquí debería ser productData

    // Emitir el producto al servidor
    socket.emit('newProduct', productData);

    // Limpiar el formulario después de enviarlo
    formNewProduct.reset();
});

// Recibir nuevos productos desde el servidor y agregarlos al DOM
socket.on('productAdded', (newProduct) => {
    const productList = document.getElementById('productList');

    // Crear un nuevo elemento de lista para el producto
    const li = document.createElement('li');
    li.setAttribute('data-id', newProduct.id); // Añadir el ID para referencia
    li.innerHTML = `${newProduct.title} - ${newProduct.price}
                    <button class="delete-btn" data-id="${newProduct.id}">Eliminar</button>`;

    // Agregar el nuevo producto a la lista en el cliente
    productList.appendChild(li);
});

// Recibir la lista de productos cuando se conecta un cliente
socket.on('product-list', (products) => {
    const productList = document.getElementById('productList');
    products.forEach(product => {
        const li = document.createElement('li');
        li.setAttribute('data-id', product.id);
        li.innerHTML = `${product.title} - ${product.price}
                        <button class="delete-btn" data-id="${product.id}">Eliminar</button>`;
        productList.appendChild(li);
    });
});