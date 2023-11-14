// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {TokenTemplate} from "./TokenTemplate.sol";

contract TokenFractionVault is TokenTemplate, ERC721Holder {
    using SafeERC20 for IERC20;

    address public nft;
    uint256 public tokenId;
    uint256 public fractionsCount;
    bool public released;

    event Redeem(address indexed _to, address indexed _nft, uint256 _tokenId);

    function init(
        address _from,
        address _nft,
        uint256 _tokenId,
        string memory _name,
        string memory _symbol,
        uint256 _fractionsCount
    ) external {
        require(
            IERC721(_nft).ownerOf(_tokenId) == address(this),
            "token not staked"
        );
        require(_fractionsCount > 0, "invalid fraction count");
        nft = _nft;
        tokenId = _tokenId;
        fractionsCount = _fractionsCount;
        released = false;
        super.initialize(_name, _symbol, _from, _fractionsCount);
    }

    function redeem() external {
        address payable _from = payable(msg.sender);
        IERC20 tk = IERC20(address(this));
        require(!released, "token already redeemed");
        uint256 fromBalance = tk.balanceOf(_from);
        uint256 tkTotalSupply = tk.totalSupply();
        require((fromBalance == tkTotalSupply), "invalid balance value");
        released = true;
        tk.safeTransferFrom(_from, address(this), tkTotalSupply);
        IERC721(nft).safeTransferFrom(payable(address(this)), _from, tokenId);
        emit Redeem(_from, nft, tokenId);
    }
}
