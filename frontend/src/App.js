import './App.css';
import React, { useState, useEffect } from "react";

function App() {

  const [data, setData] = useState({
    name: ""
  });
  useEffect(() => {
    // Using fetch to fetch the api from
    // flask server it will be redirected to proxy
    fetch("/data").then((res) =>
      res.json().then((data) => {
        // Setting a data from api
        setData({
          name: data.Name
        });
      })
    );
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>{data.name}</p>
      </header>
    </div>
  );
}

export default App;
