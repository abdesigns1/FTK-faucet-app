// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/FaucetToken.sol";

contract FaucetTokenTest is Test {
    FaucetToken public token;

    address public owner   = address(0xABCD);
    address public alice   = address(0x1111);
    address public bob     = address(0x2222);
    address public charlie = address(0x3333);

    uint256 constant MAX_SUPPLY     = 10_000_000 * 1e18;
    uint256 constant REQUEST_AMOUNT = 100 * 1e18;
    uint256 constant COOLDOWN       = 24 hours;

    // Setup

    function setUp() public {
        vm.prank(owner);
        token = new FaucetToken(owner);
    }

    // Constructor / Initial State

    function test_InitialState() public view {
        assertEq(token.name(),        "FaucetToken");
        assertEq(token.symbol(),      "FTK");
        assertEq(token.decimals(),    18);
        assertEq(token.MAX_SUPPLY(),  MAX_SUPPLY);
        assertEq(token.totalSupply(), 1_000_000 * 1e18);
        assertEq(token.balanceOf(owner), 1_000_000 * 1e18);
        assertEq(token.owner(),       owner);
    }

    // requestToken 

    function test_RequestToken_Success() public {
        vm.prank(alice);
        token.requestToken();

        assertEq(token.balanceOf(alice), REQUEST_AMOUNT);
        assertEq(token.totalSupply(), 1_000_000 * 1e18 + REQUEST_AMOUNT);
    }

    function test_RequestToken_EmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit FaucetToken.TokensRequested(alice, REQUEST_AMOUNT, block.timestamp);

        vm.prank(alice);
        token.requestToken();
    }

    function test_RequestToken_UpdatesLastRequestTime() public {
        uint256 ts = block.timestamp;
        vm.prank(alice);
        token.requestToken();
        assertEq(token.lastRequestTime(alice), ts);
    }

    function test_RequestToken_RevertsBefore24h() public {
        vm.prank(alice);
        token.requestToken();

        // Warp forward 12 hours — still in cooldown
        vm.warp(block.timestamp + 12 hours);

        vm.expectRevert(
            abi.encodeWithSelector(
                FaucetToken.CooldownNotElapsed.selector,
                token.lastRequestTime(alice) + COOLDOWN
            )
        );
        vm.prank(alice);
        token.requestToken();
    }

    function test_RequestToken_SucceedsAfter24h() public {
        vm.prank(alice);
        token.requestToken();

        vm.warp(block.timestamp + 24 hours);

        vm.prank(alice);
        token.requestToken();

        assertEq(token.balanceOf(alice), REQUEST_AMOUNT * 2);
    }

    function test_RequestToken_SucceedsExactly24hLater() public {
        vm.prank(alice);
        token.requestToken();

        vm.warp(block.timestamp + COOLDOWN);

        vm.prank(alice);
        token.requestToken(); // should not revert

        assertEq(token.balanceOf(alice), REQUEST_AMOUNT * 2);
    }

    function test_RequestToken_IndependentCooldownsPerUser() public {
        vm.prank(alice);
        token.requestToken();

        // Bob has never requested — his cooldown is independent
        vm.prank(bob);
        token.requestToken();

        assertEq(token.balanceOf(alice), REQUEST_AMOUNT);
        assertEq(token.balanceOf(bob),   REQUEST_AMOUNT);
    }

    function test_RequestToken_AliceCooldownDoesNotAffectBob() public {
        vm.prank(alice);
        token.requestToken();

        // Alice is in cooldown, Bob requests successfully
        vm.prank(bob);
        token.requestToken();

        assertEq(token.balanceOf(bob), REQUEST_AMOUNT);
    }

    function test_RequestToken_CooldownRemaining_BeforeRequest() public view {
        // Before any request, cooldown should be 0
        assertEq(token.cooldownRemaining(alice), 0);
    }

    function test_RequestToken_CooldownRemaining_AfterRequest() public {
        vm.prank(alice);
        token.requestToken();

        uint256 remaining = token.cooldownRemaining(alice);
        assertApproxEqAbs(remaining, COOLDOWN, 1); // within 1 second
    }

    function test_RequestToken_CooldownRemaining_AfterCooldown() public {
        vm.prank(alice);
        token.requestToken();

        vm.warp(block.timestamp + COOLDOWN);
        assertEq(token.cooldownRemaining(alice), 0);
    }

    // mint 

    function test_Mint_OwnerCanMint() public {
        uint256 amount = 5_000 * 1e18;
        vm.prank(owner);
        token.mint(alice, amount);

        assertEq(token.balanceOf(alice), amount);
    }

    function test_Mint_EmitsEvent() public {
        uint256 amount = 1_000 * 1e18;

        vm.expectEmit(true, false, false, true);
        emit FaucetToken.TokensMinted(alice, amount);

        vm.prank(owner);
        token.mint(alice, amount);
    }

    function test_Mint_RevertsForNonOwner() public {
        vm.expectRevert();
        vm.prank(alice);
        token.mint(alice, 1_000 * 1e18);
    }

    function test_Mint_RevertsOnZeroAmount() public {
        vm.expectRevert(FaucetToken.ZeroMintAmount.selector);
        vm.prank(owner);
        token.mint(alice, 0);
    }

    function test_Mint_RevertsOnZeroAddress() public {
        vm.expectRevert(FaucetToken.ZeroAddress.selector);
        vm.prank(owner);
        token.mint(address(0), 1_000 * 1e18);
    }

    function test_Mint_RevertsWhenExceedsMaxSupply() public {
        uint256 tooBig = MAX_SUPPLY; // already 1M minted in constructor
        vm.expectRevert();
        vm.prank(owner);
        token.mint(alice, tooBig);
    }

    function test_Mint_ExactlyToMaxSupply() public {
        uint256 remaining = token.remainingSupply();
        vm.prank(owner);
        token.mint(alice, remaining);

        assertEq(token.totalSupply(), MAX_SUPPLY);
    }

    function test_Mint_CannotExceedMaxSupply_AfterMaxReached() public {
        uint256 remaining = token.remainingSupply();
        vm.prank(owner);
        token.mint(alice, remaining);

        vm.expectRevert();
        vm.prank(owner);
        token.mint(bob, 1);
    }

    // remainingSupply 

    function test_RemainingSupply_DecreasesOnMint() public {
        uint256 before = token.remainingSupply();
        uint256 amount = 50_000 * 1e18;

        vm.prank(owner);
        token.mint(alice, amount);

        assertEq(token.remainingSupply(), before - amount);
    }

    function test_RemainingSupply_DecreasesOnRequest() public {
        uint256 before = token.remainingSupply();

        vm.prank(alice);
        token.requestToken();

        assertEq(token.remainingSupply(), before - REQUEST_AMOUNT);
    }

    // Standard ERC20

    function test_Transfer() public {
        vm.prank(owner);
        token.mint(alice, 1_000 * 1e18);

        vm.prank(alice);
        token.transfer(bob, 400 * 1e18);

        assertEq(token.balanceOf(alice), 600 * 1e18);
        assertEq(token.balanceOf(bob),   400 * 1e18);
    }

    function test_Approve_And_TransferFrom() public {
        vm.prank(owner);
        token.mint(alice, 1_000 * 1e18);

        vm.prank(alice);
        token.approve(bob, 500 * 1e18);

        assertEq(token.allowance(alice, bob), 500 * 1e18);

        vm.prank(bob);
        token.transferFrom(alice, charlie, 300 * 1e18);

        assertEq(token.balanceOf(charlie),    300 * 1e18);
        assertEq(token.allowance(alice, bob), 200 * 1e18);
    }

    // Fuzz Tests 

    function testFuzz_Mint_NeverExceedsMaxSupply(uint256 amount) public {
        uint256 available = token.remainingSupply();
        amount = bound(amount, 1, available);

        vm.prank(owner);
        token.mint(alice, amount);

        assertLe(token.totalSupply(), MAX_SUPPLY);
    }

    function testFuzz_CooldownRemaining_NeverExceedsCooldown(address user) public {
        vm.assume(user != address(0));
        vm.prank(user);
        token.requestToken();

        assertLe(token.cooldownRemaining(user), COOLDOWN);
    }
}
