import React, { useState } from "react";
import "./App.css";
import { Symfoni } from "./hardhat/SymfoniContext";
import { Swap } from "./components/Swap";
import { NewPool } from "./components/NewPool";

const DUMMY_addressBook = [
  {
    id: "0",
    tokenAadd: "0x4Ae58181c6380FEd3b9C32Ef8f9A015599813246",
    tokenBadd: "0x29C53bB84BC3a519632Fa3566a4aC1c9862E4565",
    uniPairAdd: "0x564274d7C3571b77C33133632A440b58Fa1E0b5F",
  },
  {
    id: "1",
    tokenAadd: "0xCB98601e715fedeDC69BF80066634B0B22ee5148",
    tokenBadd: "0x0995153BBA0d10Af7E05f62A1CF45DCf1ddA3Ee8",
    uniPairAdd: "0xfeeD2C547997fC27eb2A4A02c5A82E4E6CFB1046",
  },
  {
    id: "2",
    tokenAadd: "0xcFbB667A072f76a940523784B99956f3d134037D",
    tokenBadd: "0x1B04C002449b5985659CFa0Ff663e23015EAf973",
    uniPairAdd: "0x170DDF23bCc0215DFAfb3a3e705309742B7C0A71",
  },
  {
    id: "3",
    tokenAadd: "0x4F3E5f21eBfDe06478DF764c151E288F5947B371",
    tokenBadd: "0x93A77CCfc7685C316bb380db2c374522e21642e4",
    uniPairAdd: "0x3202d31EAA1f3b9DC7a82DcB33009c4Ff1adB8d0",
  },
  {
    id: "4",
    tokenAadd: "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735",
    tokenBadd: "0xE85ED95a8EFc3604344524b9cFccC1dd5F92993a",
    uniPairAdd: "0xA760e3be3bB18422cBcb445317724511D06A8941",
  },
];

function App() {
  return (
    <div className="App">
      <Symfoni autoInit={true}>
        <div className="min-h-screen bg-#3f3f3f font-sans border-box">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 ">
            <div className="text-gray-100 text-6xl pt-28 pb-10 border-1px">
              <span className="text-yellow-400">defi</span>
              <span className="text-gray-900">n</span>
              <span className="text-yellow-400">ance </span> <span className="text-gray-900"> : Swappity Swap</span>
            </div>
            <NewPool />
            {DUMMY_addressBook.map((getAddresses) => (
              <Swap
                tokenA={getAddresses.tokenAadd}
                tokenB={getAddresses.tokenBadd}
                uniswapPair={getAddresses.uniPairAdd}
              />
            ))}
          </div>
        </div>
      </Symfoni>
    </div>
  );
}

export default App;
