import React from "react";
import "./App.css";
import { Symfoni } from "./hardhat/SymfoniContext";
import { Swap } from "./components/Swap";
import { NewPool } from "./components/NewPool";

function App() {
  return (
    <div className="App">
      <Symfoni autoInit={true}>
        <div className="min-h-screen bg-gray-700">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 ">
            <div className="text-gray-100 text-6xl pt-28 pb-10 border-1px">
              <span>Defi</span>
              <span className="text-gray-900">n</span>
              <span>ance </span> <span className="text-gray-900"> : Swappity Swap</span>
            </div>
            <Swap
              tokenA="0x4Ae58181c6380FEd3b9C32Ef8f9A015599813246"
              tokenB="0x29C53bB84BC3a519632Fa3566a4aC1c9862E4565"
            ></Swap>
            <Swap
              tokenA="0xCB98601e715fedeDC69BF80066634B0B22ee5148"
              tokenB="0x0995153BBA0d10Af7E05f62A1CF45DCf1ddA3Ee8"
            ></Swap>
            <Swap
              tokenA="0xcFbB667A072f76a940523784B99956f3d134037D"
              tokenB="0x1B04C002449b5985659CFa0Ff663e23015EAf973"
            ></Swap>
            <NewPool />
          </div>
        </div>
      </Symfoni>
    </div>
  );
}

export default App;
