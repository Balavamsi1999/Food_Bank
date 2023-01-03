// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;


interface InterfacePlan{
  function createPlanAndPlanItems(string[] memory item_names, uint[] memory item_amounts) external returns(uint);
  function updatePlanCollectedAmount(uint plan_id, uint update_by, uint update_tokens_by) external;
  function fetchMostVotedPlan(uint[] memory plan_ids) external view returns(uint);
}

contract PlanC{

    struct PlanItem{
        uint id;
        string item_name;
        uint amount_allocated;
    }
    uint latest_plan_item_id;
    mapping(uint => PlanItem) plan_items;


    struct Plan{
        uint id;
        uint[] plan_item_ids;
        uint collected_amount;   // summation of donor's donated amount for this particular plan
        uint collected_tokens;
    }
    uint latest_plan_id;
    mapping(uint => Plan) plans;

    constructor () {
        latest_plan_item_id = 0;
        latest_plan_id = 0;
    }


    function getPlanDetails(uint plan_id) public view returns(string[] memory, uint[] memory){
        Plan memory plan = plans[plan_id];
        uint[] memory plan_item_ids = plan.plan_item_ids;
        uint length = plan_item_ids.length;

        string[] memory plan_item_names = new string[](length);
        uint[] memory plan_item_amount = new uint[](length);
        for(uint i = 0; i < length; i++){
           PlanItem memory plan_item = plan_items[plan_item_ids[i]];
           plan_item_names[i] = plan_item.item_name;
           plan_item_amount[i] = plan_item.amount_allocated;
        }

        return(plan_item_names, plan_item_amount);
    }

    function createPlanAndPlanItems(string[] memory item_names, uint[] memory item_amounts) external returns(uint){
        // creating plan_items
        uint length = item_names.length;
        uint[] memory created_plan_item_ids = new uint[](length);
        for(uint i = 0; i < length; i++){
            PlanItem memory plan_item = PlanItem({id: latest_plan_item_id + 1, item_name: item_names[i], amount_allocated: item_amounts[i]});
            latest_plan_item_id = latest_plan_item_id + 1;
            plan_items[latest_plan_item_id] = plan_item;
            created_plan_item_ids[i] = latest_plan_item_id;
        }

        // creating plan
        Plan memory new_plan = Plan({id: latest_plan_id + 1, plan_item_ids: created_plan_item_ids, collected_amount: 0, collected_tokens: 0});
        latest_plan_id = latest_plan_id + 1;
        plans[latest_plan_id] = new_plan;

        return latest_plan_id;
    }

    function updatePlanCollectedAmount(uint plan_id, uint update_by, uint update_tokens_by) external {
        plans[plan_id].collected_amount = plans[plan_id].collected_amount + update_by;
        plans[plan_id].collected_tokens = plans[plan_id].collected_tokens + update_tokens_by;
    }

    function fetchMostVotedPlan(uint[] memory plan_ids) external view returns(uint){
        uint max_voted_plan_collected_amount = 0;
        uint max_voted_plan_id = 0;

        for(uint i = 0; i < plan_ids.length; i++){
          if((plans[plan_ids[i]].collected_amount + (2 * 1e18 * plans[plan_ids[i]].collected_tokens)) > max_voted_plan_collected_amount){
             max_voted_plan_collected_amount = (plans[plan_ids[i]].collected_amount + 2 * 1e18 * plans[plan_ids[i]].collected_tokens);
             max_voted_plan_id = plan_ids[i];
          }
        }

        return max_voted_plan_id;
    }

}