export interface TboFareBreakdown {
  Currency?: string;
  PassengerType: number; // 1=ADT, 2=CHD, 3=INF
  PassengerCount: number;
  BaseFare: number;
  Tax: number;
  YQTax: number;
  AdditionalTxnFeeOfrd: number;
  AdditionalTxnFeePub: number;
}

export interface TboPassengerFare {
  BaseFare: number;
  Tax: number;
  YQTax: number;
  AdditionalTxnFeeOfrd: number;
  AdditionalTxnFeePub: number;
}

/** TBO PaxType: 1=Adult, 2=Child, 3=Infant */
export type TboPaxType = 1 | 2 | 3;

/**
 * Derives a single-passenger fare by dividing the FareBreakdown bucket
 * by PassengerCount. Sending total fares causes TBO to reject the booking.
 */
export function buildPassengerFare(
  fareBreakdown: TboFareBreakdown[],
  passengerType: TboPaxType,
): TboPassengerFare {
  const bd = fareBreakdown.find((b) => b.PassengerType === passengerType);
  if (!bd) {
    return { BaseFare: 0, Tax: 0, YQTax: 0, AdditionalTxnFeeOfrd: 0, AdditionalTxnFeePub: 0 };
  }
  const n = Math.max(1, bd.PassengerCount);
  return {
    BaseFare: bd.BaseFare / n,
    Tax: bd.Tax / n,
    YQTax: bd.YQTax / n,
    AdditionalTxnFeeOfrd: bd.AdditionalTxnFeeOfrd / n,
    AdditionalTxnFeePub: bd.AdditionalTxnFeePub / n,
  };
}
