// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract PollCrossChainBridge is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    event Deposit(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 targetChainId,
        bytes32 indexed depositHash,
        uint256 nonce,
        uint256 timestamp
    );

    event Claim(
        address indexed recipient,
        address indexed token,
        uint256 amount,
        uint256 sourceChainId,
        bytes32 indexed depositHash,
        bytes32 transferHash,
        uint256 timestamp
    );

    event Refund(
        address indexed user,
        address indexed token,
        uint256 amount,
        bytes32 indexed depositHash,
        bytes32 refundHash,
        uint256 timestamp
    );

    event TokenPoolUpdated(address indexed token, uint256 newBalance);
    event ExchangeRateUpdated(uint256 newRate);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event EmergencyWithdraw(address indexed token, uint256 amount);

    struct DepositMessage {
        address user;
        address token;
        uint256 amount;
        uint256 targetChainId;
        uint256 deadline;
        uint256 nonce;
    }

    struct ClaimMessage {
        address recipient;
        address token;
        uint256 amount;
        uint256 sourceChainId;
        uint256 deadline;
        bytes32 depositHash;
    }

    mapping(address => bool) private validators;
    mapping(address => mapping(bytes32 => bool)) private processedClaims;
    mapping(address => mapping(bytes32 => bool)) private processedDeposits;
    mapping(address => uint256) private depositNonces;

    uint256 public constant RATE_PRECISION = 1e18;
    uint256 public validatorCount;
    uint256 public minValidators = 1;
    uint256 public partnerChainId;
    uint256 public exchangeRate;
    bool public isRefundActive = false;
    IERC20 public pollToken;

    modifier onlyValidator() {
        require(validators[msg.sender], "Not a validator");
        _;
    }

    modifier validToken(address token) {
        require(token != address(0), "Invalid token address");
        require(address(pollToken) == token, "Token not supported");
        _;
    }

    constructor(uint256 _partnerChainId, address _pollToken)
        Ownable(msg.sender)
    {
        partnerChainId = _partnerChainId;
        pollToken = IERC20(_pollToken);
        validators[msg.sender] = true;
        validatorCount = 1;
        exchangeRate = RATE_PRECISION;
    }

    function setPartnerChainId(uint256 _partnerChainId) external onlyOwner {
        partnerChainId = _partnerChainId;
    }

    function addValidator(address validator) external onlyOwner {
        require(validator != address(0), "Invalid validator address");
        require(!validators[validator], "Validator already exists");

        validators[validator] = true;
        validatorCount++;

        emit ValidatorAdded(validator);
    }

    function removeValidator(address validator) external onlyOwner {
        require(validators[validator], "Validator does not exist");
        require(validatorCount > minValidators, "Cannot remove last validator");

        validators[validator] = false;
        validatorCount--;

        emit ValidatorRemoved(validator);
    }

    function setMinValidators(uint256 _minValidators) external onlyOwner {
        require(_minValidators > 0, "Min validators must be > 0");
        require(
            _minValidators <= validatorCount,
            "Min validators exceeds current count"
        );
        minValidators = _minValidators;
    }

    function setExchangeRate(uint256 rate) external onlyOwner {
        require(rate > 0, "Rate must be > 0");
        exchangeRate = rate;
        emit ExchangeRateUpdated(rate);
    }

    function processDeposit(
        DepositMessage calldata message,
        bytes calldata signature
    )
        external
        nonReentrant
        whenNotPaused
        validToken(message.token)
        returns (bytes32)
    {
        require(message.amount > 0, "Amount must be > 0");
        require(
            message.targetChainId == partnerChainId,
            "Invalid target chain"
        );
        require(message.user == msg.sender, "Invalid user");
        require(message.deadline >= block.timestamp, "Message expired");
        require(message.nonce == depositNonces[msg.sender], "Invalid nonce");

        bytes32 calculatedHash = keccak256(
            abi.encode(
                message.user,
                message.token,
                message.amount,
                message.targetChainId,
                message.nonce,
                block.chainid
            )
        );

        bytes32 ethSignedMessageHash = calculatedHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        require(validators[signer], "Invalid signature");

        require(
            !processedDeposits[msg.sender][calculatedHash],
            "Deposit already processed"
        );
        processedDeposits[msg.sender][calculatedHash] = true;

        depositNonces[msg.sender]++;

        IERC20(message.token).safeTransferFrom(
            msg.sender,
            address(this),
            message.amount
        );

        emit Deposit(
            message.user,
            message.token,
            message.amount,
            message.targetChainId,
            calculatedHash,
            message.nonce,
            block.timestamp
        );

        return calculatedHash;
    }

    function processClaim(
        ClaimMessage calldata message,
        bytes calldata signature
    ) external nonReentrant whenNotPaused validToken(message.token) {
        require(message.recipient != address(0), "Invalid recipient");
        require(message.amount > 0, "Invalid amount");
        require(message.deadline >= block.timestamp, "Message expired");
        require(
            message.sourceChainId == partnerChainId,
            "Invalid source chain"
        );
        require(message.depositHash != bytes32(0), "Invalid deposit hash");
        require(message.recipient == msg.sender, "Invalid recipient");

        bytes32 messageHash = keccak256(
            abi.encode(
                message.recipient,
                message.token,
                message.amount,
                message.sourceChainId,
                message.deadline,
                message.depositHash,
                block.chainid
            )
        );

        require(
            !processedClaims[msg.sender][message.depositHash],
            "Claim already processed"
        );

        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        require(validators[signer], "Invalid signature");

        uint256 transferAmount = (message.amount * exchangeRate) /
            RATE_PRECISION;
        require(transferAmount > 0, "Claim amount too small");
        require(
            pollToken.balanceOf(address(this)) >= transferAmount,
            "Insufficient pool balance"
        );

        processedClaims[msg.sender][message.depositHash] = true;

        IERC20(message.token).safeTransfer(message.recipient, transferAmount);

        emit Claim(
            message.recipient,
            message.token,
            transferAmount,
            message.sourceChainId,
            message.depositHash,
            messageHash,
            block.timestamp
        );
    }

    function emergencyWithdraw(address token, uint256 amount)
        external
        onlyOwner
    {
        require(amount > 0, "Amount must be > 0");

        uint256 availableBalance = IERC20(token).balanceOf(address(this));

        require(availableBalance >= amount, "Insufficient balance");
        IERC20(token).safeTransfer(owner(), amount);

        emit EmergencyWithdraw(token, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function isClaimProcessed(address user, bytes32 claimHash)
        external
        view
        returns (bool)
    {
        return processedClaims[user][claimHash];
    }

    function isDepositProcessed(address user, bytes32 depositHash)
        external
        view
        returns (bool)
    {
        return processedDeposits[user][depositHash];
    }

    function getPoolBalance() external view returns (uint256) {
        return pollToken.balanceOf(address(this));
    }

    function getContractBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function calculateClaimAmount(address token, uint256 inputAmount)
        external
        view
        validToken(token)
        returns (uint256)
    {
        return (inputAmount * exchangeRate) / RATE_PRECISION;
    }

    function getDepositNonce(address user) external view returns (uint256) {
        return depositNonces[user];
    }

    struct RefundMessage {
        address user;
        address token;
        uint256 amount;
        bytes32 depositHash;
        uint256 deadline;
        string reason;
    }

    mapping(address => mapping(bytes32 => bool)) private processedRefunds;

    function processRefund(
        RefundMessage calldata message,
        bytes calldata signature
    ) external nonReentrant whenNotPaused validToken(message.token) {
        require(isRefundActive, "Refunds are currently disabled");
        require(message.user != address(0), "Invalid user address");
        require(message.amount > 0, "Amount must be > 0");
        require(message.deadline >= block.timestamp, "Message expired");
        require(message.depositHash != bytes32(0), "Invalid deposit hash");
        require(message.user == msg.sender, "Invalid user");

        bytes32 refundHash = keccak256(
            abi.encode(
                message.user,
                message.token,
                message.amount,
                message.depositHash,
                message.deadline,
                message.reason,
                block.chainid
            )
        );

        require(
            !processedRefunds[msg.sender][message.depositHash],
            "Refund already processed"
        );

        require(
            processedDeposits[msg.sender][message.depositHash],
            "Original deposit not found"
        );

        bytes32 ethSignedMessageHash = refundHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        require(validators[signer], "Invalid signature");

        require(
            IERC20(message.token).balanceOf(address(this)) >= message.amount,
            "Insufficient contract balance"
        );

        processedRefunds[msg.sender][message.depositHash] = true;

        IERC20(message.token).safeTransfer(message.user, message.amount);

        emit Refund(
            message.user,
            message.token,
            message.amount,
            message.depositHash,
            refundHash,
            block.timestamp
        );
    }

    function isRefundProcessed(address user, bytes32 depositHash)
        external
        view
        returns (bool)
    {
        return processedRefunds[user][depositHash];
    }

    function setRefundActive(bool _isActive) external onlyOwner {
        isRefundActive = _isActive;
    }
}
