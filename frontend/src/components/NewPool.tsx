import React, { useContext, useState, useEffect } from "react";
import {
  ERC20Context,
  UniswapV2Router02Context,
  UniswapV2FactoryContext,
  CurrentAddressContext,
} from "../hardhat/SymfoniContext";
import { ERC20 } from "../hardhat/typechain/ERC20";
import { ethers } from "ethers";

export const NewPool = (props: {
  onSaveV2PairAddr: (enteredV2PairAddr: {
    id: string;
    tokenAadd: string;
    tokenBadd: string;
    uniPairAdd: string;
  }) => void;
}) => {
  const ERC20Factory = useContext(ERC20Context);
  const router = useContext(UniswapV2Router02Context);
  const factory = useContext(UniswapV2FactoryContext);
  const [currentAddress] = useContext(CurrentAddressContext);

  const [tokenAaddress, setTokenAaddress] = useState("");
  const [tokenBaddress, setTokenBaddress] = useState("");

  const [tokenAInstance, setTokenAInstance] = useState<ERC20>();
  const [tokenBInstance, setTokenBInstance] = useState<ERC20>();

  const [tokenASymbol, setTokenASymbol] = useState<string>();
  const [tokenBSymbol, setTokenBSymbol] = useState<string>();

  const [amtTokenA, setAmtTokenA] = useState<number>(0);
  const [amtTokenB, setAmtTokenB] = useState<number>(0);

  const addressAChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenAaddress(event.target.value);
  };
  const addressBChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenBaddress(event.target.value);
  };

  const amtAChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmtTokenA(parseInt(event.target.value));
  };
  const amtBChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmtTokenB(parseInt(event.target.value));
  };

  function setBothTokenInstances() {
    if (ERC20Factory.instance) {
      setTokenAInstance(ERC20Factory.instance!.attach(tokenAaddress));
      setTokenBInstance(ERC20Factory.instance!.attach(tokenBaddress));
    }
  }

  const checkPair = async () => {
    setBothTokenInstances();
    if (!factory.instance) {
      console.log("factory instance not found");
      return;
    }
    const getPair = await factory.instance.getPair(tokenAaddress, tokenBaddress);
    if (getPair === "0x0000000000000000000000000000000000000000") {
      alert("Pair is non-existent, please create a pair");
      return false;
    } else {
      alert("Crypto ccy pair exists");
    }
  };

  const createPair = async () => {
    setBothTokenInstances();
    if (!factory.instance) {
      console.log("factory instance not found");
      return;
    }
    const getPair = await factory.instance.getPair(tokenAaddress, tokenBaddress);
    if (getPair !== "0x0000000000000000000000000000000000000000") {
      return alert("Crypto ccy pair exists, please approve / add liquidity if you would like to");
    } else {
      await factory.instance.createPair(tokenAaddress, tokenBaddress);
    }

    saveUniPairAddr();
  };

  const approveRouter = async () => {
    if (!router.instance || !tokenAInstance || !tokenBInstance) {
      console.log("router instance not found");
      return;
    }
    await tokenAInstance.approve(router.instance.address, ethers.utils.parseEther(amtTokenA.toString()));
    await tokenBInstance.approve(router.instance.address, ethers.utils.parseEther(amtTokenB.toString()));
  };

  const addLiquidity = async () => {
    if (!router.instance || !factory.instance) {
      console.log("router or factory instance not found");
      return;
    }
    const getPair = await factory.instance.getPair(tokenAaddress, tokenBaddress);
    if (getPair === "0x0000000000000000000000000000000000000000") {
      alert("pair does not exists, please create a pair");
      return;
    }
    const futureTime = Date.now() + 3600 * 24 * 7 * 52;

    await router.instance.addLiquidity(
      tokenAaddress,
      tokenBaddress,
      ethers.utils.parseEther(amtTokenA.toString()),
      ethers.utils.parseEther(amtTokenB.toString()),
      ethers.utils.parseEther("0"),
      ethers.utils.parseEther("0"),
      currentAddress,
      futureTime
    );
  };

  // Uploads token symbols when a transaction is submitted
  useEffect(() => {
    const fetchTokenSymbols = async () => {
      if (!tokenAInstance || !tokenBInstance) {
        return;
      }
      setTokenASymbol(await tokenAInstance.symbol());
      setTokenBSymbol(await tokenBInstance.symbol());
    };
    fetchTokenSymbols();
  });

  const saveUniPairAddr = async () => {
    setBothTokenInstances();
    if (!factory.instance) {
      console.log("factory instance not found");
      return;
    }
    const getPair = await factory.instance.getPair(tokenAaddress, tokenBaddress);
    if (getPair === "0x0000000000000000000000000000000000000000") {
      alert("Pair is non-existent, please create a pair");
      return false;
    } else {
      const pairAddresses = {
        id: Math.random().toString(),
        tokenAadd: tokenAaddress,
        tokenBadd: tokenBaddress,
        uniPairAdd: getPair,
      };
      console.log(pairAddresses);
      props.onSaveV2PairAddr(pairAddresses);
      alert("Crypto ccy pair exists");
    }
  };

  return (
    <div>
      <div className="bg-Orange_#ff9117 p-6 shadow sm:rounded-lg">
        <div className="w-full">
          <div className="p-1">
            <label className="p-2">tokenA address :</label>
            <input className="w-96 rounded-lg" type="text" onChange={addressAChangeHandler} />
            <label className="p-2">tokenA amount :</label>
            <input className="w-28 rounded" type="number" min="0.01" step="0.01" onChange={amtAChangeHandler} />
            <label className="p-2">tokenA symbol :</label>
            <input className="w-28 rounded" disabled type="text" value={tokenASymbol} />
          </div>
          <div className="p-3">
            <label className="p-2">tokenB address :</label>
            <input className="w-96 rounded-lg" type="text" onChange={addressBChangeHandler} />
            <label className="p-2">tokenB amount :</label>
            <input className="w-28 rounded" type="number" min="0.01" step="0.01" onChange={amtBChangeHandler} />
            <label className="p-2">tokenB symbol :</label>
            <input className="w-28 rounded" disabled type="text" value={tokenBSymbol} />
          </div>
        </div>

        <button
          type="submit"
          className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-gray-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={checkPair}
        >
          Check for existing Pair
        </button>
        <button
          type="submit"
          className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-gray-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={createPair}
        >
          Create Pair
        </button>
        <button
          type="submit"
          className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-gray-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={approveRouter}
        >
          Approve Token A and B
        </button>
        <button
          type="submit"
          className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-gray-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={addLiquidity}
        >
          Add Liquidity
        </button>
        <button
          className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-gray-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          type="submit"
          onClick={saveUniPairAddr}
        >
          Add Pair to List
        </button>
      </div>
    </div>
  );
};
