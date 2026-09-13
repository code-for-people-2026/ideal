import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title: "每日对账", description: "群订单与每日收款核对", robots: {index:false,follow:false}};
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) {return <html lang="zh-CN"><body>{children}</body></html>}
