import React, { useEffect, useState } from "react";
import logo from "../image/logo.jpeg";
import usa_flag from "../image/usa_flag.webp";
import british_flag from "../image/british_flag.png";
import euro_flag from "../image/euro_flag.png";
import axios from "axios";
export default function ForeignExchange() {
  const [fx_rates, setExchangeRates] = useState([]); // initialize exchange rates
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("ETB");
  const [price, setRate] = useState(0);
  const [currentConversion, setCurrentConversion] = useState("Buying");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [isConverted, setIsConverted] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");

  //  fetch from API
  const fetchDataFromWso2 = async () => {
  
    // const url = "https://forex.anbesabank.et/api/daily";
    const url = "https://api-esb.anbesabank.et/api/forex/1.0.0/rates";
    try {
      const response = await axios.get(url);
      if (response.data && response.data.length > 0) {
        setExchangeRates(response.data);
        setError("");
      } else {
        setError("No exchange rates found");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (
          error.response?.status === 403 &&
          error.response?.data === "Invalid CORS request"
        ) {
          setError("Access denied: This request is not allowed by the server.");
          return;
        }
        if (error.code === "ERR_NETWORK" || error.code === "ERR_BAD_RESPONSE") {
          // fetchDataFromLocalServer();
          // return;
          setError("Network error! The server might be down or unreachable.");
        } else if (error.response?.status === 403) {
          // this should not be reachable because the API mustn't has authorization issue
          setError(
            "Access denied: You are not authorized to access this resource."
          );
        } else {
          setError(`Axios error: ${error.message}`);
        }
      } else {
        setError("Something went wrong!");
      }
    }
  };

  // const fetchDataFromForexServer = async () => {
  //   const url = "https://forex.anbesabank.et/api/daily";
  //   try {
  //     const response = await axios.get(url);
  //     if (response.data && response.data.length > 0) {
  //       setExchangeRates(response.data);
  //       setError("");
  //     } else {
  //       setError("No exchange rates found");
  //     }
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       if (error.code === "ERR_NETWORK" || error.code === "ERR_BAD_RESPONSE") {
  //         setError("Network error! The server might be down or unreachable.");
  //       } else if (error.response?.status === 403) {
  //         // this should not be reachable because the API mustn't has authorization issue
  //         setError(
  //           "Access denied: You are not authorized to access this resource."
  //         );
  //       } else {
  //         setError(`Axios error: ${error.message}`);
  //       }
  //     } else {
  //       setError("Something went wrong!");
  //     }
  //   }
  // };
  useEffect(() => {
    const today = new Date();
    setDate(
      today.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    fetchDataFromWso2();
  }, []);
  // Recalculate when amount or currency changes
  useEffect(() => {
    if (amount && fromCurrency && parseFloat(amount) > 0 && price) {
      if (currentConversion === "Buying") {
        const result = parseFloat(amount) * price;
        setConvertedAmount(result.toFixed(2));
        setIsConverted(true);
        return;
      }
      const result = parseFloat(amount) / price;
      setConvertedAmount(result.toFixed(2));
      setIsConverted(true);
    } else {
      setConvertedAmount(null);
      setIsConverted(false);
    }
  }, [amount, fromCurrency, price, currentConversion]);

  // Local =>	Foreign =	Selling Price
  // Foreign =>	Local =	Buying Price
  const handleFromChange = (e) => {
    e.preventDefault();
    if (currentConversion === "Buying") {
      const selectedCurrency = e.target.value;
      setFromCurrency(selectedCurrency);
      const rate = fx_rates.find((r) => r.currencyCode === selectedCurrency);
      if (rate) {
        setRate(rate.buyingPrice);
        if (amount && parseFloat(amount) > 0) {
          const result = parseFloat(amount) * rate.buyingPrice;
          setConvertedAmount(result.toFixed(2));
          setIsConverted(true);
        } else {
          setConvertedAmount(null);
          setIsConverted(false);
        }
      }
      return;
    }
  };
  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };
  const handleClear = () => {
    setAmount("");
    setFromCurrency("");
    setToCurrency("");
    setRate(0);
    setConvertedAmount(null);
    setIsConverted(false);
  };

  const handleFromToToggle = (e) => {
    e.preventDefault();
    setAmount("");
    const nextConversion =
      currentConversion === "Buying" ? "Selling" : "Buying";
    setCurrentConversion(nextConversion);

    if (nextConversion === "Buying") {
      setFromCurrency("");
      setToCurrency("ETB");
    } else {
      setFromCurrency("ETB");
      setToCurrency(""); // important: reset to empty so user must choose
    }
    setRate(0); // clear previous rate
    setConvertedAmount(null); // clear previous result
    setIsConverted(false); // reset flag
  };

  //   Handling selling price
  const handleToChange = (e) => {
    e.preventDefault();
    const selectedCurrency = e.target.value;
    setToCurrency(selectedCurrency);
    setFromCurrency("ETB");
    const rate = fx_rates.find((r) => r.currencyCode === selectedCurrency);
    if (rate) {
      setRate(rate.sellingPrice);
      if (amount && parseFloat(amount) > 0) {
        const result = parseFloat(amount) / rate.sellingPrice;
        setConvertedAmount(result.toFixed(2));
        setIsConverted(true);
      } else {
        setConvertedAmount(null);
        setIsConverted(false);
      }
    }
  };
  if (error) {
    return (
      <div className="w-full h-screen flex flex-col gap-8 items-center justify-center">
        <img src={logo} alt="Logo" className="h-10 md:h-24" />
        <p className="">
          Exchange Rates <span className="text-[#009FD6]">{date}</span>
        </p>
        <h1 className="text-red-500">{error}</h1>
        <button
          onClick={(e) => {
            e.preventDefault();
            fetchData();
          }}
          className=" border bg-white  px-4 py-1 rounded-md shadow-md"
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className=" min-h-screen w-full space-y-8">
      {/* Header */}
      <div className="w-full flex flex-col bg-[#009FD6]  px-8 text-center py-4 md:py-6  items-center justify-center">
        {/* <img
          src={logo}
          alt="Logo"
          className="h-10 md:h-24 object-contain rounded-md shadow-sm"
        /> */}
        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
          Currency <span className="text-white">Exchange</span> Rates{" "}
          <span className="text-[#009FD6] ml-3 text-lg md:text-xl font-semibold align-middle text-white/90">
            {date}
          </span>
        </h1>
      </div>
      {/* Exchange Rate Table */}
      <div className="w-full  px-[2px] md:px-0">
        <table className="w-full p-0 md:w-[85%] lg:md:w-3/4 mx-auto bg-white border rounded-xl overflow-hidden shadow-sm">
          <thead className="bg-[#009FD6]/10 font-extrabold text-left">
            <tr>
              <th className="p-3 font-bold ">Currency</th>
              <th className="p-3 font-bold">Buying in ETB</th>
              <th className="p-3 font-bold">Selling in ETB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fx_rates.map((rate, i) => (
              <tr key={i} className="hover:bg-[#f9f9f9]">
                <td className=" py-2 flex font-semibold items-center gap-1 text-gray-900">
                  <div>
                    <img
                      src={
                        rate.currencyCode === "USD"
                          ? usa_flag
                          : rate.currencyCode === "GBP"
                            ? british_flag
                            : euro_flag
                      }
                      alt=""
                      className="size-8 rounded-full object-center object-cover "
                    />
                  </div>
                  <div>
                    <span className="font-semibold">{rate.currencyCode}</span>
                    <div className="text-sm t text-gray-600">
                      {rate.currencyCode === "USD"
                        ? "US Dollar"
                        : rate.currencyCode === "EUR"
                          ? "Euro"
                          : rate.currencyCode === "GBP"
                            ? "British Pound"
                            : ""}
                    </div>
                  </div>
                </td>
                <td className="p-4 ">{rate.buyingPrice}</td>
                <td className="p-4 ">{rate.sellingPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Conversion Form */}
      <section>
        <h1
          className="w-full md:w-[85%] lg:w-[60%] mx-auto   mb-2 text-center font-bold bg-gradient-to-r
        from-black to-[#009FD6] bg-clip-text text-transparent"
        >
          Calculate
        </h1>
        <div className="w-full md:w-[85%] lg:w-[60%] mx-auto bg-white flex md:flex-row gap-4 items-center px-6 py-2 border rounded-xl shadow-sm justify-between flex-wrap">
          {/* From */}
          {/* Buying */}
          {currentConversion === "Buying" ? (
            <div className="w-full md:w-[60%] flex justify-between items-center relative">
              <div className="max-sm:w-[40%]">
                <h1 className="text-gray-700">From</h1>
                <select
                  value={fromCurrency}
                  onChange={handleFromChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white browser-default"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {fx_rates.map((rate) => (
                    <option key={rate.currencyCode} value={rate.currencyCode}>
                      {rate.currencyCode}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="border border-gray-300 rounded-full px-4 md:px-8 py-1 focus:bg-[#009FD6]/70 focus:text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] sm:-translate-y-[30%] "
                onClick={handleFromToToggle}
              >
                <span className="icon text-blue-500">&#8596;</span>
              </button>
              {/* To */}
              <div className="max-sm:w-[40%]">
                <h1 className="text-gray-700">To</h1>
                <select
                  value={toCurrency}
                  onChange={handleToChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white browser-default"
                >
                  <option value="ETB">ETB</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="w-full md:w-[60%] flex justify-between items-center relative">
              <div className="max-sm:w-[40%]">
                <h1 className="text-gray-700">From</h1>
                <select
                  value={fromCurrency}
                  onChange={handleFromChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white browser-default"
                >
                  <option value="ETB">ETB</option>
                </select>
              </div>
              <button
                className="border border-gray-300 rounded-full px-4 md:px-8 py-1 focus:bg-[#009FD6]/70 focus:text-white absolute top-1/2 left-1/2 -translate-x-1/2 sm:-translate-y-[30%]"
                onClick={handleFromToToggle}
              >
                <span className="icon text-blue-500">&#8596;</span>
              </button>
              {/* To */}
              <div className="max-sm:w-[40%]">
                <h1 className="text-gray-700">To</h1>
                <select
                  value={toCurrency}
                  onChange={handleToChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white browser-default"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {fx_rates.map((rate) => (
                    <option key={rate.currencyCode} value={rate.currencyCode}>
                      {rate.currencyCode}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="max-sm:w-full md:mt-4">
            <input
              type="number"
              min="0"
              placeholder="Amount"
              value={amount}
              onChange={handleAmountChange}
              className="w-full border border-gray-400 rounded-lg px-4 py-2"
            />
          </div>
        </div>
      </section>
      {/* Conversion Result */}
      {isConverted && (
        <div className="w-full md:w-[85%] lg:md:w-3/4 mx-auto ">
          <div className="text-center text-gray-700 text-xl font-medium flex flex-col ">
            <div className="text-2xl md:text-3xl">
              <span className="text">
                {amount} {fromCurrency} ={" "}
              </span>
              <span className="text-[#009FD6] font-bold">
                {convertedAmount} {toCurrency}
              </span>
              <button
                className="self-end text-white ml-4   text-sm align-middle cursor-pointer"
                onClick={handleClear}
              >
                <span className="icon text-gray-600">&#10060;</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
