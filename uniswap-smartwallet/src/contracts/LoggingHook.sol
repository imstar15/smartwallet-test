// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @notice A minimal Calibur-compatible hook with event logging and no interface dependency
contract LoggingHook {
  event BeforeExecute(
    bytes32 indexed keyHash,
    address indexed to,
    uint256 value,
    bytes data
  );

  event AfterExecute(
    bytes32 indexed keyHash,
    bool success,
    bytes output,
    bytes beforeExecuteData
  );

  function beforeExecute(bytes32 keyHash, address to, uint256 value, bytes calldata data)
  external
  returns (bytes4, bytes memory)
  {
    emit BeforeExecute(keyHash, to, value, data);
    return (bytes4(keccak256("beforeExecute(bytes32,address,uint256,bytes)")), "");
  }

  function afterExecute(bytes32 keyHash, bool success, bytes calldata output, bytes calldata beforeExecuteData)
  external
  returns (bytes4)
  {
    emit AfterExecute(keyHash, success, output, beforeExecuteData);
    return bytes4(keccak256("afterExecute(bytes32,bool,bytes,bytes)"));
  }
}