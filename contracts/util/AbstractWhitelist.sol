pragma solidity ^0.5.2;

contract AbstractWhitelist {
	function isAManager(address manager) public view returns (bool);
	function isWhitelisted (address whitelisted) public view returns (bool);
	function removeWhitelisted (address whitelisted) public;
}
