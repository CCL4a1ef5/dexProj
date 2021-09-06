// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

contract MyToken1 is ERC20PresetMinterPauser {
    constructor() public ERC20PresetMinterPauser("TEST Token", "TEST1") {}
}

contract MyToken2 is ERC20PresetMinterPauser {
    constructor() public ERC20PresetMinterPauser("TEST Token", "TEST22") {}
}
