// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract WulaPal {
    struct Member {
        address wallet;
        bool hasContributed;
        bool hasReceivedPayout;
    }

    address public organizer;
    uint256 public contributionAmount;
    uint256 public payoutAmount;
    uint256 public frequency; // Contribution frequency in seconds
    uint256 public totalMembers;
    uint256 public requiredMembers;
    uint256 public totalContributed;
    uint256 public nextPayoutIndex;
    uint256 public startTime;
    bool public groupStarted;

    Member[] public members;
    mapping(address => bool) public isMember;

    event ContributionMade(address indexed member, uint256 amount);
    event PayoutReleased(address indexed recipient, uint256 amount);
    event GroupCreated(address indexed organizer, uint256 requiredMembers, uint256 contributionAmount);
    event GroupFull();

    modifier onlyOrganizer() {
        require(msg.sender == organizer, "Only the organizer can perform this action");
        _;
    }

    modifier onlyWhenStarted() {
        require(groupStarted, "Group has not started yet");
        _;
    }

    constructor(uint256 _contributionAmount, uint256 _frequency, uint256 _requiredMembers) {
        organizer = msg.sender;
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

        if (totalMembers == requiredMembers) {
            startGroup();
        }
    }

    function startGroup() private {
        groupStarted = true;
        shuffleMembers(); // Randomize payout order
        emit GroupFull();
    }

    function shuffleMembers() private {
        for (uint i = 0; i < members.length; i++) {
            uint randomIndex = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, i))) % members.length;
            (members[i], members[randomIndex]) = (members[randomIndex], members[i]);
        }
    }

    function contribute() external payable onlyWhenStarted {
        require(msg.value == contributionAmount, "Incorrect contribution amount");
        require(isMember[msg.sender], "Not a member");

        for (uint i = 0; i < members.length; i++) {
            if (members[i].wallet == msg.sender) {
                require(!members[i].hasContributed, "Already contributed");
                members[i].hasContributed = true;
                totalContributed += msg.value;
                emit ContributionMade(msg.sender, msg.value);
                break;
            }
        }
    }

    function automaticPayout() external onlyOrganizer {
        require(groupStarted, "Group must be started");
        require(nextPayoutIndex < totalMembers, "All payouts completed");
        require(block.timestamp >= startTime + (nextPayoutIndex * frequency), "Not time for next payout");
        require(totalContributed >= contributionAmount * totalMembers, "Insufficient funds for payout");

        address recipient = members[nextPayoutIndex].wallet;
        members[nextPayoutIndex].hasReceivedPayout = true;
        payable(recipient).transfer(contributionAmount * totalMembers);
        emit PayoutReleased(recipient, contributionAmount * totalMembers);

        nextPayoutIndex++;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
