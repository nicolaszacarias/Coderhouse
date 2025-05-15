document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('.delete-btn');

  deleteButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      const productId = event.target.dataset.id;

      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          console.log('Producto eliminado correctamente');
          window.location.reload();
        } else {
          console.error('Error al eliminar el producto');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  });
});

