// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import {TokenFractionVault} from "./TokenFractionVault.sol";

contract Fractionalizer {
    function fractionalize(
        address target,
        uint256 tokenId,
        string memory name,
        string memory symbol,
        uint256 fractionsCount
    ) external returns (address fractions) {
        address from = msg.sender;
        fractions = address(new TokenFractionVault());
        IERC721(target).safeTransferFrom(from, fractions, tokenId);

        TokenFractionVault(fractions).init(
            from,
            target,
            tokenId,
            name,
            symbol,
            fractionsCount
        );

        emit Fractionalize(from, target, tokenId, fractions);
        return fractions;
    }

    event Fractionalize(
        address indexed from,
        address indexed target,
        uint256 indexed tokenId,
        address fractions
    );
}
