'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IUser } from '@/types';

interface UserSummaryProps {
  user: IUser;
}

export default function UserSummary({ user }: UserSummaryProps) {

	return (
		<>
			{/* Avatar & Name */}
			<div className="flex flex-col items-center my-6">
				<img
					src={user.avatar || "/images/avatar/default.png"}
					alt="Avatar"
					className="w-20 h-20 rounded-full border-4 border-primary"
				/>
				<h3 className="mt-3 text-xl font-bold text-light-text dark:text-white">{user.username}</h3>
			</div>

			{/* Level Progress */}
			<div className="text-center mb-6">
				<div className="flex justify-between text-sm text-light-text-secondary dark:text-gray-400 mb-1">
					<span>0.00 / 21.00</span>
					<span>Since: {user.createdAt.split('T')[0]}</span>
				</div>
				{/* Progress bar */}
				<div className="w-full h-2 bg-light-border dark:bg-gray-700 rounded-full overflow-hidden">
					<div
						className="h-2 bg-primary"
						style={{ width: "10%" }}
					/>
				</div>
				<div className="flex justify-between text-xs mt-1 text-light-text-secondary dark:text-gray-400">
					<span>LEVEL 0</span>
					<span>LEVEL 1</span>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-3 gap-3">
				<div className="rounded-2xl bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-transparent text-center p-3 shadow-sm">
					<p className="text-light-text-secondary dark:text-gray-400 text-sm">TOTAL DEPOSIT</p>
					<p className="text-lg font-bold text-light-text dark:text-white">0.00</p>
				</div>
				<div className="rounded-2xl bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-transparent text-center p-3 shadow-sm">
					<p className="text-light-text-secondary dark:text-gray-400 text-sm">TOTAL WITHDRAW</p>
					<p className="text-lg font-bold text-light-text dark:text-white">0.00</p>
				</div>
				<div className="rounded-2xl bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-transparent text-center p-3 shadow-sm">
					<p className="text-light-text-secondary dark:text-gray-400 text-sm">TOTAL PROFIT</p>
					<p className="text-lg font-bold text-primary">0.00</p>
				</div>
			</div>
		</>
	);
}