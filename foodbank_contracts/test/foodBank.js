const FoodBank = artifacts.require('foodBank.sol');
const PlanC = artifacts.require('planC.sol');
let acc_addr = "0x561309Ba79745786FeFFEfB1ec407E4C9d2A8395";

contract('FoodBank', () => {
	it('should create FoodBank correctly', async () => {
		const fbInstance = await FoodBank.deployed();
		let fb_name = "FB_NYC";

		await fbInstance.createFB(fb_name);
		get_fbs = await fbInstance.getListOfFBS();

		let acc_addr_in_result = get_fbs['0'][0];
		let fb_name_in_result = get_fbs['1'][0];

		assert(acc_addr_in_result ==  acc_addr);
		assert(fb_name_in_result ==  fb_name);
	});

	it('should create FoodBank History correctly', async () => {
		const fbInstance = await FoodBank.deployed();
		let fb_history_name = "Flood relief";	

		await fbInstance.createFBHistory(fb_history_name, acc_addr);
		get_fb_hists = await fbInstance.getFBHistory(acc_addr);

		let fb_hist_name_in_result = get_fb_hists['0'][0];
		assert(fb_hist_name_in_result ==  fb_history_name);
	});

	it('should create donor correctly', async () => {
		const fbInstance = await FoodBank.deployed();
		let donor_name = "Donor_abd";

		await fbInstance.createDonor(donor_name);
		get_donors_res = await fbInstance.getListOfDonors();

		let donor_name_in_result = get_donors_res['1'][0];
		assert(donor_name_in_result ==  donor_name);

	});

	it('update FbHistory to start fund collection', async () => {
		const fbInstance = await FoodBank.deployed();

		await fbInstance.updateFbHistStateToStartFundCollection(1);
		let res = await fbInstance.viewFBHistory(1);
		let curr_step = res['3'][0].words[0];

		assert(curr_step ==  1);
	});

	it('Should create a new plan correctly', async () => {
		const fbInstance = await FoodBank.deployed();
		const planInstance = await PlanC.deployed();
		await fbInstance.setPlanContractAddr(planInstance.address);
		let fb_hist_id = 1;

		await fbInstance.createFbHistPlan(fb_hist_id, ["pizza", "burger"], [10, 20]);
		let res = await fbInstance.viewFBHistory(fb_hist_id);
		let curr_step = res['3'][0].words[0];

		assert(curr_step ==  1);
	});

	it('Start voting should work correctly', async () => {
		const fbInstance = await FoodBank.deployed();
		let fb_hist_id = 1;

		await fbInstance.startVoting(fb_hist_id);
		let res = await fbInstance.viewFBHistory(fb_hist_id);
		let curr_step = res['3'][0].words[0];

		assert(curr_step ==  2);
	});
});