// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
import './fb_token.sol';


interface InterfaceRating{
    function createRating(uint hist_id, uint rating, address user_addr, uint donated_amount) external returns(uint);
    function getCummulativerating(uint[] memory rating_ids) view external returns(uint);
}

contract RatingC{

    struct Rating{
        uint id;
        uint hist_id;
        uint value; // rating value
        address donor_acc_addr;
        uint donor_donation_amount;
    }
    uint latest_rating_id;
    mapping(uint => Rating) ratings;

    address FbTokenContract;
    address chairperson;

    constructor () {
        latest_rating_id = 0;
        chairperson = msg.sender;
    }

    modifier onlyCDeployer() 
    {
       require(msg.sender == chairperson);
        _;
    }

    // function setFbTokenContractAddr(address fb_token_c_addr) onlyCDeployer() public{
    function setFbTokenContractAddr(address fb_token_c_addr) onlyCDeployer() external{
        FbTokenContract = fb_token_c_addr;
    }

    function createRating(uint hist_id, uint rating, address user_addr, uint donated_amount) external returns(uint){
        Rating memory new_rating = Rating({id: latest_rating_id + 1, hist_id: hist_id, value: rating, donor_acc_addr: user_addr, donor_donation_amount: donated_amount});
        latest_rating_id = latest_rating_id + 1;
        ratings[latest_rating_id] = new_rating;

        InterfaceFBToken token_interface = InterfaceFBToken(FbTokenContract);
        token_interface.rewardToken(user_addr);

        return latest_rating_id;
    }

    function getCummulativerating(uint[] memory rating_ids) view external returns(uint){
        uint total_amount_collected = 0;
        uint value = 0;

        require(rating_ids.length >= 1, "Empty Ratings");

        for(uint i = 0; i < rating_ids.length; i++){
            uint rating_id = rating_ids[i];
            uint rat = ratings[rating_id].value;
            uint amount = ratings[rating_id].donor_donation_amount;

            value = value + (rat * amount);
            total_amount_collected = total_amount_collected + amount;
        }

        return value / total_amount_collected;
    }
    

}