export const isPlayerOverUnderMarket = (marketType: number) =>
  [
    11051, 11052, 11053, 11057, 11058, 11202, 11203, 11204, 11205, 11207, 11208,
    11209, 11210, 11211, 11100, 11029, 11035, 11038, 11039, 11225, 11226, 11227,
    11212, 11098,
  ].includes(marketType);

export const isOverUnderMarket = (marketType: number) =>
  [
    10002, 10014, 10017, 10018, 10031, 10032, 10033, 10034, 10035, 10036, 10037,
    10038, 10039, 10061, 10062, 10063, 10064, 10065, 10066, 10067, 10068, 10069,
    10111, 10112, 10118, 10119, 10211, 10212, 10218, 10219, 11051, 11052, 11053,
    11057, 11058, 11202, 11203, 11204, 11205, 11207, 11208, 11209, 11210, 11211,
    11100, 11029, 11035, 11038, 11039, 11225, 11226, 11227, 11212, 11098,
  ].includes(marketType);

export const isExactTotalMarkets = (marketType: number) =>
  [10143, 10144, 10145, 10146, 10147, 10148].includes(marketType);

export const isCorrectScoreMarkets = (marketType: number) =>
  [10100].includes(marketType);

export const isSpreadMarkets = (marketType: number) =>
  [
    10001, 10013, 10041, 10042, 10043, 10044, 10045, 10046, 10047, 10048, 10049,
    10071, 10072, 10073, 10074, 10075, 10076, 10077, 10078, 10079,
  ].includes(marketType);

export const isYesNoMarket = (marketType: number) =>
  [
    10009, 10101, 10102, 10103, 10104, 10105, 10106, 10107, 10108, 10109, 10154,
    10131,
  ].includes(marketType);

export const isTeamMarket = (marketType: number) =>
  [10010, 10121, 10122, 10123, 10124].includes(marketType);

export const isTeamMarketWithDraw = (marketType: number) =>
  [
    0, 10001, 10003, 10004, 10006, 10007, 10008, 10009, 10010, 10011, 10012,
    10013, 10015, 10016, 10019, 10020, 10021, 10022, 10023, 10024, 10025, 10026,
    10027, 10028, 10029, 10041, 10042, 10043, 10044, 10045, 10046, 10047, 10048,
    10049, 10051, 10052, 10053, 10054, 10055, 10056, 10057, 10058, 10059, 10071,
    10072, 10073, 10074, 10075, 10076, 10077, 10078, 10079, 10100, 10101, 10102,
    10103, 10104, 10105, 10106, 10107, 10108, 10109, 10121, 10122, 10123, 10124,
    10130, 10131, 10132, 10141, 10142, 10151, 10154, 10155, 10156, 10157, 10158,
    10900, 10901, 10902, 10903, 10904, 10905, 10906, 10907, 11010, 11011, 11012,
    11019, 11029, 11035, 11038, 11039, 11047, 11049, 11051, 11052, 11053, 11055,
    11056, 11057, 11058, 11060, 11086, 11087, 11088, 11097, 11098, 11200, 11201,
  ].includes(marketType);

export const isOddEvenMarket = (marketType: number) =>
  [
    10005, 10081, 10082, 10083, 10084, 10085, 10086, 10087, 10088, 10089, 10091,
    10092, 10093, 10094, 10095, 10096, 10097, 10098, 10099,
  ].includes(marketType);

export const isDoubleChanceMarket = (marketType: number) =>
  [10003, 10015, 10016].includes(marketType);

export const isMethodOfVictoryMarket = (marketType: number) =>
  [10158].includes(marketType);

export const isWinningRoundMarket = (marketType: number) =>
  [10151].includes(marketType);

export const isEndingMethodMarket = (marketType: number) =>
  [10157].includes(marketType);

export const isHalfPeriodMarket = (marketType: number) =>
  [
    10051, 10052, 10053, 10054, 10055, 10056, 10057, 10058, 10059, 10061, 10063,
    10064, 10065, 10066, 10067, 10068, 10069, 10071, 10072, 10073, 10074, 10075,
    10076, 10077, 10078, 10079, 10091, 10092, 10093, 10094, 10095, 10096, 10097,
    10098, 10099, 10118, 10119, 10218, 10219,
  ].includes(marketType);

export const isQuarterPeriodMarket = (marketType: number) =>
  [
    10015, 10016, 10021, 10022, 10023, 10024, 10025, 10026, 10027, 10028, 10029,
    10031, 10032, 10033, 10034, 10035, 10036, 10037, 10038, 10039, 10041, 10042,
    10043, 10044, 10045, 10046, 10047, 10048, 10049, 10062, 10081, 10082, 10083,
    10084, 10085, 10086, 10087, 10088, 10089, 10101, 10102, 10103, 10104, 10105,
    10106, 10107, 10108, 10109, 10111, 10112, 10121, 10122, 10123, 10124, 10145,
    10146, 10147, 10148, 10211, 10212,
  ].includes(marketType);

export const isHomeTeamMarket = (marketType: number) =>
  [10017, 10111, 10118, 10141, 10143, 10145, 10147, 10211, 10218].includes(
    marketType,
  );

export const isAwayTeamMarket = (marketType: number) =>
  [10018, 10112, 10119, 10142, 10144, 10146, 10148, 10212, 10219].includes(
    marketType,
  );

export const isPlayersMarket = (marketType: number) =>
  [11055, 11087, 11088].includes(marketType);

export const isGridViewMarket = (marketType: number) =>
  [10100, 10143, 10144, 10145, 10146, 10147, 10148].includes(marketType);
