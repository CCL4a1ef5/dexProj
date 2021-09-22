import React, { useContext, useEffect, useState } from "react";
import {
  ERC20Context,
  UniswapV2Router02Context,
  CurrentAddressContext,
  UniswapV2PairContext,
} from "../hardhat/SymfoniContext";
import { ERC20 } from "../hardhat/typechain/ERC20";
import { UniswapV2Pair } from "../hardhat/typechain/UniswapV2Pair";
import { ethers } from "ethers";
interface Props {
  tokenA: string;
  tokenB: string;
  v2PairAddr: string;
}

export const Swap: React.FC<Props> = ({ tokenA, tokenB, v2PairAddr }) => {
  const ERC20Factory = useContext(ERC20Context);
  const v2PairFactory = useContext(UniswapV2PairContext);
  const router = useContext(UniswapV2Router02Context);
  const [currentAddress] = useContext(CurrentAddressContext);

  const [baseCrypto, setBaseCrypto] = useState<string>(tokenA);
  const [quoteCrypto, setQuoteCrypto] = useState<string>(tokenB);

  const [tokenAInstance, setTokenAInstance] = useState<ERC20>();
  const [tokenBInstance, setTokenBInstance] = useState<ERC20>();
  const [v2PairInstance, setV2PairInstance] = useState<UniswapV2Pair>();

  const [tokenASymbol, setTokenASymbol] = useState<string>();
  const [tokenBSymbol, setTokenBSymbol] = useState<string>();

  const [tokenAreserves, setTokenAreserves] = useState<number>(0);
  const [tokenBreserves, setTokenBreserves] = useState<number>(0);
  const [flashQuote, setFlashQuote] = useState<string>("0");

  const [amount, setAmount] = useState<number>(0);
  const [exchangeAmount, setExchangeAmount] = useState<string>("0");

  useEffect(() => {
    if (ERC20Factory.instance) {
      setTokenAInstance(ERC20Factory.instance!.attach(baseCrypto));
      setTokenBInstance(ERC20Factory.instance!.attach(quoteCrypto));
    }
  }, [ERC20Factory.instance, baseCrypto, quoteCrypto]);

  useEffect(() => {
    if (v2PairFactory.instance) {
      setV2PairInstance(v2PairFactory.instance!.attach(v2PairAddr));
    }
  }, [v2PairFactory.instance, v2PairAddr]);

  useEffect(() => {
    const fetchTokenSymbols = async () => {
      if (!tokenAInstance || !tokenBInstance) {
        return;
      }
      setTokenASymbol(await tokenAInstance.symbol());
      setTokenBSymbol(await tokenBInstance.symbol());
    };
    fetchTokenSymbols();
  }, [tokenAInstance, tokenBInstance]);

  useEffect(() => {
    const fetchFlashQuote = async () => {
      if (!router.instance) {
        console.log("router instance not found");
        return;
      }
      try {
        const quote = await router.instance.getAmountsOut(ethers.utils.parseEther("1"), [baseCrypto, quoteCrypto]);
        setFlashQuote(ethers.utils.formatUnits(quote[1].toString()).slice(0, 6));
      } catch {
        return;
      }
    };
    fetchFlashQuote();
  }, [router.instance, baseCrypto, quoteCrypto]);

  useEffect(() => {
    const fetchReserves = async () => {
      if (!v2PairInstance) {
        console.log("uniPair instance not found");
        return;
      }
      if (baseCrypto === tokenA) {
        //_reserves0 refers to tokenA of the getReserves object, likewise _reserves1 refers to tokenB
        setTokenAreserves(parseInt(ethers.utils.formatEther((await v2PairInstance.getReserves())._reserve0)));
        setTokenBreserves(parseInt(ethers.utils.formatEther((await v2PairInstance.getReserves())._reserve1)));
      } else if (baseCrypto === tokenB) {
        setTokenBreserves(parseInt(ethers.utils.formatEther((await v2PairInstance.getReserves())._reserve0)));
        setTokenAreserves(parseInt(ethers.utils.formatEther((await v2PairInstance.getReserves())._reserve1)));
      }
    };
    fetchReserves();
  }, [baseCrypto, quoteCrypto, tokenA, tokenB, v2PairInstance]);

  useEffect(() => {
    const fetchExchangeAmount = async () => {
      if (!router.instance) {
        console.log("router instance not found");
        return;
      }
      if (amount > 0) {
        // router gets angry if you pass in a 0
        const amountsOut = await router.instance.getAmountsOut(ethers.utils.parseEther(amount.toString()), [
          baseCrypto,
          quoteCrypto,
        ]);
        setExchangeAmount(ethers.utils.formatUnits(amountsOut[1].toString(), 18).slice(0, 9));
      }
    };
    fetchExchangeAmount();
  }, [router.instance, amount, baseCrypto, quoteCrypto]);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseFloat(event.target.value));
  };

  const handleSwap = async () => {
    if (!router.instance || !tokenAInstance) {
      console.log("router or token instance not found");
      return;
    }
    const time = Math.floor(Date.now() / 1000) + 3600;

    await (await tokenAInstance.approve(router.instance.address, ethers.utils.parseEther(amount.toString()))).wait();
    await (
      await router.instance.swapExactTokensForTokens(
        ethers.utils.parseEther(amount.toString()),
        0, // we shouldn't leave this as 0, it is dangerous in real trading
        [baseCrypto, quoteCrypto],
        currentAddress,
        time
      )
    ).wait();
  };

  // Switch tokenA and tokenB values for the conts / functions to reload new values
  const switchBaseQuote = async () => {
    if (baseCrypto === tokenA) {
      setBaseCrypto(tokenB);
      setQuoteCrypto(tokenA);
    } else if (baseCrypto === tokenB) {
      setBaseCrypto(tokenA);
      setQuoteCrypto(tokenB);
    }
  };

  return (
    <div className="bg-#4b4b4b shadow sm:rounded-lg">
      <div className="px-4 py-5">
        <div className="grid grid-cols-10 gap-0">
          <div>
            <p className="text-gray-100 -mb-0.5">Crypto Pair</p>
            <p className="text-yellow-600 text-lg mt-2">
              {tokenASymbol} / {tokenBSymbol}
            </p>
          </div>

          <div className="">
            <p className="text-gray-100">Flash Quote</p>
            <p className="bg-gray-400 rounded-md m-2">{flashQuote}</p>
          </div>
          <div className="col-span-1">
            <p className="text-gray-100">{tokenASymbol} reserve</p>
            <p className="bg-gray-400 rounded-md m-2">{tokenAreserves}</p>
          </div>
          <div className="col-span-1">
            <p className="text-gray-100">{tokenBSymbol} reserve</p>
            <p className="bg-gray-400 rounded-md m-2">{tokenBreserves}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-300 text-lg mb-1 -mt-1">Base Crypto ({tokenASymbol})</p>
            <span className="text-gray-100 align-top">Amount:</span>
            <input
              id="InputCcyAmount"
              className="mx-2 flex-item shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md text-gray-800 w-5/12 text-lg text-center"
              type="text"
              placeholder="1"
              onChange={handleAmountChange}
            />
          </div>
          <div>
            <p className="text-gray-400 -mt-0.5 mb-1">switch</p>
            <button
              id="SwitchButton"
              type="submit"
              className="px-3 pb-1 border border-transparent shadow-sm font-medium rounded-md text-white bg-gray-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={switchBaseQuote}
            >
              &lt;=&gt;
            </button>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400 text-lg mb-1 -mt-1">Quote Crypto ({tokenBSymbol})</p>
            <span className="text-gray-400 align-top">Receive:</span>
            <input
              id="ReceiveValue"
              type="text"
              disabled
              className="mx-1 flex-item shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md text-gray-800 text-lg w-1/2 text-center"
              placeholder="20"
              value={exchangeAmount}
            />
          </div>
          <div className=" mt-2">
            <button
              id="TriggerSwapButton"
              type="submit"
              className="px-6 py-3 border border-transparent shadow-sm font-medium rounded-md text-white bg-gray-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleSwap}
            >
              Swap!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
