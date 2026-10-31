import { useState, useEffect } from "react";
import ProductList from "../components/ProductList";
import{getProducts,searchProducts,getCategories,getProductsByCategory,createProduct,updateProduct,deleteProduct} from "../services/productService";



function Products() {

   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const[search,setSearch]=useState("");
   const[categories,setCategories]=useState([]);
   const[category,setCategory]=useState("");
   const[editingId,setEditingId]=useState(null);
   const[page,setPage]=useState(1);
   const[total,setTotal]=useState(0);
   const limit = 12;
   const[form,setForm]=useState({
   title:"",
   price:"",
   description:"",   
});

// LOAD PRODUCTS
async function loadProducts(pageNumber = 1) {
      try {
        setLoading(true);
        const skip = (pageNumber - 1) * limit;

         const data = await getProducts(limit, skip);
         setProducts(data.products);
         setTotal(data.total);
      } catch (error) {
         setError(error.message);
      } finally {
         setLoading(false);
      }
}

useEffect(() => {
     loadProducts();
     loadCategories();
}, []);

// LOAD CATEGORIES
async function loadCategories() {
      try {
         const data = await getCategories();
         setCategories(data);
      } catch (error) {
         setError(error.message);
      }
}


//NEXT PAGE
function nextPage() {
   const totalPages = Math.ceil(total / limit);
   if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      loadProducts(newPage);
   }
}

//PREVIOUS PAGE
function previousPage() {
   if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      loadProducts(newPage);
   }
}

//DELETE PRODUCT
async function handleDelete(id) {
      try {
         await deleteProduct(id);
          setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
         setError(error.message);
      }
    }

//SEARCH PRODUCTS
async function handleSearch(e) {
      e.preventDefault();
      try {
         setLoading(true);
        if (search.trim() === "") {
            await loadProducts();
            return;
         }

         const data = await searchProducts(search);
         setProducts(data.products);
      } catch (error) {
         setError(error.message);
      } finally {
         setLoading(false);
      }
   }

//FILTER PRODUCTS BY CATEGORY
   async function handleCategory(e) {
      const selectedCategory = e.target.value;
      setCategory(selectedCategory);
      try{
         setLoading(true);
         if(selectedCategory===""){
            await loadProducts();
            return;
         }
         const data=await getProductsByCategory(selectedCategory);
         setProducts(data.products);
      } catch (error) {
         setError(error.message);
      } finally {
         setLoading(false);
      }
   }
   
//HANDLE FORM CHANGE
   function handleFormChange(e) {
      const { name, value } = e.target;
      setForm ({
         ...form,
         [name]: value
      });
   }

//CREATE PRODUCT
   async function handleCreate(e) {
      e.preventDefault();
      try {
         const newProduct = await createProduct({...form,price:Number(form.price)});
         setProducts([newProduct, ...products]);
         setForm({title:"",price:"",description:""});
      } catch (error) {
         setError(error.message);
      }
   }

//EDIT PRODUCT
function handleEdit(product) {
     setEditingId(product.id);
     setForm({
        title: product.title,
        price: product.price,
        description: product.description,
     });
   }

//UPDATE PRODUCT
async function handleUpdate(e) {
      e.preventDefault();  
      try {
         const updated =await updateProduct(editingId,{...form,price:Number(form.price),});
         setProducts(products.map((product) => product.id === editingId ? {...product, ...updated} : product));
         setEditingId(null);
         setForm({title:"",price:"",description:""});
      } catch (error) {
         setError(error.message);
      }
   }

//RENDER
      if(loading) {
         return <p>Cargando productos...</p>;
      }
      if(error) {
         return <p>Error: {error}</p>;
      }


      //RETURN JSX
      return (
         <section>
         <h1>Productos</h1>
        
           <form onSubmit={handleSearch} className="search-form"> 
               <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
               <button type="submit">Buscar</button>
            </form>

            <select value={category} onChange={handleCategory}>
               <option value="">Todas las categorías</option>

               {categories.map((item) => {
                  const value=item.slug ?? item;
                  const label=item.name ?? item;
                  return (
                     <option key={value} value={value}>
                        {label}
                     </option>
                  );
                  })}
            </select>


            <h2>{editingId ? "Editar producto" : "Agregar producto"}</h2>
            <form onSubmit={editingId ? handleUpdate : handleCreate} className="product-form">
               <input
                  type="text"
                  name="title"
                  placeholder="Nombre"
                  value={form.title}
                  onChange={handleFormChange}
                  required
               />
               <input
                  type="number"
                  name="price"
                  placeholder="Precio"
                  value={form.price}
                  onChange={handleFormChange}
                  required
               />
               <textarea
                  name="description"
                  placeholder="Descripción"
                  value={form.description}
                  onChange={handleFormChange}
               />

               <button type="submit">{editingId ? "Actualizar" : "Guardar"}</button>
            </form>

            <ProductList products={products} onEdit={handleEdit} onDelete={handleDelete} />

            <div className="pagination">
               <button onClick={previousPage} disabled={page === 1}>
                  Anterior
               </button>

               <span>Página {page}</span>

               <button onClick={nextPage} disabled={page >= Math.ceil(total / limit)}>
                  Siguiente
               </button>
            </div>
         </section>
      );

   }
    
export default Products;