export type Order={id:string;date:string;customer:string;location:string;item:string;quantity:string;amount:number|null;payment:"paid"|"sent"|"redpacket"|"none";note:string;manual:boolean;version:number;confirmedAt:string|null};
export type LedgerData={group:string;snapshot:string;syncedAt:string|null;dates:string[];orders:Order[];exceptions:{date:string;text:string}[]};
