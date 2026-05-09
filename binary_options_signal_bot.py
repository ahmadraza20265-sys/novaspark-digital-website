#!/usr/bin/env python3
"""
Professional-grade Binary Options SIGNAL bot (manual execution only).

This script is intentionally built as a single Python file, with modular
classes/functions inside the file for clarity and easier deployment.

What it does:
- Monitors candle closes
- Calculates EMA20, EMA50, RSI14, and ATR14
- Generates CALL / PUT / NO TRADE signals
- Applies daily and streak-based risk controls
- Tracks pending trades, wins/losses, and accuracy
- Runs with a realistic mock data feed by default

What it does NOT do:
- Place trades automatically
- Promise unrealistic accuracy
- Use martingale or dangerous position scaling
"""

from __future__ import annotations

import argparse
import logging
import time
from collections import deque
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Deque, List, Optional, Tuple

import numpy as np
import pandas as pd
from ta.momentum import RSIIndicator
from ta.trend import EMAIndicator
from ta.volatility import AverageTrueRange


CALL = "CALL"
PUT = "PUT"
NO_TRADE = "NO TRADE"
WIN = "WIN"
LOSS = "LOSS"
DRAW = "DRAW"
ARROW = "→"


logging.basicConfig(level=logging.INFO, format="%(message)s")
LOGGER = logging.getLogger("binary-options-signal-bot")


@dataclass
class UserConfig:
    """Stores runtime settings entered by the user."""

    trade_amount: float
    expiry_minutes: int
    asset: str
    trade_speed_seconds: float
    data_mode: str
    candle_minutes: int = 1
    max_trades_per_day: int = 10
    max_consecutive_losses: int = 2


@dataclass
class SignalDecision:
    """Represents one signal decision on a closed candle."""

    timestamp: datetime
    asset: str
    direction: str
    confidence: str
    entry_price: float
    ema20: float
    ema50: float
    rsi: float
    atr: float
    atr_percent: float
    expiry_candles: int
    reason: str = ""


@dataclass
class PendingTrade:
    """Tracks a signal waiting for expiry so its outcome can be measured."""

    decision: SignalDecision
    entry_index: int
    expiry_index: int


@dataclass
class TradeResult:
    """Represents the outcome of a settled signal."""

    decision: SignalDecision
    settled_at: datetime
    exit_price: float
    outcome: str


class IndicatorEngine:
    """Calculates indicators and evaluates rule-based confluence."""

    MIN_HISTORY = 60

    def __init__(self, asset: str) -> None:
        self.asset = asset.upper()
        self.min_atr_percent = self._infer_min_atr_percent(self.asset)

    @staticmethod
    def _infer_min_atr_percent(asset: str) -> float:
        """
        ATR is compared as a percentage of close so the filter scales across assets.
        """
        crypto_markers = ("BTC", "ETH", "LTC", "SOL", "XRP")
        if any(marker in asset for marker in crypto_markers):
            return 0.35
        if "XAU" in asset or "GOLD" in asset:
            return 0.18
        return 0.08

    def add_indicators(self, frame: pd.DataFrame) -> pd.DataFrame:
        """Returns a copy of the data with EMA, RSI, and ATR columns added."""
        df = frame.copy()
        df["ema20"] = EMAIndicator(close=df["close"], window=20).ema_indicator()
        df["ema50"] = EMAIndicator(close=df["close"], window=50).ema_indicator()
        df["rsi14"] = RSIIndicator(close=df["close"], window=14).rsi()
        df["atr14"] = AverageTrueRange(
            high=df["high"], low=df["low"], close=df["close"], window=14
        ).average_true_range()
        df = df.replace([np.inf, -np.inf], np.nan)
        return df

    def evaluate(self, frame: pd.DataFrame, expiry_minutes: int) -> SignalDecision:
        """
        Generates a signal from the latest fully closed candle.
        Only rule-complete setups become CALL or PUT.
        """
        if len(frame) < self.MIN_HISTORY:
            latest = frame.iloc[-1]
            return SignalDecision(
                timestamp=latest["timestamp"],
                asset=self.asset,
                direction=NO_TRADE,
                confidence="N/A",
                entry_price=float(latest["close"]),
                ema20=float("nan"),
                ema50=float("nan"),
                rsi=float("nan"),
                atr=float("nan"),
                atr_percent=float("nan"),
                expiry_candles=max(1, expiry_minutes),
                reason="Waiting for enough candle history.",
            )

        candle = frame.iloc[-1]
        required = ("ema20", "ema50", "rsi14", "atr14")
        if pd.isna(candle[list(required)]).any():
            return SignalDecision(
                timestamp=candle["timestamp"],
                asset=self.asset,
                direction=NO_TRADE,
                confidence="N/A",
                entry_price=float(candle["close"]),
                ema20=float(candle.get("ema20", np.nan)),
                ema50=float(candle.get("ema50", np.nan)),
                rsi=float(candle.get("rsi14", np.nan)),
                atr=float(candle.get("atr14", np.nan)),
                atr_percent=float("nan"),
                expiry_candles=max(1, expiry_minutes),
                reason="Indicators are still warming up.",
            )

        price = float(candle["close"])
        ema20 = float(candle["ema20"])
        ema50 = float(candle["ema50"])
        rsi = float(candle["rsi14"])
        atr = float(candle["atr14"])
        atr_percent = (atr / price) * 100 if price else 0.0

        call_setup = ema20 > ema50 and 40 <= rsi <= 65 and atr_percent >= self.min_atr_percent
        put_setup = ema20 < ema50 and 35 <= rsi <= 60 and atr_percent >= self.min_atr_percent

        direction = NO_TRADE
        reason = "Conditions not fully aligned."
        if call_setup:
            direction = CALL
            reason = "EMA20 above EMA50, RSI in CALL zone, ATR confirms momentum."
        elif put_setup:
            direction = PUT
            reason = "EMA20 below EMA50, RSI in PUT zone, ATR confirms momentum."
        elif atr_percent < self.min_atr_percent:
            reason = (
                f"ATR too low ({atr_percent:.3f}% < {self.min_atr_percent:.3f}%). "
                "Sideways market filter active."
            )

        confidence = self._score_confidence(direction, price, ema20, ema50, rsi, atr_percent)
        return SignalDecision(
            timestamp=candle["timestamp"],
            asset=self.asset,
            direction=direction,
            confidence=confidence,
            entry_price=price,
            ema20=ema20,
            ema50=ema50,
            rsi=rsi,
            atr=atr,
            atr_percent=atr_percent,
            expiry_candles=max(1, expiry_minutes),
            reason=reason,
        )

    def _score_confidence(
        self,
        direction: str,
        price: float,
        ema20: float,
        ema50: float,
        rsi: float,
        atr_percent: float,
    ) -> str:
        """Produces a practical confidence label for qualified signals."""
        if direction == NO_TRADE:
            return "N/A"

        trend_gap_percent = abs(ema20 - ema50) / price * 100 if price else 0.0
        score = 0

        if trend_gap_percent >= 0.05:
            score += 1
        if atr_percent >= self.min_atr_percent * 1.25:
            score += 1

        if direction == CALL and 45 <= rsi <= 58:
            score += 1
        if direction == PUT and 42 <= rsi <= 55:
            score += 1

        if score >= 3:
            return "High"
        if score == 2:
            return "Medium"
        return "Low"


class TradeTracker:
    """Manages daily limits, streak protection, and performance stats."""

    def __init__(self, config: UserConfig) -> None:
        self.config = config
        self.pending_trades: Deque[PendingTrade] = deque()
        self.closed_trades: List[TradeResult] = []
        self.trades_today = 0
        self.current_day: Optional[datetime.date] = None
        self.consecutive_losses = 0

    def reset_if_new_day(self, timestamp: datetime) -> None:
        """Resets daily counters when candle timestamps move to a new date."""
        candle_day = timestamp.date()
        if self.current_day != candle_day:
            self.current_day = candle_day
            self.trades_today = 0
            self.consecutive_losses = 0
            LOGGER.info(f"[{timestamp:%Y-%m-%d %H:%M:%S}] Daily counters reset.")

    def can_signal(self, timestamp: datetime) -> Tuple[bool, str]:
        """Checks whether the bot is still allowed to issue new signals."""
        self.reset_if_new_day(timestamp)

        if self.trades_today >= self.config.max_trades_per_day:
            return False, "Daily trade limit reached (10/10)."

        if self.consecutive_losses >= self.config.max_consecutive_losses:
            return False, "Paused after 2 consecutive losses."

        return True, ""

    def register_signal(self, decision: SignalDecision, entry_index: int) -> None:
        """Stores a new signal so it can be settled after the expiry horizon."""
        expiry_index = entry_index + decision.expiry_candles
        self.pending_trades.append(
            PendingTrade(decision=decision, entry_index=entry_index, expiry_index=expiry_index)
        )
        self.trades_today += 1

    def settle_due_trades(self, frame: pd.DataFrame) -> List[TradeResult]:
        """
        Settles trades whose expiry candle is available.
        Binary options are simplified here as directionally correct or not.
        """
        settled_results: List[TradeResult] = []
        latest_index = len(frame) - 1

        while self.pending_trades and self.pending_trades[0].expiry_index <= latest_index:
            pending = self.pending_trades.popleft()
            exit_row = frame.iloc[pending.expiry_index]
            exit_price = float(exit_row["close"])
            entry_price = pending.decision.entry_price
            direction = pending.decision.direction

            if direction == CALL:
                outcome = WIN if exit_price > entry_price else LOSS if exit_price < entry_price else DRAW
            else:
                outcome = WIN if exit_price < entry_price else LOSS if exit_price > entry_price else DRAW

            if outcome == LOSS:
                self.consecutive_losses += 1
            elif outcome == WIN:
                self.consecutive_losses = 0

            result = TradeResult(
                decision=pending.decision,
                settled_at=exit_row["timestamp"],
                exit_price=exit_price,
                outcome=outcome,
            )
            self.closed_trades.append(result)
            settled_results.append(result)

        return settled_results

    def accuracy(self) -> float:
        """Returns win-rate excluding draws, which is more useful for evaluation."""
        wins = sum(1 for trade in self.closed_trades if trade.outcome == WIN)
        losses = sum(1 for trade in self.closed_trades if trade.outcome == LOSS)
        total = wins + losses
        return (wins / total) * 100 if total else 0.0

    def stats_snapshot(self) -> str:
        """Builds a compact performance summary line."""
        wins = sum(1 for trade in self.closed_trades if trade.outcome == WIN)
        losses = sum(1 for trade in self.closed_trades if trade.outcome == LOSS)
        draws = sum(1 for trade in self.closed_trades if trade.outcome == DRAW)
        return (
            f"Trades today: {self.trades_today}/{self.config.max_trades_per_day} | "
            f"Wins: {wins} | Losses: {losses} | Draws: {draws} | "
            f"Accuracy: {self.accuracy():.2f}% | "
            f"Consecutive losses: {self.consecutive_losses}"
        )


class MockMarketDataProvider:
    """
    Simulates a realistic candle stream with changing trend/volatility regimes.

    This is the default provider so the bot can run without paid APIs.
    Replace this provider later if you want to connect to a broker or free feed.
    """

    def __init__(self, asset: str, candle_minutes: int = 1, seed: Optional[int] = None) -> None:
        self.asset = asset.upper()
        self.candle_minutes = candle_minutes
        self.rng = np.random.default_rng(seed)
        self.current_time = datetime.now().replace(second=0, microsecond=0) - timedelta(minutes=240)
        self.last_close = self._starting_price()
        self.regime_candles_left = 0
        self.regime_bias = 0.0
        self.regime_volatility = self._base_volatility()

    def _starting_price(self) -> float:
        if "BTC" in self.asset:
            return 65000.0
        if "ETH" in self.asset:
            return 3200.0
        if "XAU" in self.asset or "GOLD" in self.asset:
            return 2350.0
        if "JPY" in self.asset:
            return 154.20
        return 1.0850

    def _base_volatility(self) -> float:
        if "BTC" in self.asset:
            return 0.0038
        if "ETH" in self.asset:
            return 0.0032
        if "XAU" in self.asset or "GOLD" in self.asset:
            return 0.0017
        return 0.0008

    def _reset_regime_if_needed(self) -> None:
        if self.regime_candles_left > 0:
            return

        self.regime_candles_left = int(self.rng.integers(8, 24))
        self.regime_bias = float(self.rng.choice([-1.0, 0.0, 1.0], p=[0.35, 0.25, 0.40]))
        self.regime_volatility = self._base_volatility() * float(self.rng.uniform(0.8, 1.6))

    def _make_candle(self) -> dict:
        self._reset_regime_if_needed()
        self.regime_candles_left -= 1

        open_price = self.last_close
        drift = self.regime_bias * self.regime_volatility * float(self.rng.uniform(0.18, 0.52))
        noise = float(self.rng.normal(0, self.regime_volatility))
        close_price = max(0.0001, open_price * (1 + drift + noise))

        wick_scale = abs(float(self.rng.normal(self.regime_volatility * 0.45, self.regime_volatility * 0.25)))
        high_price = max(open_price, close_price) * (1 + wick_scale)
        low_price = min(open_price, close_price) * max(0.0001, (1 - wick_scale))

        self.current_time += timedelta(minutes=self.candle_minutes)
        self.last_close = close_price

        return {
            "timestamp": self.current_time,
            "open": round(open_price, 6),
            "high": round(high_price, 6),
            "low": round(low_price, 6),
            "close": round(close_price, 6),
            "volume": int(self.rng.integers(100, 1000)),
        }

    def bootstrap(self, candles: int = 120) -> pd.DataFrame:
        """Creates initial history for indicator warm-up."""
        rows = [self._make_candle() for _ in range(candles)]
        return pd.DataFrame(rows)

    def next_candle(self) -> pd.DataFrame:
        """Streams one fresh closed candle per loop."""
        return pd.DataFrame([self._make_candle()])


class LiveDataPlaceholder:
    """
    Placeholder for future live data integration.

    To connect real data later:
    1. Replace `bootstrap()` with a fetch of historical candles
    2. Replace `next_candle()` with broker/feed polling logic
    3. Make sure returned columns are: timestamp, open, high, low, close, volume
    """

    def __init__(self, asset: str, candle_minutes: int = 1) -> None:
        self.asset = asset
        self.candle_minutes = candle_minutes

    def bootstrap(self, candles: int = 120) -> pd.DataFrame:
        raise NotImplementedError(
            "Live data placeholder not connected yet. Use --mode mock or "
            "replace this class with a real free data source."
        )

    def next_candle(self) -> pd.DataFrame:
        raise NotImplementedError(
            "Live candle polling not implemented yet. Plug your real data feed here."
        )


class BinaryOptionsSignalBot:
    """Coordinates the data feed, indicators, signals, and risk logic."""

    def __init__(self, config: UserConfig) -> None:
        self.config = config
        self.engine = IndicatorEngine(config.asset)
        self.tracker = TradeTracker(config)
        self.provider = self._build_provider()
        self.frame = pd.DataFrame()

    def _build_provider(self):
        if self.config.data_mode == "mock":
            return MockMarketDataProvider(self.config.asset, candle_minutes=self.config.candle_minutes)
        return LiveDataPlaceholder(self.config.asset, candle_minutes=self.config.candle_minutes)

    def run(self) -> None:
        """Starts the monitoring loop and processes each new candle close."""
        self.frame = self.provider.bootstrap(candles=120)
        self.frame = self.engine.add_indicators(self.frame)

        LOGGER.info("=" * 78)
        LOGGER.info("Binary Options SIGNAL Bot (manual execution only)")
        LOGGER.info("=" * 78)
        LOGGER.info(
            "Asset: %s | Stake: $%.2f | Expiry: %s min | Mode: %s | Scan speed: %.1f sec",
            self.config.asset,
            self.config.trade_amount,
            self.config.expiry_minutes,
            self.config.data_mode,
            self.config.trade_speed_seconds,
        )
        LOGGER.info(
            "ATR filter: %.3f%% minimum | Risk guide: $%.2f stake fits roughly a $%.2f-$%.2f account for 1-2%% risk.",
            self.engine.min_atr_percent,
            self.config.trade_amount,
            self.config.trade_amount / 0.02,
            self.config.trade_amount / 0.01,
        )
        LOGGER.info("Martingale: DISABLED | Max trades/day: 10 | Stop after 2 consecutive losses")
        LOGGER.info("-" * 78)

        while True:
            new_candle = self.provider.next_candle()
            self.frame = pd.concat([self.frame, new_candle], ignore_index=True).tail(500).reset_index(drop=True)
            self.frame = self.engine.add_indicators(self.frame)

            settled = self.tracker.settle_due_trades(self.frame)
            for result in settled:
                self._log_trade_result(result)

            latest_timestamp = self.frame.iloc[-1]["timestamp"]
            self._process_latest_candle()

            if self.tracker.consecutive_losses >= self.config.max_consecutive_losses:
                LOGGER.warning(
                    "[%s] Warning: losing streak reached. Bot paused to protect capital.",
                    latest_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                )
                break

            time.sleep(self.config.trade_speed_seconds)

        LOGGER.info("-" * 78)
        LOGGER.info("Session ended. Final stats -> %s", self.tracker.stats_snapshot())

    def _process_latest_candle(self) -> None:
        """Evaluates only the newly closed candle and prints a signal or no-trade."""
        decision = self.engine.evaluate(self.frame, self.config.expiry_minutes)
        can_signal, block_reason = self.tracker.can_signal(decision.timestamp)
        signal_time = decision.timestamp.strftime("%Y-%m-%d %H:%M:%S")

        if decision.direction == NO_TRADE:
            LOGGER.info(f"[{signal_time}] {decision.asset} {ARROW} {NO_TRADE} | {decision.reason}")
            return

        if not can_signal:
            LOGGER.warning(f"[{signal_time}] {decision.asset} {ARROW} SIGNAL BLOCKED | {block_reason}")
            return

        LOGGER.info(f"[{signal_time}] {decision.asset} {ARROW} {decision.direction} (Confidence: {decision.confidence})")
        LOGGER.info(
            "  Price: %.6f | EMA20: %.6f | EMA50: %.6f | RSI14: %.2f | ATR14: %.6f (%.3f%%)",
            decision.entry_price,
            decision.ema20,
            decision.ema50,
            decision.rsi,
            decision.atr,
            decision.atr_percent,
        )
        LOGGER.info("  Reason: %s", decision.reason)

        entry_index = len(self.frame) - 1
        self.tracker.register_signal(decision, entry_index=entry_index)
        LOGGER.info("  Pending trades: %s | %s", len(self.tracker.pending_trades), self.tracker.stats_snapshot())

    def _log_trade_result(self, result: TradeResult) -> None:
        """Prints clear settlement logs and updated performance statistics."""
        decision = result.decision
        LOGGER.info(
            "[%s] %s %s settled %s %s | Entry: %.6f | Exit: %.6f | Expiry: %s min",
            result.settled_at.strftime("%Y-%m-%d %H:%M:%S"),
            decision.asset,
            decision.direction,
            ARROW,
            result.outcome,
            decision.entry_price,
            result.exit_price,
            decision.expiry_candles,
        )
        LOGGER.info("  Performance -> %s", self.tracker.stats_snapshot())


def prompt_float(label: str, minimum: float) -> float:
    """Prompts until a valid float above the minimum is entered."""
    while True:
        raw = input(label).strip()
        try:
            value = float(raw)
            if value < minimum:
                raise ValueError
            return value
        except ValueError:
            print(f"Please enter a number greater than or equal to {minimum}.")


def prompt_int(label: str, minimum: int) -> int:
    """Prompts until a valid integer above the minimum is entered."""
    while True:
        raw = input(label).strip()
        try:
            value = int(raw)
            if value < minimum:
                raise ValueError
            return value
        except ValueError:
            print(f"Please enter an integer greater than or equal to {minimum}.")


def prompt_text(label: str, default: Optional[str] = None) -> str:
    """Prompts for text and optionally falls back to a default."""
    raw = input(label).strip()
    if raw:
        return raw.upper()
    return default.upper() if default else ""


def parse_args() -> argparse.Namespace:
    """Optional CLI flags so the script can run non-interactively as well."""
    parser = argparse.ArgumentParser(description="Binary Options Signal Bot (manual signal only)")
    parser.add_argument("--amount", type=float, help="Trade amount in dollars")
    parser.add_argument("--expiry", type=int, help="Trade expiry in minutes")
    parser.add_argument("--asset", type=str, help="Asset symbol, e.g. EURUSD or BTCUSD")
    parser.add_argument("--speed", type=float, help="Seconds between candle checks in mock mode")
    parser.add_argument(
        "--mode",
        choices=("mock", "live"),
        default=None,
        help="Use mock simulated data or a future live feed placeholder",
    )
    return parser.parse_args()


def collect_user_config(args: argparse.Namespace) -> UserConfig:
    """Collects runtime parameters from CLI args or interactive prompts."""
    trade_amount = args.amount if args.amount and args.amount > 0 else prompt_float("Trade amount ($): ", 0.01)
    expiry_minutes = args.expiry if args.expiry and args.expiry > 0 else prompt_int("Trade expiry (minutes): ", 1)
    asset = args.asset.upper() if args.asset else prompt_text("Asset (e.g. EURUSD, BTCUSD): ", "EURUSD")
    trade_speed_seconds = (
        args.speed if args.speed and args.speed > 0 else prompt_float("Adjustable scan speed in seconds: ", 0.1)
    )
    data_mode = args.mode if args.mode else prompt_text("Mode [mock/live] (default: mock): ", "mock").lower()
    if data_mode not in {"mock", "live"}:
        print("Invalid mode entered. Falling back to mock mode.")
        data_mode = "mock"

    return UserConfig(
        trade_amount=trade_amount,
        expiry_minutes=expiry_minutes,
        asset=asset,
        trade_speed_seconds=trade_speed_seconds,
        data_mode=data_mode,
    )


def main() -> None:
    """Application entry point."""
    args = parse_args()
    config = collect_user_config(args)

    bot = BinaryOptionsSignalBot(config)
    try:
        bot.run()
    except KeyboardInterrupt:
        LOGGER.info("\nBot stopped by user.")
        LOGGER.info("Final stats -> %s", bot.tracker.stats_snapshot())
    except NotImplementedError as exc:
        LOGGER.error(str(exc))
        LOGGER.info("Tip: run with --mode mock for the built-in market simulation.")


if __name__ == "__main__":
    main()
