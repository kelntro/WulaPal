// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract WulaPal {
    struct Member {
        address wallet;
        bool hasContributed;
        bool hasReceivedPayout;
    }

    address public organizer;
    address public superAdmin;
    IERC20 public stableToken;
    uint256 public contributionAmount;
    uint256 public payoutAmount;
    uint256 public frequency;
    uint256 public totalMembers;
    uint256 public requiredMembers;
    uint256 public totalContributed;
    uint256 public nextPayoutIndex;
    uint256 public startTime;

    Member[] public members;
    mapping(address => bool) public isMember;

    event ContributionMade(address indexed member, uint256 amount);
    event PayoutReleased(address indexed recipient, uint256 netAmount, uint256 organizerFee, uint256 systemFee);
    event GroupCreated(address indexed organizer, uint256 requiredMembers, uint256 contributionAmount);

    modifier onlyOrganizer() {
        require(msg.sender == organizer, "Only the organizer can perform this action");
        _;
    }

    constructor(
        address _stableToken,
        uint256 _contributionAmount,
        uint256 _frequency,
        uint256 _requiredMembers,
        address _superAdmin
    ) {
        organizer = msg.sender;
        superAdmin = _superAdmin;
        stableToken = IERC20(_stableToken);
        contributionAmount = _contributionAmount;
        frequency = _frequency;
        requiredMembers = _requiredMembers;
        startTime = block.timestamp;

        emit GroupCreated(msg.sender, _requiredMembers, _contributionAmount);
    }

    function joinPaluwagan() external {
        require(totalMembers < requiredMembers, "Group is already full");
        require(!isMember[msg.sender], "Already a member");

        members.push(Member(msg.sender, false, false));
        isMember[msg.sender] = true;
        totalMembers++;
    }

    function contribute() external {

        for (uint i = 0; i < members.length; i++) {
            if (members[i].wallet == msg.sender) {
                require(!members[i].hasContributed, "Already contributed");

                bool success = stableToken.transferFrom(msg.sender, address(this), contributionAmount);
                require(success, "Token transfer failed");

                members[i].hasContributed = true;
                totalContributed += contributionAmount;
                emit ContributionMade(msg.sender, contributionAmount);
                break;
            }
        }
    }

    function automaticPayout() external onlyOrganizer {
        require(nextPayoutIndex < totalMembers, "All payouts completed");
        require(block.timestamp >= startTime + (nextPayoutIndex * frequency), "Not time for next payout");
        require(totalContributed >= contributionAmount * (requiredMembers - 1), "Insufficient funds");

        address recipient = members[nextPayoutIndex].wallet;
        members[nextPayoutIndex].hasReceivedPayout = true;

        uint256 totalPayout = contributionAmount * (requiredMembers - 1);
        uint256 organizerFee = (totalPayout * 1) / 100;
        uint256 systemFee = (totalPayout * 1) / 100;
        uint256 netPayout = totalPayout - organizerFee - systemFee;

        require(stableToken.transfer(recipient, netPayout), "Recipient transfer failed");
        require(stableToken.transfer(organizer, organizerFee), "Organizer fee transfer failed");
        require(stableToken.transfer(superAdmin, systemFee), "System fee transfer failed");

        emit PayoutReleased(recipient, netPayout, organizerFee, systemFee);

        nextPayoutIndex++;
    }

    function getContractBalance() external view returns (uint256) {
        return stableToken.balanceOf(address(this));
    }
}
