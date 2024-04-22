"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { collapasMenu } from '@/lib/utils';
import Modal from "@/components/model";

function DataBaseFiles() {
  const router = useRouter();
  const databasename = usePathname().split('/').filter(Boolean).pop();
  const [isModalOpen, setModalOpen] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [access, setAccess] = useState([]);
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT || process.env.ENDPOINT;

  useEffect(() => {
    collapasMenu();
  }, []);

  const fetchAccess = async () => {
    try {
      const response = await fetch(
        endpoint + `database/get_data_source/?data_source_name=${databasename}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data) {
        setAccess(data.allowlist);
      } else {
        throw new Error("Data format is incorrect");
      }
    } catch (error) {
      console.error("Error fetching access:", error);
    }
  };

  useEffect(() => {
    if (isModalOpen) fetchAccess();
  }, [isModalOpen]);

  const handleAccessSubmit = async (email: string) => {
    try {
      const response = await fetch(
        endpoint +
          `database/data_source_add_user/?data_source_name=${databasename}&user_email=${email}`,
        {
          method: "POST",
          body: "",
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data) {
        fetchAccess();
      } else {
        throw new Error("Data format is incorrect");
      }
    } catch (error) {
      console.error("Error updating access:", error);
    }
  };

  const handleRemoveItem = async (index: number) => {
    try {
      const response = await fetch(
        endpoint +
          `database/data_source_remove_user/?data_source_name=${databasename}&user_email=${access[index]}`,
        {
          method: "POST",
          body: "",
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data) {
        setAccess((prevAccess) => {
          const updatedAccess = [...prevAccess];
          updatedAccess.splice(index, 1);
          return updatedAccess;
        });
      } else {
        throw new Error("Data format is incorrect");
      }
    } catch (error) {
      console.error("Error removing access:", error);
    }
  };

  const handleAddFiles = () => {
    router.push(`/upload?databaseName=${databasename}`)
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endpoint + 'database/data_source_file_names/', {
          params: {
            data_source_name: databasename
          }
        });
        if (response.data) {
          const fetchedFileNames: string[] = Object.values(response.data);
          console.log(fetchedFileNames);
          setFileNames(fetchedFileNames);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  return (
      <div>
        <div className="flex justify-between items-center">
          <div>
            <span className="flex gap-2 mb-6 cursor-pointer" >
            <Link
            href="/database"
            className="flex items-center gap-2 text-gray-500 text-lg hover:text-gray-800 stroke-gray-500 hover:stroke-gray-800"
          >
            <svg
              width="13"
              height="11"
              viewBox="0 0 13 11"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5.5H1M1 5.5L5.125 1.375M1 5.5L5.125 9.625"
                stroke="inherit"
                strokeOpacity="0.5"
                strokeWidth="1.03125"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Databases
          </Link>
            </span>
            <h2 className="mt-2 font-bold text-3xl">View all files in <span className="text-blue-600">{databasename}</span></h2>
          </div>
          <span className="rounded-lg flex gap-6 mb-10">
          <button className="bg-[#461db9] text-white py-2 px-4 gap-3 rounded-lg inline-flex items-center shadow-md" onClick={handleAddFiles}>
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
            Add files
          </button>
        </span>
          
        </div>
        <div className="bg-white shadow-md sm:rounded-lg py-3 px-4 mt-8">
          <div className="relative overflow-x-auto">
            {fileNames.map((fileName, index) => (
                <div key={index} className="px-4 py-5 rounded-md flex justify-between items-center bg-[#F7F7F7]">
                  <span className="px-2 text-md text-white bg-red-500">{fileName.split(".").slice(-1)[0].toUpperCase()}</span>
                  <p className="w-2/5 font-bold">{fileName.length <= 50 ? fileName : (fileName.slice(0, 50) + '...')}</p>
                  <span className="w-20">Size</span>
                  <div className="w-28 text-gray-500">Uploader</div>
                  <span className="text-gray-500">Upload Date</span>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}

export default DataBaseFiles;
