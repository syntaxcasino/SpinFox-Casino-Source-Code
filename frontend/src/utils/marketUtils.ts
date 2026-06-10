import { Market } from "@/types/overtime-v2";
import { MarketTypesMap } from "@/store/marketTypes";

export const getUniqueMarketTypeNames = (
  market: Market,
  marketTypes: MarketTypesMap
): string[] => {
  const seen = new Set<number>();

  const collectTypeIds = (m: Market) => {
    if (m.typeId !== undefined) seen.add(m.typeId);
    m.childMarkets?.forEach(collectTypeIds);
  };

  collectTypeIds(market);

  return Array.from(seen)
    .map((typeId) => marketTypes[typeId]?.name ?? `Unknown (${typeId})`)
    .filter((name, index, self) => self.indexOf(name) === index);
};