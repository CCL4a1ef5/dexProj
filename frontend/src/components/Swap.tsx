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
  uniswapPair: string;
}

export const Swap: React.FC<Props> = ({ tokenA, tokenB, uniswapPair }) => {
  const ERC20Factory = useContext(ERC20Context);

  const [baseCrypto, setBaseCrypto] = useState(tokenA);
  const [quoteCrypto, setQuoteCrypto] = useState<string>(tokenB);

  const [tokenAInstance, setTokenAInstance] = useState<ERC20>();
  const [tokenBInstance, setTokenBInstance] = useState<ERC20>();

  const [tokenASymbol, setTokenASymbol] = useState<string>();
  const [tokenBSymbol, setTokenBSymbol] = useState<string>();

  const uniPairFactory = useContext(UniswapV2PairContext);

  const [uniPairInstance, setUniPairInstance] = useState<UniswapV2Pair>();
  const [tokenAreserves, setTokenAreserves] = useState<number>(0);
  const [tokenBreserves, setTokenBreserves] = useState<number>(0);
  const [flashQuote, setFlashQuote] = useState<string>("0");

  useEffect(() => {
    if (ERC20Factory.instance) {
      setTokenAInstance(ERC20Factory.instance!.attach(baseCrypto));
      setTokenBInstance(ERC20Factory.instance!.attach(quoteCrypto));
    }
  }, [ERC20Factory.instance, baseCrypto, quoteCrypto]);

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
    if (uniPairFactory.instance) {
      setUniPairInstance(uniPairFactory.instance!.attach(uniswapPair));
    }
  }, [uniPairFactory.instance, uniswapPair]);

  useEffect(() => {
    const fetchReserves = async () => {
      if (!uniPairInstance) {
        console.log("uniPair instance not found");
        return;
      }
      if (baseCrypto === tokenA) {
        setTokenAreserves(parseInt(ethers.utils.formatEther((await uniPairInstance.getReserves())._reserve0)));
        setTokenBreserves(parseInt(ethers.utils.formatEther((await uniPairInstance.getReserves())._reserve1)));
      } else if (baseCrypto === tokenB) {
        setTokenBreserves(parseInt(ethers.utils.formatEther((await uniPairInstance.getReserves())._reserve0)));
        setTokenAreserves(parseInt(ethers.utils.formatEther((await uniPairInstance.getReserves())._reserve1)));
      }
    };
    fetchReserves();
  }, [baseCrypto, quoteCrypto, tokenA, tokenB, uniPairInstance]);

  const [amount, setAmount] = useState<number>(0);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseInt(event.target.value));
  };

  const router = useContext(UniswapV2Router02Context);
  const [exchangeAmount, setExchangeAmount] = useState<string>("0");

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

  useEffect(() => {
    const fetchFlashQuote = async () => {
      if (!router.instance) {
        console.log("router instance not found");
        return;
      }
      const quote = await router.instance.getAmountsOut(ethers.utils.parseEther("1"), [baseCrypto, quoteCrypto]);
      setFlashQuote(ethers.utils.formatUnits(quote[1].toString()).slice(0, 6));
    };

    fetchFlashQuote();
  }, [router.instance, baseCrypto, quoteCrypto]);

  const [currentAddress] = useContext(CurrentAddressContext);

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
    <div className="bg-gray-300 shadow sm:rounded-lg">
      <div className="px-4 py-5">
        <div className="grid grid-cols-10 gap-0">
          <div className="col-span-1">
            <p>Pair</p>
            <p className="text-gray-800 text-lg">
              {tokenASymbol} / {tokenBSymbol}
            </p>
          </div>

          <div className="">
            <p>Flash Quote</p>
            <p>{flashQuote}</p>
          </div>
          <div className="col-span-1">
            <p>{tokenASymbol} reserve</p>
            <p>{tokenAreserves}</p>
          </div>
          <div className="col-span-1">
            <p>{tokenBSymbol} reserve</p>
            <p>{tokenBreserves}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-800 text-lg">Base Crypto ({tokenASymbol})</p>
            <span className="text-gray-800">Amount:</span>
            <input
              className="mx-2 flex-item shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md text-gray-800 w-5/12 text-lg text-center"
              type="text"
              placeholder="20"
              onChange={handleAmountChange}
            />
          </div>
          <div>
            <p className="text-gray-400">switch</p>
            <button
              type="submit"
              className="mt-1 px-1  border border-transparent shadow-sm font-medium rounded-md text-white bg-gray-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 "
              onClick={switchBaseQuote}
            >
              &lt;=&gt;
            </button>
          </div>
          <div className="col-span-2">
            <p className="text-gray-800 text-lg">Quote Crypto ({tokenBSymbol})</p>
            <span className="text-gray-800">Receive:</span>
            <input
              type="text"
              name="Receive"
              id="receive"
              disabled
              className="mx-1 flex-item shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md text-gray-800 text-lg w-1/2 text-center"
              placeholder="20"
              value={exchangeAmount}
            />
          </div>
          <div>
            <button
              type="submit"
              className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-gray-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
