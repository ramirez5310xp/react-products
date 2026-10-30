import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";

function App() {
  
  return (
    <>
      <Navbar />
      <main>
        <Home />
        <Products />
      </main>
    </>
  );
  
}

export default App
