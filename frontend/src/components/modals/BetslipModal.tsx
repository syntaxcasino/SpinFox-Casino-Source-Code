import React from 'react';

import Modal from '../layout/Modal';
import { useBetSlipStore } from '@/store/betSlip';
import BetSlip from '../ui/BetSlip';

const BetslipModal = () => {
  const { showBetSlip, setShowBetSlip, selectedTickets } = useBetSlipStore();

  if (!showBetSlip) return null;

  return (
    <Modal onClose={() => setShowBetSlip(false)}>
      <section className="w-full lg:w-[30%] mx-auto">
        {selectedTickets.length > 0 && <BetSlip />}
      </section>
    </Modal>
  );
};

export default BetslipModal;
