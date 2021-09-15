import React, { useContext, useState, useEffect } from "react";
import {
  ERC20Context,
  UniswapV2Router02Context,
  UniswapV2FactoryContext,
  UniswapV2PairContext,
  CurrentAddressContext,
} from "../hardhat/SymfoniContext";
import { ERC20 } from "../hardhat/typechain/ERC20";
import { ethers } from "ethers";

function getPairsAddress() {
  const ERC20Factory = useContext(ERC20Context);
  const uniPairFactory = useContext(UniswapV2PairContext);
  const router = useContext(UniswapV2Router02Context);
  const factory = useContext(UniswapV2FactoryContext);
  const [currentAddress] = useContext(CurrentAddressContext);

  useEffect(() => {
    const fetchTotalPairs = async () => {
      if (!factory.instance) {
        console.log("factory instance not found");
        return;
      }

      const totalPairs = await factory.instance.allPairsLength();
      console.log(totalPairs);
    };
    fetchTotalPairs();
  });
}

export default getPairsAddress;
