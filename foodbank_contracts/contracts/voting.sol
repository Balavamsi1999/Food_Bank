// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;


interface InterfaceVoting{
  function createVote(address user_addr, uint plan_id, uint amount_donated, uint tokens_donated) external returns(uint);
}

contract Voting{

    struct Vote{
        uint id;
        address donor_address;
        uint voted_for_plan_id;
        uint amount_donated;
        uint tokens_donated;
    }
    uint latest_vote_id;
    mapping(uint => Vote) votes;

    constructor () {
        latest_vote_id = 0;
    }

    function createVote(address user_addr, uint plan_id, uint amount_donated, uint tokens_donated) external returns(uint){
        Vote({ id: latest_vote_id + 1, donor_address: user_addr, voted_for_plan_id: plan_id, amount_donated:  amount_donated, tokens_donated: tokens_donated});
        latest_vote_id = latest_vote_id + 1;

        return latest_vote_id;
    }

}