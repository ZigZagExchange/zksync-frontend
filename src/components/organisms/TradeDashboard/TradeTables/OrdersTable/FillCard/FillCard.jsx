import React, { useRef } from "react";
import api from "lib/api";
import QRCode from "qrcode.react";
import { XIcon, SaveAsIcon } from "@heroicons/react/solid";
import useTheme from "components/hooks/useTheme";
import classNames from "classnames";

import {
  exportComponentAsJPEG,
  exportComponentAsPDF,
  exportComponentAsPNG,
} from "react-component-export-image";

import logo from "assets/images/logo.png";

const FillCard = ({ fill, closeToast }) => {
  const { isDark } = useTheme();
  const componentRef = useRef();
  const tradeId = fill[1];
  const market = fill[2];
  const fillstatus = fill[6];
  const feeamount = fill[10];
  const feetoken = fill[11];
  const side = fill[3];
  let feeText = "1 USDC";
  const marketInfo = api.marketInfo[market];
  if (feeamount && feetoken) {
    const displayFee =
      feeamount > 9999 ? feeamount.toFixed(0) : feeamount.toPrecision(4);
    feeText = feeamount !== 0 ? `${displayFee} ${feetoken}` : "--";
  } else if (["b", "o", "m", "r", "e"].includes(fillstatus)) {
    feeText = "--";
    // cases below make it backward compatible:
  } else if (!marketInfo) {
    feeText = "1 USDC";
  } else if (fillstatus === "r" || !api.isZksyncChain()) {
    feeText = "0 " + marketInfo.baseAsset.symbol;
  } else if (side === "s") {
    feeText = marketInfo.baseFee + " " + marketInfo.baseAsset.symbol;
  } else if (side === "b") {
    feeText = marketInfo.quoteFee + " " + marketInfo.quoteAsset.symbol;
  }

  const downloadQRCode = () => {
    exportComponentAsPNG(componentRef, { fileName: tradeId });
  };

  const getHashViewURL = () => {
    let baseExplorerUrl;
    switch (api.apiProvider.network) {
      case 1001:
        baseExplorerUrl = "https://goerli.voyager.online/tx/";
        break;
      case 1000:
        baseExplorerUrl = "https://rinkeby.zkscan.io/explorer/transactions/";
        break;
      case 1:
      default:
        baseExplorerUrl = "https://zkscan.io/explorer/transactions/";
    }
    return baseExplorerUrl;
  };

  return (
    <div ref={componentRef} className={classNames({ dark: isDark })}>
      <div className="dark:bg-[#2B2E4A] bg-[#ddf1f7] border dark:border-foreground-400 border-slate-300 shadow-lg rounded-lg p-4">
        <div className="flex justify-between pb-3 border-b dark:border-foreground-500 border-slate-300">
          <div className="flex items-center gap-3 text-xl font-semibold dark:text-foreground-900 text-background-900 font-work">
            <img src={logo} alt="logo" className="w-6" />
            <p>
              {fill[2]} {fill[3] === "b" ? "Buy" : "Sell"} Order Success
            </p>
          </div>
          <XIcon
            className="w-5 dark:text-foreground-900 text-background-900 hover:opacity-75"
            onClick={closeToast}
          />
        </div>
        <div className="pt-3">
          <p className="font-normal font-work dark:text-foreground-900 text-background-900">
            Use the Trade ID to identify old trades.
          </p>
          <div className="flex items-start gap-6 mt-3">
            {/* <img src={QR} alt="QR" className="w-36" /> */}
            <div className="p-3 rounded-lg bg-foreground-900">
              <QRCode
                id="qrCodeEl"
                size={120}
                value={"https://info.zigzag.exchange"}
              />
            </div>
            <div>
              <div className="flex gap-2 text-sm font-normal font-work dark:text-foreground-900 text-background-900">
                Trade ID:{" "}
                <button
                  onClick={() => {
                    window.open(getHashViewURL() + fill[1], "_blank");
                  }}
                  className="flex items-center gap-2 text-sm font-semibold underline hover:no-underline text-primary-900 underline-offset-1 font-work"
                >
                  #{fill[1]}
                </button>
                <SaveAsIcon
                  className="w-4 hover:opacity-80 text-primary-900"
                  onClick={() => {
                    navigator.clipboard.writeText(fill[1]);
                  }}
                />
              </div>
              <div className="mt-3 text-sm font-normal font-work dark:text-foreground-900 text-background-900">
                Average buy price:
                <span className="font-bold">
                  {" "}
                  {fill[4]?.toPrecision(6) / 1}
                </span>
              </div>
              <div className="mt-3 text-sm font-normal font-work dark:text-foreground-900 text-background-900">
                Amount:
                <span className="font-bold">
                  {" "}
                  {fill[5]?.toPrecision(6) / 1}{" "}
                  {marketInfo && marketInfo.baseAsset.symbol}
                </span>
              </div>
              <div className="mt-3 text-sm font-normal font-work dark:text-foreground-900 text-background-900">
                Fee:
                <span className="font-bold"> {feeText}</span>
              </div>
              <button
                className="mt-2 text-sm font-semibold text-primary-900 hover:underline hover:underline-offset-1 font-work"
                onClick={downloadQRCode}
              >
                Save as Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillCard;
