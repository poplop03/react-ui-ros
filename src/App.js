import Header from "./components/Header";
import Footer from "./components/Footer";
import Body from "./components/Body";
import "./App.css"; // Import global styles

function App() {
  return (
    <div className="app-root">
      {/* <Header /> */}
      <div className="app-body">
        <Body />
      </div>
      {/* <Footer /> */}
    </div>
  );
}

export default App;
