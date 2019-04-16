pragma solidity ^0.4.24;

import "../zeppelin/lifecycle/Destructible.sol";

contract VendorPurchase is Destructible {

    /**
     * @dev event for delivery verification
     * @param supplier the public wallet address of the supplier
     * @param supplierId app generated unique id of the supplier
     * @param buyer the public wallet address of the buyer
     * @param buyerId app generated unique id of the buyer
     * @param itemDescription the item description
     */
    event EventVendorPurchase(address indexed supplier, uint256 supplierId, address indexed buyer, uint256 buyerId, string itemDescription);

    function itemPurchased(
        address _supplier, 
        uint256 _supplierId, 
        address _buyer, 
        uint256 _buyerId, 
        string _itemDescription) public onlyOwner returns (bool) {
        
        emit EventVendorPurchase(_supplier, _supplierId, _buyer, _buyerId, _itemDescription);

        return true;
    }
}