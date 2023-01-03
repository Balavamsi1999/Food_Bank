// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
import './voting.sol';
import './ratingC.sol';
import './planC.sol';
import './fb_token.sol';

contract FoodBank {

    struct FBank {    
        string name;    // Foodbank name
        uint rating;    // overall rating of the fb
        address payable acc_address;  // account address of the foodbank employee
        uint total_money_raised; // sum of all funds raised thus far
        bool active; // raising any funds currently or not.
        uint[] history;  // Foodbank past history including active dispensement
    }

    mapping(address => FBank) foodbanks;
    address[] foodbank_addresses;

    struct FBankHistory{
        uint id;
        address payable fb_addr;
        string name;   // eg: Coronovirus fund
        bool active;
        uint curr_step;  // { 0: 'nothing', 1: 'fb has started fund collection'}
        uint total_steps;
        uint money_raised;
        uint rating;
        address[] donors;  // who are all the donors donated to this particluar dispensement
        uint[] donor_acts;
        uint[] plans;  // list of all plans given by foodbank
        uint[] ratings;
        uint most_voted_plan_id;
        uint[] votes;
    }
    mapping(uint => FBankHistory) fbankshistories;
    uint latest_fb_hist_id;

    struct DonorActivity{
      uint id;
      address donor_acc_addr;
      address food_bank_addr;
      uint fb_hist_id;
      bool funded;
      uint funded_amount;
      bool voted;
      uint voted_for_plan_id;
    }
    uint latest_donor_activity_id;
    mapping(uint => DonorActivity) donor_activities;

    struct Donor{
        address acc_address;
        string name;
        uint total_amount_funded;
        uint[] activity;
    }
    mapping(address => Donor) donors;
    address[] donor_addresses;

    address VotingContract;
    address RatingContract;
    address PlanContract;
    address FbTokenContract;

    address chairperson;
    

    constructor () {
        latest_fb_hist_id = 0;
        latest_donor_activity_id = 0;
        chairperson = msg.sender;
    }

    function _onlyCDeployer() private view {
      require(msg.sender == chairperson);
    }

    modifier onlyCDeployer() 
    {
        _onlyCDeployer();
        _;
    }

    modifier validForFbCreation(address acc_addr) 
    {
        bool not_present = true;
        for (uint i = 0; i < foodbank_addresses.length; i++) {
            if (foodbank_addresses[i] == acc_addr) {
                not_present = false;
                break;
            }
        }
        require(not_present == true);
       _;
    }

    modifier onlyChair(address payable acc_addr, address payable fb_acc_addr){
        require(acc_addr == fb_acc_addr, "Not Authorised");
        _;
    }

    function _validFBHistStep(uint hist_id, uint req_step) private view {
       FBankHistory memory fb_hist = fbankshistories[hist_id];
       require(fb_hist.curr_step == req_step);
    }

    modifier validFBHistStep(uint hist_id, uint req_step){
        _validFBHistStep(hist_id, req_step);
       _;
    }

    function _onlyChairFBHist(uint hist_id, address user_addr) private view {
       FBankHistory memory fb_hist = fbankshistories[hist_id];
       require(fb_hist.fb_addr == user_addr);
    }

    modifier onlyChairFBHist(uint hist_id, address user_addr){
       _onlyChairFBHist(hist_id, user_addr);
       _;
    }

    function _validDonor(address donor_address) private view{
        bool present = false;

        for(uint i = 0; i < donor_addresses.length; i++) {
           if(donor_addresses[i] == donor_address){
             present  = true;
             break;
           }
        }
        require(present == true);
    }

    function _validateTokens(uint tokens, address addr) view private{
       InterfaceFBToken token_interface = InterfaceFBToken(FbTokenContract);
       uint no_of_tokens = token_interface.fetch_balance(addr);
       require(no_of_tokens >= tokens, "You have less no:of tokens");
    }

    modifier validDonor(address donor_address){
        _validDonor(donor_address);
        _;
    }

    // Donor shouldn't be already present
    modifier vaidForDonorCreation(address acc_addr) 
    {
        bool not_present = true;
        for (uint i = 0; i < donor_addresses.length; i++) {
            if (donor_addresses[i] == acc_addr) {
                not_present = false;
                break;
            }
        }
        require(not_present == true);
       _;
    }

    modifier onlyValidDonor(uint hist_id, address user_address){
        bool present = false;

        for(uint i = 0; i < fbankshistories[hist_id].donors.length; i++){
            if(fbankshistories[hist_id].donors[i] == user_address){
                present = true;
                break;
            }
        }
        require(present == true, "Not a Valid Donor");
        _;
    }

    modifier validPlanId(uint plan_id, uint hist_id){
        bool present = false;

        for(uint i = 0; i < fbankshistories[hist_id].plans.length; i++){
            if(fbankshistories[hist_id].plans[i] == plan_id){
                present = true;
                break;
            }
        }
        require(present == true);
        _;
    }

    modifier validateTokens(uint tokens, address addr){
      _validateTokens(tokens, addr);
       _; 
    }

    function setVotingContractAddr(address voting_addr) onlyCDeployer() external{
        VotingContract = voting_addr;
    }

    function setRatingContractAddr(address rating_addr) onlyCDeployer() external{
        RatingContract = rating_addr;
    }

    function setPlanContractAddr(address plan_addr) onlyCDeployer() external{
        PlanContract = plan_addr;
    }

    function setFbTokenContractAddr(address fb_token_addr) onlyCDeployer() external{
        FbTokenContract = fb_token_addr;
    }

    function getListOfFBS() public view returns(address[] memory, string[] memory, bool[] memory, uint[] memory, uint[] memory){
        uint no_of_fbs = foodbank_addresses.length;
        address[] memory fb_addresses = new address[](no_of_fbs);
        string[] memory fb_names = new string[](no_of_fbs);
        bool[] memory fb_activity = new bool[](no_of_fbs);
        uint[] memory fb_cumm_funds_raised = new uint[](no_of_fbs);
        uint[] memory fb_rating = new uint[](no_of_fbs);
      

        for(uint i = 0; i < no_of_fbs; i++) {
            address fb_addr = foodbank_addresses[i];
            fb_addresses[i] = fb_addr;

            FBank memory fb = foodbanks[fb_addr];
            fb_names[i] =  fb.name;
            fb_activity[i] = fb.active;
            fb_cumm_funds_raised[i] = fb.total_money_raised;
            fb_rating[i] = fb.rating;
        }
        return (fb_addresses, fb_names, fb_activity, fb_cumm_funds_raised, fb_rating);
    }

    function createFB(string memory name) public validForFbCreation(msg.sender){
       address payable acc_addr = payable(msg.sender);

       foodbanks[acc_addr].name = name;
       foodbanks[acc_addr].acc_address = acc_addr;
       foodbanks[acc_addr].active = false;
       foodbanks[acc_addr].total_money_raised = 0;
       foodbanks[acc_addr].history = new uint[](0);
       foodbank_addresses.push(acc_addr);
    }
    
    function createFBHistory(string memory name, address payable fb_acc_addr) onlyChair(payable(msg.sender), fb_acc_addr) public{
       uint[] memory empty_arr = new uint[](0);

        FBankHistory memory new_fb_hist = FBankHistory({ id: latest_fb_hist_id + 1, name: name, fb_addr: fb_acc_addr, active: false, curr_step: 0, total_steps: 5, money_raised: 0, rating: 0,
            donors: new address[](0), plans: empty_arr, votes: empty_arr, donor_acts: empty_arr, most_voted_plan_id: 0, ratings: empty_arr});
        
        latest_fb_hist_id = latest_fb_hist_id + 1;
        fbankshistories[latest_fb_hist_id] = new_fb_hist;

        foodbanks[fb_acc_addr].history.push(latest_fb_hist_id);
    } 

    function getFBHistory(address acc_addr) public view returns(string[] memory, uint[] memory, bool[] memory, uint[] memory, uint[] memory){
       uint no_of_fbs = foodbank_addresses.length;
       bool present = false;
      
       for(uint i = 0; i < no_of_fbs; i++) {
            address fb_addr = foodbank_addresses[i];
            if(fb_addr == acc_addr){
                present = true;
                break;
            }
        }
        require(present == true, "FoodBank not present");


        uint[] memory fb_history = foodbanks[acc_addr].history;

        uint history_len = fb_history.length;
        string[] memory names = new string[](history_len);
        uint[] memory ratings = new uint[](history_len);
        bool[] memory activity = new bool[](history_len);
        uint[] memory money_raised = new uint[](history_len);
        uint[] memory primary_keys = new uint[](history_len);

        for(uint i = 0; i < history_len; i++) {
            uint hist_id = fb_history[i];
            // FBankHistory memory fbh = fb_history[i];
            names[i] =  fbankshistories[hist_id].name;
            ratings[i] = fbankshistories[hist_id].rating;
            activity[i] = fbankshistories[hist_id].active;
            money_raised[i] = fbankshistories[hist_id].money_raised;
            primary_keys[i] = fbankshistories[hist_id].id;
        }
        return(names, ratings, activity, money_raised, primary_keys);
    }

    function viewFBHistory(uint fb_hist_id) public view returns(address, string memory, bool, uint[] memory, uint[] memory, uint[] memory){
        FBankHistory memory fb_hist = fbankshistories[fb_hist_id];

        address fb_addr = fb_hist.fb_addr;
        string memory name = fb_hist.name;
        bool active = fb_hist.active;
 
        uint[] memory data = new uint[](5); // {curr_step, total_steps, money_raised, rating, most_voted_plan_id}
        data[0] = fb_hist.curr_step;
        data[1] = fb_hist.total_steps;
        data[2] = fb_hist.money_raised;
        data[3] = fb_hist.rating;
        data[4] = fb_hist.most_voted_plan_id;

        uint[] memory donor_acts_ids = fb_hist.donor_acts;
        uint[] memory plan_ids = fb_hist.plans;

        return(fb_addr, name, active, data, donor_acts_ids, plan_ids);
    }

    function donate_funds(uint hist_id) public validFBHistStep(hist_id, 1) validDonor(msg.sender) payable{
        address donor_addr = msg.sender; 
        uint donation_amount = msg.value;

        // updating donation amount in fundbank and fundbank hist
        fbankshistories[hist_id].money_raised = fbankshistories[hist_id].money_raised + donation_amount;
        address foodbank_addr = fbankshistories[hist_id].fb_addr;
        foodbanks[foodbank_addr].total_money_raised = foodbanks[foodbank_addr].total_money_raised + donation_amount;       
       
        // updating in donor and donor activity
        donors[donor_addr].total_amount_funded = donors[donor_addr].total_amount_funded + donation_amount;
        DonorActivity memory don_act = DonorActivity({ id: latest_donor_activity_id + 1, food_bank_addr: foodbank_addr, fb_hist_id: hist_id, funded: true,
                                                       funded_amount: donation_amount, voted: false,  voted_for_plan_id: 0, donor_acc_addr: donor_addr});
        latest_donor_activity_id = latest_donor_activity_id + 1;
        donors[donor_addr].activity.push(latest_donor_activity_id);
        donor_activities[latest_donor_activity_id] = don_act;

        // updating foodbank_hist
        fbankshistories[hist_id].donor_acts.push(latest_donor_activity_id);
        fbankshistories[hist_id].donors.push(donor_addr);
    }

    function withdraw_funds(uint hist_id) public onlyChairFBHist(hist_id, msg.sender) validFBHistStep(hist_id, 3){
        address payable fb_addr = fbankshistories[hist_id].fb_addr;
        uint amount_collected = fbankshistories[hist_id].money_raised;
        fb_addr.transfer(amount_collected); 
        fbankshistories[hist_id].curr_step = 4;
    }
    
    function createDonor(string memory name) public vaidForDonorCreation(msg.sender){
       address payable acc_addr = payable(msg.sender);
       donors[acc_addr].name = name;
       donors[acc_addr].acc_address = acc_addr;
       donors[acc_addr].total_amount_funded = 0;
       donors[acc_addr].activity = new uint[](0);
       donor_addresses.push(acc_addr);
    }

    function getListOfDonors() public view returns(address[] memory, string[] memory, uint[] memory){
        uint no_of_donors = donor_addresses.length;
        string[] memory donor_names = new string[](no_of_donors);
        uint[] memory donor_cumm_funds_raised = new uint[](no_of_donors);
      

        for(uint i = 0; i < no_of_donors; i++) {
            address donor_addr = donor_addresses[i];

            Donor memory don = donors[donor_addr];
            donor_names[i] =  don.name;
            donor_cumm_funds_raised[i] = don.total_amount_funded;
        }
        return (donor_addresses, donor_names, donor_cumm_funds_raised);
    }

    function viewDonorDetails(address donor_addr) public view returns(string memory, uint, uint[] memory){
        Donor memory donor = donors[donor_addr];

        string memory name = donor.name;
        uint total_amount_funded = donor.total_amount_funded;
        uint[] memory activity = donor.activity;

        return (name, total_amount_funded, activity);
    }

    function getDonorActivityDetails(uint donor_activity_id) public view returns(address, uint[] memory, bool, address, string[] memory){
        // DonorActivity memory don_act = donor_activities[donor_activity_id];
        address food_bank_addr = donor_activities[donor_activity_id].food_bank_addr;

        uint[] memory data = new uint[](3); // {fb_hist_id, funded_amount, voted_for_plan_id}
        bool voted = donor_activities[donor_activity_id].voted;
        address donor_addr = donor_activities[donor_activity_id].donor_acc_addr;
        // string memory donor_name = donors[donor_addr].name;
        string[] memory names = new string[](3);

        data[0] = donor_activities[donor_activity_id].fb_hist_id;
        data[1] = donor_activities[donor_activity_id].funded_amount;
        data[2] = donor_activities[donor_activity_id].voted_for_plan_id;

        names[0] = donors[donor_addr].name;
        names[1] = fbankshistories[data[0]].name;
        names[2] = foodbanks[food_bank_addr].name;

        return(food_bank_addr, data, voted, donor_addr, names);
    }

    function updateFbHistStateToStartFundCollection(uint hist_id) public onlyChairFBHist(hist_id, msg.sender) validFBHistStep(hist_id, 0){
      fbankshistories[hist_id].curr_step = 1;
      fbankshistories[hist_id].active = true;
      foodbanks[fbankshistories[hist_id].fb_addr].active = true;
    }

    function createFbHistPlan(uint hist_id, string[] memory item_names, uint[] memory item_amounts) public onlyChairFBHist(hist_id, msg.sender) validFBHistStep(hist_id, 1){
      InterfacePlan plan_interface = InterfacePlan(PlanContract);
      uint latest_plan_id = plan_interface.createPlanAndPlanItems(item_names, item_amounts); 

      // updating fbank history
      fbankshistories[hist_id].plans.push(latest_plan_id);    
    }

    function startVoting(uint hist_id) public onlyChairFBHist(hist_id, msg.sender) validFBHistStep(hist_id, 1){
        fbankshistories[hist_id].curr_step = 2;
    }

    function registerVote(uint plan_id, uint hist_id, uint tokens) public validPlanId(plan_id, hist_id) validateTokens(tokens, msg.sender){
       address user_addr = msg.sender;

       uint donor_activity_id = 0;
       for(uint i = 0; i < fbankshistories[hist_id].donor_acts.length; i++){
            if(donor_activities[fbankshistories[hist_id].donor_acts[i]].donor_acc_addr == user_addr){
               donor_activity_id = fbankshistories[hist_id].donor_acts[i];
               break;
            }
       }

       require(fbankshistories[hist_id].curr_step == 2);
       require(donor_activity_id != 0, "Donor hasn't funded");
       require(donor_activities[donor_activity_id].voted == false, "Already voted");

       // updating donor_activity
       donor_activities[donor_activity_id].voted = true;
       donor_activities[donor_activity_id].voted_for_plan_id = plan_id;
       // uint donated_amount = donor_activities[donor_activity_id].funded_amount;

       // updating plan collected amount
       InterfacePlan plan_interface = InterfacePlan(PlanContract);
       plan_interface.updatePlanCollectedAmount(plan_id, donor_activities[donor_activity_id].funded_amount, tokens); 

       // creating a new vote and updating in fb_hist
       InterfaceVoting voting_interface = InterfaceVoting(VotingContract);
       uint latest_vote_id = voting_interface.createVote(user_addr, plan_id, donor_activities[donor_activity_id].funded_amount, tokens); 
       fbankshistories[hist_id].votes.push(latest_vote_id);

        // deducting tokens
        // if(tokens > 0){
        //   InterfaceFBToken token_interface = InterfaceFBToken(FbTokenContract);
        //   token_interface.deduct_tokens(tokens);
        // }
    }


    function endVotingAndFetchMostVotedPlan(uint hist_id) public validFBHistStep(hist_id, 2) onlyChairFBHist(hist_id, msg.sender){
        uint[] memory mem_plans =  fbankshistories[hist_id].plans;

        InterfacePlan plan_interface = InterfacePlan(PlanContract);
        uint max_voted_plan_id = plan_interface.fetchMostVotedPlan(mem_plans); 

        assert(max_voted_plan_id != 0); // Max Voted Plan doesn't exists

        fbankshistories[hist_id].curr_step = 3;
        fbankshistories[hist_id].most_voted_plan_id = max_voted_plan_id;
    }
 
    function submitBill(uint hist_id) public validFBHistStep(hist_id, 4) onlyChairFBHist(hist_id, msg.sender){
        fbankshistories[hist_id].curr_step = 5;
        fbankshistories[hist_id].active = false;
        // TODO FE can send uploaded bill url and we save in fb_hist

         // updating fb rating
        address fb_addr = fbankshistories[hist_id].fb_addr;
        uint[] memory history = foodbanks[fb_addr].history;
        bool active_present = false;

        for(uint i = 0; i < history.length; i++){
          if(fbankshistories[history[i]].active == true){
           active_present = true;
           break;
          }
        }
        foodbanks[fb_addr].active = active_present;
    }

    function submitRatingUtil(uint hist_id, address user_addr, uint rating) private{
        // uint[] memory donor_acts = fbankshistories[hist_id].donor_acts;

        uint donor_activity_id = 0;
        for(uint i = 0; i < fbankshistories[hist_id].donor_acts.length; i++){
            if(donor_activities[fbankshistories[hist_id].donor_acts[i]].donor_acc_addr == user_addr){
                donor_activity_id = fbankshistories[hist_id].donor_acts[i];
                break;
            }
        }

        DonorActivity memory donor_act = donor_activities[donor_activity_id];
        uint donated_amount = donor_act.funded_amount;

        require(donor_act.funded == true, "Donor hasn't funded");
        require(donor_act.voted == true, "Donor hasn't voted");

        InterfaceRating rating_interface = InterfaceRating(RatingContract);
        uint latest_rating_id = rating_interface.createRating(hist_id, rating, user_addr, donated_amount);
        fbankshistories[hist_id].ratings.push(latest_rating_id);

        
        // updating fb_hist rating
        uint[] memory rating_ids = fbankshistories[hist_id].ratings;
        uint rating_value = rating_interface.getCummulativerating(rating_ids);
        fbankshistories[hist_id].rating = rating_value;


        // updating fb rating
        address fb_addr = fbankshistories[hist_id].fb_addr;
        uint[] memory history = foodbanks[fb_addr].history;
        uint count = 0;
        uint cumm_rating = 0;

        for(uint i = 0; i < history.length; i++){
          if(fbankshistories[history[i]].rating != 0){
            count = count + 1;
            cumm_rating = cumm_rating + fbankshistories[history[i]].rating;
          }
        }
        foodbanks[fb_addr].rating = cumm_rating / count;
    }

    function submitRating(uint hist_id, uint rating) public validFBHistStep(hist_id, 5) onlyValidDonor(hist_id, msg.sender){
        submitRatingUtil(hist_id, msg.sender, rating);
    }
}