document.addEventListener("DOMContentLoaded", () => {
    const socket = io();
    const formNewProduct = document.getElementById("formNewProduct");
    const productList = document.getElementById("productList");
    const viewCartButton = document.getElementById("view-cart");
  
    let isSubmitting = false;
  
    const showNotification = (message, type = "success") => {
      if (type === "error") {
        console.error(message);
      } else {
        console.log(message);
      }
    };
  
    if (formNewProduct && productList) {
      formNewProduct.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (isSubmitting) return;
        isSubmitting = true;
  
        const formData = new FormData(formNewProduct);
  
        try {
          const response = await fetch("/api/products", {
            method: "POST",
            body: formData,
          });
  
          if (response.ok) {
            await response.json();
            showNotification("Producto agregado con éxito.");
            formNewProduct.reset();
          } else {
            const error = await response.json();
            showNotification(`Error: ${error.message}`, "error");
          }
        } catch {
          showNotification("Hubo un problema al agregar el producto.", "error");
        } finally {
          isSubmitting = false;
        }
      });
  
      socket.on("productAdded", (newProduct) => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.setAttribute("data-id", newProduct._id);
  
        productCard.innerHTML = `
          <h2 class="product-title">${newProduct.title}</h2>
          <h3 class="product-price">Precio: $${newProduct.price}</h3>
          <button class="add-to-cart-btn btn" data-id="${newProduct._id}">Agregar al carrito</button>
          <button class="delete-btn btn" data-id="${newProduct._id}">Eliminar</button>
        `;
  
        productList.appendChild(productCard);
      });
  
      socket.on("productDeleted", (productId) => {
        const card = productList.querySelector(`[data-id="${productId}"]`);
        if (card) card.remove();
      });
    }
  
    // Botón "Ver Carrito"
    if (viewCartButton) {
      viewCartButton.addEventListener("click", async () => {
        let cartId = localStorage.getItem("cartId");
  
        if (cartId) {
          try {
            const response = await fetch(`/api/carts/${cartId}`);
            if (!response.ok) {
              cartId = null;
              localStorage.removeItem("cartId");
            } else {
              window.location.href = `/carts/${cartId}`;
              return;
            }
          } catch {
            showNotification("Hubo un problema al validar el carrito.", "error");
            return;
          }
        }
  
        // Crear nuevo carrito
        try {
          const response = await fetch("/api/carts", { method: "POST" });
          if (!response.ok) throw new Error("No se pudo crear el carrito.");
          const data = await response.json();
          cartId = data.payload._id;
          localStorage.setItem("cartId", cartId);
          window.location.href = `/carts/${cartId}`;
        } catch (error) {
          showNotification("Hubo un problema al crear el carrito.", "error");
        }
      });
    }
  
    // Delegación para "Agregar al carrito"
    document.body.addEventListener("click", async (event) => {
      if (event.target.classList.contains("add-to-cart-btn")) {
        const productId = event.target.dataset.id;
        let cartId = localStorage.getItem("cartId");
  
        if (cartId) {
          try {
            const response = await fetch(`/api/carts/${cartId}`);
            if (!response.ok) {
              cartId = null;
              localStorage.removeItem("cartId");
            }
          } catch {
            cartId = null;
          }
        }
  
        if (!cartId) {
          try {
            const response = await fetch("/api/carts", { method: "POST" });
            if (!response.ok) throw new Error();
            const data = await response.json();
            cartId = data.payload._id;
            localStorage.setItem("cartId", cartId);
          } catch {
            showNotification("Hubo un problema al crear el carrito.", "error");
            return;
          }
        }
  
        try {
          const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: 1 }),
          });
  
          if (response.ok) {
            showNotification("Producto agregado al carrito.");
          } else {
            const error = await response.json();
            showNotification(`Error: ${error.message}`, "error");
          }
        } catch {
          showNotification("Error al agregar producto al carrito.", "error");
        }
      }
    });
  
    // Eliminar producto
    document.body.addEventListener("click", async (event) => {
      if (event.target.classList.contains("delete-btn")) {
        const productId = event.target.dataset.id;
  
        if (confirm("¿Seguro que querés eliminar este producto?")) {
          try {
            const response = await fetch(`/api/products/${productId}`, {
              method: "DELETE",
            });
  
            if (response.ok) {
              const card = event.target.closest(".product-card");
              if (card) card.remove();
              showNotification("Producto eliminado correctamente");
            } else {
              const err = await response.json();
              showNotification(`Error: ${err.message}`, "error");
            }
          } catch {
            showNotification("Error en la solicitud al eliminar producto.", "error");
          }
        }
      }
    });
  });
  