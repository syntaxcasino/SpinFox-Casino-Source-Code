"use client";

import { adminCreditUser } from "@/lib/api";
import { IUser } from "@/types";
import { useState } from "react";

interface UserSummaryProps {
	user: IUser;
}

export default function UserSettings({ user }: UserSummaryProps) {
	const [sponsorshipLock, setSponsorshipLock] = useState(false);
	const [tipLock, setTipLock] = useState(false);
	const [rainLock, setRainLock] = useState(false);
	const [leaderboardLock, setLeaderboardLock] = useState(false);
	const [withdrawLock, setWithdrawLock] = useState(true);
	const [freePartner, setFreePartner] = useState(true);
	const [rank, setRank] = useState("USER");

	const [balance, setBalance] = useState(0);
	const [deposit, setDeposit] = useState(0);
	const [withdraw, setWithdraw] = useState(0);


	return (
		<>
			<div className="space-y-4">
				{/* Sponsorship Lock */}
				<ToggleRow
					label="SPONSORSHIP LOCK"
					value={sponsorshipLock}
					onChange={() => setSponsorshipLock(!sponsorshipLock)}
				/>
				{/* Tip Lock */}
				<ToggleRow
					label="TIP LOCK"
					value={tipLock}
					onChange={() => setTipLock(!tipLock)}
				/>

				{/* Rain Lock */}
				<ToggleRow
					label="RAIN LOCK"
					value={rainLock}
					onChange={() => setRainLock(!rainLock)}
				/>

				{/* Leaderboard Lock */}
				<ToggleRow
					label="LEADERBOARD LOCK"
					value={leaderboardLock}
					onChange={() => setLeaderboardLock(!leaderboardLock)}
				/>

				{/* Clear Leaderboard */}
				<ActionRow
					label="CLEAR LEADERBOARD"
					buttonText="CLEAR"
					buttonColor="bg-[#f5a623] text-black"
				/>

				{/* Withdraw Lock */}
				<ToggleRow
					label="WITHDRAW LOCK"
					value={withdrawLock}
					onChange={() => setWithdrawLock(!withdrawLock)}
				/>

				{/* Set Rank */}
				<div className="flex items-center justify-between bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-transparent rounded-lg px-4 py-3">
					<span className="text-light-text dark:text-white">SET RANK</span>
					<div className="flex items-center space-x-2">
						<select
							value={rank}
							onChange={(e) => setRank(e.target.value)}
							className="bg-light-bg-secondary dark:bg-black text-light-text dark:text-white px-2 py-1 rounded-md text-sm border border-light-border dark:border-transparent"
						>
							<option>USER</option>
							<option>ADMIN</option>
							<option>MOD</option>
						</select>
						<button className="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary-hover transition-colors">
							UPDATE
						</button>
					</div>
				</div>

				{/* Free Partner */}
				<ToggleRow
					label="FREE PARTNER"
					value={freePartner}
					onChange={() => setFreePartner(!freePartner)}
				/>

				{/* Balance */}
				<InputRow
					label="SET BALANCE"
					value={balance}
					userid={user.id}
					onChange={setBalance}
				/>

				{/* Deposit */}
				<InputRow
					label="SET DEPOSIT"
					value={deposit}
					userid={user.id}
					onChange={setDeposit}
				/>

				{/* Withdraw */}
				<InputRow
					label="SET WITHDRAW"
					value={withdraw}
					userid={user.id}
					onChange={setWithdraw}
				/>

				{/* Mute User */}
				<ActionRow
					label="MUTE USER"
					buttonText="MUTE"
					buttonColor="bg-red-600 text-white"
				/>
			</div>
		</>
	);
}

/* 🔹 Reusable Rows */
function ToggleRow({
	label,
	value,
	onChange,
}: {
	label: string;
	value: boolean;
	onChange: () => void;
}) {
	return (
		<div className="flex items-center justify-between bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-transparent rounded-lg px-4 py-3">
			<span className="text-light-text dark:text-white">{label}</span>
			<label className="relative inline-flex items-center cursor-pointer">
				<input
					type="checkbox"
					className="sr-only peer"
					checked={value}
					onChange={onChange}
				/>
				<div className="w-11 h-6 bg-light-border dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
			</label>
		</div>
	);
}

function ActionRow({
	label,
	buttonText,
	buttonColor,
}: {
	label: string;
	buttonText: string;
	buttonColor: string;
}) {
	return (
		<div className="flex items-center justify-between bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-transparent rounded-lg px-4 py-3">
			<span className="text-light-text dark:text-white">{label}</span>
			<button className={`${buttonColor} px-3 py-1 rounded-md text-sm`}>
				{buttonText}
			</button>
		</div>
	);
}

function InputRow({
	label,
	value,
	userid,
	onChange,
}: {
	label: string;
	value: number;
	userid: number
	onChange: (val: number) => void;
}) {
	const handleUpdate = async (value: number, label: string): Promise<void> => {
		switch (label) {
			case "SET DEPOSIT":
				// Admin function: Credit balance to user (bonuses, promotions, etc)
				console.log("Admin credit user:", userid, value)
				const token = localStorage.getItem("token");
				const res = await adminCreditUser(token, userid, value)
				console.log("Credit result:", res)
				break;
		
			default:
				console.log("other clicked")
				break;
		}
	}

	return (
		<div className="flex items-center justify-between bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-transparent rounded-lg px-4 py-3">
			<span className="text-light-text dark:text-white">{label}</span>
			<div className="flex items-center space-x-2">
				<input
					type="text"
					value={value}
					onChange={(e) => onChange(parseFloat(e.target.value))}
					className="w-24 bg-light-bg-secondary dark:bg-black text-right text-primary font-semibold px-2 py-1 rounded-md border border-light-border dark:border-transparent"
				/>
				<button className="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary-hover transition-colors" onClick={ () => {handleUpdate(value, label)}}>
					UPDATE
				</button>
			</div>
		</div>
	);
}
