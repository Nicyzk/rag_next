"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Modal from "@/components/model";
import { useRouter, usePathname } from "next/navigation";

const DataBase = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [dataSources, setDataSources] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [databaseName, setDatabaseName] = useState('');
  const [description, setDescription] = useState('');
  const [counts, setCounts] = useState([]);
  const [dates, setDates] = useState([]);
  const [descList, setDescList] = useState([]);

  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT || process.env.ENDPOINT;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!databaseName) {
      console.log("Please provide a name for your database.")
      return;
    }

    const urlParams = { data_source_name: databaseName, description: description};

    const createDatasourceParamsString = new URLSearchParams(urlParams).toString();
    const fullUrl = endpoint + `database/create_data_source/?${createDatasourceParamsString}`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      mode: "no-cors",
    };
    console.log("Create data source with name:", databaseName)

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers
    });

    console.log(response.body)

  };

  function formatDate(dateString) {
    const trimmedDateString = dateString.replace(/(\.\d{3})\d+/,'$1');

    const date = new Date(trimmedDateString);

    const options: Intl.DateTimeFormatOptions = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };

    const formatter = new Intl.DateTimeFormat('default', options);
    return formatter.format(date);
}

  useEffect(() => {
    const fetchDataSources = async () => {
      try {
        const response = await fetch(endpoint + "database/get_data_sources/");

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        if (data && 
            Array.isArray(data.data_source_names) && 
            Array.isArray(data.counts) &&
            Array.isArray(data.created_on) &&
            Array.isArray(data.description)) {

          setDataSources(data.data_source_names);
          setCounts(data.counts);
          setDates(data.created_on);
          setDescList(data.description);
        } else {
          throw new Error("Data format is incorrect");
        }
      } catch (error) {
        console.error("Error fetching data sources:", error);
        setDataSources([]);
        setCounts([]);
        setDates([]);
        setDescList([]);
      }
    };

    fetchDataSources();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="mt-2 font-bold text-3xl">My Database</h2>
        </div>
        <button
          className="flex items-center bg-[#461db9] py-4 px-4 rounded-xl gap-3 text-white"
          onClick={() => setModalOpen(true)}
        >
          <svg
            width="23"
            height="24"
            viewBox="0 0 23 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect y="0.5" width="23" height="23" rx="11.5" fill="white" />
            <path
              d="M11.5 7.5V16.5M7 12H16"
              stroke="#5731C2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Create a new database
        </button>
      </div>
      <div className="bg-white shadow-md sm:rounded-lg py-3 px-4 mt-8">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
            <thead className="text-sm text-gray-700 uppercase border-b border-gray-400 ">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Database name
                </th>
                <th scope="col" className="px-6 py-3">
                  Description
                </th>
                <th scope="col" className="px-6 py-3">
                  # of Files
                </th>
                <th scope="col" className="px-6 py-3">
                  Date Added
                </th>
              </tr>
            </thead>
            <tbody>
            {dataSources.map((item, idx) => (
                item !== "sec" && (
                <tr className="bg-white">
                  <th
                    scope="row"
                    className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap text-[--primary]"
                  >
                  <Link href={`${pathname}/${item}`} title={item}>{item}</Link>
                </th>
                <td className="px-6 py-4">
                    {descList[idx] == null ? "" : descList[idx]}
                </td>
                <td className="px-6 py-4">{counts[idx]}</td>
                <td className="px-6 py-4 text-gray-800 font-bold">
                     {formatDate(dates[idx])}
                </td>
              </tr>
            )))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="font-bold">
          Create a{" "}
          <span className="text-[--primary] font-extrabold">New Database</span>
        </h3>
        <form
          className="mt-5 flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSubmit(e);
            setModalOpen(false);
            router.push(`/upload?databaseName=${databaseName}`)
          }}
        >
          <input
            placeholder="New Database Name"
            className="block w-full p-2 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-[--primary] focus:border-[--primary] outline-none"
            value={databaseName}
            onChange={e => setDatabaseName(e.target.value)}
          />
          <input
            placeholder="DataBase Description"
            className="block w-full p-2 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-[--primary] focus:border-[--primary] outline-none"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <button
            type="submit"
            className="p-2 rounded-lg bg-[--primary] text-white"
          >
            Proceed
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DataBase;
