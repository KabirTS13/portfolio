import logo from './logo.svg';
import './App.css';
import TodoList from './todo.js'
import Weather from './weather.js';
import Header from './header.js';
import Project from './projects.js';
import Connections from './connections.js';

function App() {
  return (
    <>
      <Header />
      <div className="flex justify-between">
      <Connections />
        <Weather />
      </div>
      <div className="flex justify-between">
        <Project />
        <TodoList />
      </div>


    </>
  );
}

export default App;
