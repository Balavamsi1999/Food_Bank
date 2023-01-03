// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";

interface InterfaceFBToken{
  function rewardToken(address user_addr) external;
  function fetch_balance(address user_addr) external view returns(uint);
}

contract FBToken is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    address chairperson;
    mapping(address => uint256[]) public userOwnedTokens;

    constructor() ERC721("FBToken", "BRT") {
      _tokenIdCounter.increment(); // making it to start from 1
      chairperson = msg.sender;
    }
    
    function rewardToken(address user_addr) external{
      safeMint(user_addr, "1");
    } 

    function fetch_balance(address user_addr) external view returns(uint) {
      return balanceOf(user_addr);
    }

    function deduct_tokens(uint no_of_tokens) external{
      address user_addr = msg.sender;
      uint256[] memory original_token_ids = userOwnedTokens[user_addr];
      uint original_tokens_arr_size = original_token_ids.length;
      
      require(original_tokens_arr_size >= no_of_tokens);

      for(uint i = 0; i < no_of_tokens; i++){
        uint token_id = original_token_ids[i];
        safeTransferFrom(user_addr, chairperson, token_id);
        userOwnedTokens[chairperson].push(token_id);
      }

      uint256[] memory new_token_ids = new uint256[](original_tokens_arr_size - no_of_tokens);
      for(uint i = no_of_tokens; i < original_tokens_arr_size; i++){
        new_token_ids[i - no_of_tokens] = original_token_ids[i];
      }
      userOwnedTokens[user_addr] = new_token_ids;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://example.com/nft/";
    }


    function safeMint(address to, string memory uri) internal{
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        userOwnedTokens[to].push(tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public  view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}