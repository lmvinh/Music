import 'bootstrap/dist/css/bootstrap.min.css';
import Login from "./Login";
import Dashboard from "./Dashboard";

// Only try to access `window` on the client
const code = typeof window !== 'undefined' 
  ? new URLSearchParams(window.location.search).get("code") 
  : null;

function App() {
  return  <Dashboard />;
}

export default App;
