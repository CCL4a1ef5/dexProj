import React from "react";
import "./App.css";
import { Symfoni } from "./hardhat/SymfoniContext";
import { Swap } from "./components/Swap";

function App() {
  return (
    <div className="App">
      <Symfoni autoInit={true}>
        <div className="min-h-screen bg-gray-800">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 ">
            <div className="text-gray-100 text-6xl pt-28 pb-10">Swappity Swap</div>
            <Swap
              tokenA="0x4Ae58181c6380FEd3b9C32Ef8f9A015599813246"
              tokenB="0x29C53bB84BC3a519632Fa3566a4aC1c9862E4565"
            ></Swap>
          </div>
        </div>
      </Symfoni>
    </div>
  );
}

export default App;
