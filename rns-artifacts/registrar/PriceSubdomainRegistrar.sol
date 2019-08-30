pragma solidity ^0.5.2;

import "../registry/AbstractRNS.sol";
import "../util/AbstractWhitelist.sol";
import "../resolver/AbstractAddrResolver.sol";

/**
 * @title PriceSubdomainRegistrar
 * Allows anyone who is whitelisted to create subnodes under a given RNS node 
 */
contract PriceSubdomainRegistrar {
    address public owner = msg.sender;
    AbstractRNS public rns;
    AbstractWhitelist public whitelist;    
    bytes32 public rootNode;
    bytes4 constant ADDR_SIGN = 0x3b3b57de;

    modifier onlyOwner () {
        require(msg.sender == owner);
        _;
    }

    modifier onlyManager () {
        require(whitelist.isAManager(msg.sender));
        _;
    }

    /**
     * @dev Constructor
     * @param _rns AbstractRNS RNS registry address.
     * @param _whitelist AbstractWhitelist Whitelist to manage who can register domains.
     * @param _rootNode bytes32 An owned node. The contract emits subnodes under this node.
     */
    constructor (AbstractRNS _rns, AbstractWhitelist _whitelist, bytes32 _rootNode) public {
        rns = _rns;
        whitelist = _whitelist;
        rootNode = _rootNode;
    }

    /**
     * @dev Registrers a subnode under a given and delegated node. 
     * @param label bytres32 The label of the new subnode.
     */
    function register (bytes32 label, address addr) public onlyManager() {
        bytes32 subnode = keccak256(abi.encodePacked(rootNode, label));
        require(rns.owner(subnode) == address(0));

        AbstractAddrResolver resolver = AbstractAddrResolver(rns.resolver(rootNode));
        require(resolver.supportsInterface(ADDR_SIGN));

        rns.setSubnodeOwner(rootNode, label, address(this));
        resolver.setAddr(subnode, addr);

        rns.setOwner(subnode, addr);
    }

    /**
     * @dev Transfers back the root node ownership to the contract's owner.
     */
    function transferOwnershipBack () public onlyOwner() {
        rns.setOwner(rootNode, owner);
    }
}
