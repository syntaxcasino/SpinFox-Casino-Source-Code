import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GameMarket, Sport, StatusEnum } from '@/types/overtime-v2';
import CountdownTimer from './CountdownTimer';
// import { useAppStore } from '@/store/useAppStore';
import AnimatedButton from './AnimatedButton';
import { IPropsTicket, IPlayerOdd } from '@/types/sports-api';
import ErrorableImage from './ErrorableImage';
import { isValidOdd, convertOddsFormat, getPoslihedOddValue } from '@/lib/utils/general';
import { useAllSportsStore } from '@/store/sportsStore';
import { toast } from 'react-toastify';
import { formatTimestamp, slugifyTeamName } from '@/utils/general';
import CardLoader from './CardLoader';
import { useUser } from '@/contexts/UserContext';
// import { useAppKitAccount } from '@reown/appkit/react';
import { useBetSlipStore, SelectedTicket } from '@/store/betSlip';
import { useOddsPreferenceStore } from '@/store/oddsPreference';
import { formatOdds } from '@/utils/oddsFormatter';

const SportsCard = ({
  market,
  isTicketSelected,
  isGrid = false,
  isBetslip = false,
  isLoading = false
}: {
  market: GameMarket;
  isTicketSelected?: (sportId: string, pickIndex: string) => boolean;
  isGrid?: boolean;
  isBetslip?: boolean;
  isLoading?: boolean;
}) => {
  const { allSports } = useAllSportsStore();
  // const { setPropsTickets, propsTickets, oddsType, user, challengeTickets, setChallengeTickets, isAuthenticated, setShowSignInModal } = useAppStore();
  // const userOddsDisplay = (user as any)?.oddsDisplay as string | undefined;
  // const effectiveOddsType = !isAuthenticated
  //   ? 'decimal'
  //   : userOddsDisplay === 'american' || userOddsDisplay === 'decimal' || userOddsDisplay === 'fractional'
  //   ? (userOddsDisplay as any)
  //   : oddsType;
  const router = useRouter();
  const { user } = useUser();
  // const { isConnected } = useAppKitAccount();
  const { addTicket, hasTicket, removeTicket, selectedTickets } = useBetSlipStore();
  const { oddsFormat } = useOddsPreferenceStore();

  // Get the selected position for this market
  const getSelectedPosition = (gameId: string): number | null => {
    const ticket = selectedTickets.find(t => t.gameId === gameId);
    return ticket ? ticket.position : null;
  };

  // Format odds for display based on user preference
  const displayOdds = (oddValue: number): string => {
    return formatOdds(oddValue, oddsFormat);
  };

  const getLabelFromSubLeagueId = (subLeagueId: number): string => {
    return allSports[subLeagueId]?.label ?? 'Unknown League';
  }

  const getSportFromSubLeagueId = (subLeagueId: number): string => {
    return allSports[subLeagueId]?.sport ?? 'Unknown League';
  }
  // const isSelectedTicket = useCallback(
  //   (ticketId: string) => {
  //     if (!isChallenge) {
  //       return !!propsTickets.find(({ odd: { id } }) => id === ticketId);
  //     } else {
  //       return !!challengeTickets.find(({ odd: { id } }) => id === ticketId);
  //     }
  //   },
  //   [propsTickets, challengeTickets]
  // );

  // Old addTicket function - now handled by betSlip store
  // const addOldTicket = (ticket: IPropsTicket) => {
  //   // if (!isChallenge) {
  //   //   setPropsTickets((prevPicks: IPropsTicket[]) => [
  //   //     // Filter out any tickets with the same fixture id
  //   //     ...prevPicks.filter(t => t.fixture.id !== ticket.fixture.id),
  //   //     // Add the new ticket
  //   //     ticket,
  //   //   ]);
  //   // } else {
  //   //   setChallengeTickets((prevPicks: IPropsTicket[]) => [
  //   //     // Filter out any tickets with the same fixture id
  //   //     ...prevPicks.filter(t => t.fixture.id !== ticket.fixture.id),
  //   //     // Add the new ticket
  //   //     ticket,
  //   //   ]);
  //   // };
  // }

  const handleClickOdd = (market: GameMarket, position: number) => {
    // Validate the odd value
    const oddValue = market.odds[position];
    if (!isValidOdd({ price: oddValue })) {
      toast.error("Invalid odd value");
      return;
    }

    if (!user) {
      toast.error("Please log in");
      return;
    } 
    // else if (!isConnected) {
    //   toast.error("Please connect your wallet");
    //   return;
    // }

    // Check if this exact position is already selected
    const currentPosition = getSelectedPosition(market.gameId);

    if (currentPosition === position) {
      // Remove ticket if clicking the same position again
      removeTicket(market.gameId);
      toast.success("Removed from bet slip");
    } else {
      // Get position label
      let positionLabel = '';
      if (market.odds.length === 3) {
        // Win/Draw/Win market
        positionLabel = position === 0 ? market.homeTeam : position === 2 ? 'Draw' : market.awayTeam;
      } else if (market.odds.length === 2) {
        // Win/Win or Over/Under market
        positionLabel = position === 0 ? market.homeTeam : market.awayTeam;
      }

      // Create ticket object
      const ticket: SelectedTicket = {
        gameId: market.gameId,
        sportId: market.subLeagueId,
        typeId: market.typeId,
        maturity: market.maturity,
        status: market.status as StatusEnum,
        line: 0,
        playerId: 0,
        odds: oddValue,
        merkleProof: [],
        position: position,
        combinedPositions: [],
        live: false,
        homeTeam: market.homeTeam,
        awayTeam: market.awayTeam,
        tournamentName: market.tournamentName,
        positionLabel: positionLabel,
        marketType: "Winner", // Main market is always Winner for quick cards
      };

      addTicket(ticket);
      if (currentPosition !== null) {
        toast.success("Updated bet slip position");
      } else {
        toast.success("Added to bet slip");
      }
    }
  };

  // Old removeTicket function - now handled by betSlip store
  // const removeOldTicket = (ticketId: string) => {
  //   // if (!isChallenge) {
  //   //   setPropsTickets((prevPicks: IPropsTicket[]) =>
  //   //     prevPicks.filter(({ odd: { id } }) => id !== ticketId)
  //   //   );
  //   // } else {
  //   //   setChallengeTickets((prevPicks: IPropsTicket[]) =>
  //   //     prevPicks.filter(({ odd: { id } }) => id !== ticketId)
  //   //   );
  //   // }
  // };

  const handleSectionClick = () => {
    router.push(`/sport/${market.gameId}?league=${market.subLeagueId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <CardLoader />
      </div>
    );
  }

  return (
    <section
      onClick={handleSectionClick}
      className={`rounded-xl p-3 bg-light-bg-secondary dark:bg-dark-bg-secondary cursor-pointer hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors duration-200 border border-light-border dark:border-dark-border ${isGrid ? 'w-full' : 'flex-shrink-0 w-[351px] lg:w-[calc(25%-15px)]'
        }`}
      key={market.gameId}
    >
      <div className="flex items-center justify-between text-[10px] text-light-text-secondary dark:text-white/30 font-medium">
        <p className="">{getLabelFromSubLeagueId(market.subLeagueId)}</p>

        <p
          className={'text-[10px] text-light-text dark:text-white bg-light-border dark:bg-dark-border rounded py-0.5 px-1.5'}
        >
          {formatTimestamp(market.maturity)}
        </p>
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 py-0.5">
          <div className="size-4 relative">
            {(() => {
              const leagueLabel = getLabelFromSubLeagueId(market.subLeagueId);
              const sportFolder =
                leagueLabel === "NCAA Football"
                  ? "NCAA"
                  : getSportFromSubLeagueId(market.subLeagueId);

              return (
                <ErrorableImage
                  url={`https://www.overtimemarkets.xyz/logos/${sportFolder}/${slugifyTeamName(market.homeTeam)}.webp`}
                  alt="Home"
                />
              );
            })()}
          </div>
          <p className="text-light-text dark:text-white text-xs truncate">{market.homeTeam}</p>
        </div>
        <div className="flex items-center gap-2 py-0.5">
          <div className="size-4 relative">
            {(() => {
              const leagueLabel = getLabelFromSubLeagueId(market.subLeagueId);
              console.log("leagueLable:", leagueLabel);
              const sportFolder =
                leagueLabel === "NCAA Football"
                  ? "NCAA"
                  : getSportFromSubLeagueId(market.subLeagueId);

              return (
                <ErrorableImage
                  url={`https://www.overtimemarkets.xyz/logos/${sportFolder}/${slugifyTeamName(market.awayTeam)}.webp`}
                  alt="Home"
                />
              );
            })()}
          </div>
          <p className="text-light-text dark:text-white text-xs truncate">{market.awayTeam}</p>
        </div>

        {/* --- odds */}
        <div className="flex items-center gap-2 justify-between">
          {!isBetslip && (
            <div className="flex items-center gap-2 justify-between mt-1.5 w-full">
              {/* Home Win */}
              <AnimatedButton
                onClick={(e) => { e.stopPropagation(); handleClickOdd(market, 0); }}
                className={`flex-1 h-[36px] border cursor-pointer rounded-lg py-1 transition-all duration-200 text-light-text dark:text-white ${getSelectedPosition(market.gameId) === 0
                  ? 'bg-primary/20 border-primary hover:bg-primary/30'
                  : 'bg-light-border dark:bg-dark-border border-transparent hover:bg-light-border/70 dark:hover:bg-dark-border/70'
                  }`}
              >
                <div className="flex flex-col items-center">
                  <p className="text-[10px]">1</p>
                  <p className="text-[11px] font-medium">{displayOdds(market.odds[0])}</p>
                </div>
              </AnimatedButton>

              {/* Draw */}
              {market.odds.length > 2 && (
                <AnimatedButton
                  onClick={(e) => { e.stopPropagation(); handleClickOdd(market, 2); }}
                  className={`flex-1 h-[36px] border cursor-pointer rounded-lg py-1 transition-all duration-200 text-light-text dark:text-white ${getSelectedPosition(market.gameId) === 2
                    ? 'bg-primary/20 border-primary hover:bg-primary/30'
                    : 'bg-light-border dark:bg-dark-border border-transparent hover:bg-light-border/70 dark:hover:bg-dark-border/70'
                    }`}
                >
                  <div className="flex flex-col items-center">
                    <p className="text-[10px]">X</p>
                    <p className="text-[11px] font-medium">{displayOdds(market.odds[2])}</p>
                  </div>
                </AnimatedButton>
              )}

              {/* Away Win */}
              <AnimatedButton
                onClick={(e) => { e.stopPropagation(); handleClickOdd(market, 1); }}
                className={`flex-1 h-[36px] border cursor-pointer rounded-lg py-1 transition-all duration-200 text-light-text dark:text-white ${getSelectedPosition(market.gameId) === 1
                  ? 'bg-primary/20 border-primary hover:bg-primary/30'
                  : 'bg-light-border dark:bg-dark-border border-transparent hover:bg-light-border/70 dark:hover:bg-dark-border/70'
                  }`}
              >
                <div className="flex flex-col items-center">
                  <p className="text-[10px]">2</p>
                  <p className="text-[11px] font-medium">{displayOdds(market.odds[1])}</p>
                </div>
              </AnimatedButton>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default SportsCard;
